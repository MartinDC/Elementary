/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./source/display.ts":
/*!***************************!*\
  !*** ./source/display.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
class Display {
    init(config, container, id) {
        if (!container) {
            container = 'game-view';
        }
        if (!id) {
            id = 'game-canvas';
        }
        this.elementaryconfig = config;
        const [canvas, context] = this.createHDPICanvasElement(container, id);
        this.context = context;
        this.canvas = canvas;
    }
    render(generations) {
        if (!this.elementaryconfig) {
            throw 'ElemntaryConfig has to be set if the grid should be canvas rendered';
        }
        if (!generations) {
            throw 'Illegal state - Display grid is undefined';
        }
        const ratio = this.elementaryconfig.ratio;
        const gridwidth = this.elementaryconfig.width;
        const configsize = this.elementaryconfig.cellsize;
        let cellw = ratio ? this.canvas.width / gridwidth : configsize;
        let cellh = ratio ? this.canvas.width / gridwidth : configsize;
        generations.forEach((gen, year) => {
            gen.forEach((cell, gridcell) => {
                this.context.fillStyle = cell ? this.elementaryconfig.cellcolorOn : this.elementaryconfig.cellcolorOff;
                this.context.fillRect(gridcell * cellw, year * cellh, cellw, cellh);
            });
        });
    }
    createHDPICanvasElement(container, id = undefined) {
        const canvascontainer = document.getElementById(container);
        const canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        const devicepixelratio = window.devicePixelRatio || 1;
        const crect = canvascontainer.getBoundingClientRect();
        canvas.width = crect.width * devicepixelratio;
        canvas.height = crect.height * devicepixelratio;
        ctx.scale(devicepixelratio, devicepixelratio);
        ctx.translate(0.5, 0.5);
        ctx.imageSmoothingEnabled = false;
        if (id) {
            canvas.id = id;
        }
        canvascontainer.appendChild(canvas);
        return [canvas, ctx];
    }
}
exports.Display = Display;


/***/ }),

/***/ "./source/dom.ts":
/*!***********************!*\
  !*** ./source/dom.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
class ElementaryDom {
    renderSelectionPrompts(selection) {
        const selectionContainer = elementaryElementFactory.with(document).byId('selection-view').element;
        const gameContainer = elementaryElementFactory.with(document).byId('game-view').element;
        if (!selectionContainer) {
            throw 'Failed to load selection selectionContainer - this is a fatal error';
        }
        const fragmentRoot = document.createDocumentFragment();
        const [container, input, submit, notifier] = this.buildElements(fragmentRoot);
        if (selection) {
            submit.addEventListener('click', () => {
                const rule = parseInt(input.value);
                if (rule >= 0 && rule < Math.pow(2, 8)) {
                    container.classList.add('display-none');
                    gameContainer.classList.remove('display-none');
                    return selection(rule);
                }
                notifier.classList.toggle('display-none');
            });
        }
        selectionContainer.append(fragmentRoot);
    }
    buildElements(context) {
        const ruleInputContainer = elementaryElementFactory.with(context).make('div').css('rule-card', 'pt-normal').element;
        const inputPrompt = elementaryElementFactory.with(ruleInputContainer).make('input').attr({ 'type': 'text' }).css('rule-input').element;
        const submitButton = elementaryElementFactory.with(ruleInputContainer).make('button').attr({ 'type': 'button' }).css('rule-btn').text('Go!').element;
        const notifier = elementaryElementFactory.with(ruleInputContainer).make('small').css('rule-notification', 'd-block', 'display-none').text('Please input a value between 0 and 255').element;
        return [
            ruleInputContainer, inputPrompt, submitButton, notifier
        ];
    }
}
exports.ElementaryDom = ElementaryDom;
const elementaryElementFactory = {
    context: undefined,
    element: undefined,
    byClass: function (selector) {
        return this._self(() => {
            this.element = this.context.querySelector(`.${selector}`);
        });
    },
    byId: function (selector) {
        return this._self(() => {
            this.element = this.context.querySelector(`#${selector}`);
        });
    },
    make: function (tag) {
        return this._self(() => {
            this.element = this.context.appendChild(document.createElement(tag));
        });
    },
    text: function (text) {
        return this._self(() => {
            this.element.innerText = text;
        });
    },
    css: function (...tokens) {
        return this._self(() => {
            this.element.classList.add(...tokens);
        });
    },
    attr: function (attrs) {
        return this._self(() => {
            for (var token in attrs) {
                this.element.setAttribute(token, attrs[token]);
            }
        });
    },
    with: function (context) {
        return this._self(() => {
            this.element = context.getRootNode();
            this.context = context;
        });
    },
    _self: function (context) {
        context();
        return this;
    }
};


/***/ }),

/***/ "./source/elementary.ts":
/*!******************************!*\
  !*** ./source/elementary.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
class Elementary {
    bootstrapApplication(config) {
        this.elementaryconfig = config;
        this.generations = new Array();
        this.grid = new Array();
        return this;
    }
    animate(onSuccess) {
        const firstgen = new Array(this.elementaryconfig.generations).fill(0, 0, this.elementaryconfig.width);
        firstgen.fill(1, this.elementaryconfig.width / 2, this.elementaryconfig.width / 2 + 1);
        this.generations.push(firstgen);
        const tick = () => {
            this.grid = this.currentGeneration();
            this.generations.push(this.step());
            let nextGeneration = this.generations.length < this.elementaryconfig.generations;
            if (nextGeneration) {
                window.requestAnimationFrame(tick);
            }
            onSuccess(this.generations);
        };
        window.requestAnimationFrame(tick);
    }
    step() {
        const nextgrid = [];
        this.grid.forEach((_, gridcell) => {
            const n = this.neighbours(gridcell);
            if (!n && n < 0) {
                throw `Illegal state: ${gridcell}`;
            }
            nextgrid[gridcell] = this.rule(n);
        });
        return nextgrid;
    }
    neighbours(cell) {
        if (cell < 0 || cell > this.elementaryconfig.width) {
            return 0;
        }
        const r = this.grid[cell + 1 >= this.elementaryconfig.width ? 0 : cell + 1];
        const l = this.grid[cell - 1 <= 0 ? 0 : cell - 1];
        return 0xf & (r << 2 | this.grid[cell] << 1 | l);
    }
    rule(index) { return this.elementaryconfig.ruleset[this.elementaryconfig.neighbourRules[index]]; }
    currentGeneration() { return this.generations.slice(-1)[0]; }
    generation(year) { return this.generations[year]; }
    changeRuleset(rdecimal) {
        const dtob = (n) => { return rdecimal >> n & 0x1; };
        this.elementaryconfig.ruleset = [dtob(7), dtob(6), dtob(5), dtob(4), dtob(3), dtob(2), dtob(1), dtob(0)];
        return this;
    }
}
exports.Elementary = Elementary;


/***/ }),

/***/ "./source/main.ts":
/*!************************!*\
  !*** ./source/main.ts ***!
  \************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
const display_1 = __webpack_require__(/*! ./display */ "./source/display.ts");
const dom_1 = __webpack_require__(/*! ./dom */ "./source/dom.ts");
const elementary_1 = __webpack_require__(/*! ./elementary */ "./source/elementary.ts");
class ElementaryConfig {
}
__webpack_unused_export__ = ElementaryConfig;
;
exports.elementaryConfig = {
    neighbourRules: [7, 6, 5, 4, 3, 2, 1, 0],
    ruleset: [0, 0, 0, 1, 1, 1, 1, 0],
    generations: 1000,
    cellsize: 5,
    width: 1000,
    ratio: true,
    container: '#elementary-container',
    cellcolorOff: 'rgb(132, 208, 212)',
    cellcolorOn: 'rgb(87, 91, 107)',
};
class ElementaryMain {
    constructor() {
        this.elementaryDom = new dom_1.ElementaryDom();
        this.display = new display_1.Display();
    }
    runSimulation(config) {
        const defaultConfig = config || exports.elementaryConfig;
        const elementary = new elementary_1.Elementary().bootstrapApplication(defaultConfig);
        this.elementaryDom.renderSelectionPrompts((rule) => {
            this.display.init(defaultConfig);
            elementary.changeRuleset(rule).animate((generations) => {
                this.display.render(generations);
            });
        });
    }
}
__webpack_unused_export__ = ElementaryMain;
new ElementaryMain().runSimulation();


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./source/main.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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WCxLQUFLLEVBQUUsSUFBSTtJQUVYLEtBQUssRUFBRSxJQUFJO0lBQ1gsU0FBUyxFQUFFLHVCQUF1QjtJQUNsQyxZQUFZLEVBQUUsb0JBQW9CO0lBQ2xDLFdBQVcsRUFBRSxrQkFBa0I7Q0FDbEMsQ0FBQztBQUVGLE1BQWEsY0FBYztJQUEzQjtRQUNZLGtCQUFhLEdBQWtCLElBQUksbUJBQWEsRUFBRSxDQUFDO1FBQ25ELFlBQU8sR0FBWSxJQUFJLGlCQUFPLEVBQUUsQ0FBQztJQWE3QyxDQUFDO0lBWEcsYUFBYSxDQUFDLE1BQXlCO1FBQ25DLE1BQU0sYUFBYSxHQUFHLE1BQU0sSUFBSSx3QkFBZ0IsQ0FBQztRQUNqRCxNQUFNLFVBQVUsR0FBRyxJQUFJLHVCQUFVLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUV4RSxJQUFJLENBQUMsYUFBYSxDQUFDLHNCQUFzQixDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDL0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDakMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRTtnQkFDbkQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDckMsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQWZELDJDQWVDO0FBRUQsSUFBSSxjQUFjLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQzs7Ozs7OztVQ3BFckM7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7OztVRXRCQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2VsZW1lbnRhcnkvLi9zb3VyY2UvZGlzcGxheS50cyIsIndlYnBhY2s6Ly9lbGVtZW50YXJ5Ly4vc291cmNlL2RvbS50cyIsIndlYnBhY2s6Ly9lbGVtZW50YXJ5Ly4vc291cmNlL2VsZW1lbnRhcnkudHMiLCJ3ZWJwYWNrOi8vZWxlbWVudGFyeS8uL3NvdXJjZS9tYWluLnRzIiwid2VicGFjazovL2VsZW1lbnRhcnkvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZWxlbWVudGFyeS93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL2VsZW1lbnRhcnkvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL2VsZW1lbnRhcnkvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEVsZW1lbnRhcnlDb25maWcgfSBmcm9tIFwiLi9tYWluXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgRGlzcGxheSB7XHJcbiAgICBwdWJsaWMgY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xyXG4gICAgcHVibGljIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQ7XHJcblxyXG4gICAgcHJpdmF0ZSBlbGVtZW50YXJ5Y29uZmlnOiBFbGVtZW50YXJ5Q29uZmlnO1xyXG5cclxuICAgIHB1YmxpYyBpbml0KGNvbmZpZzogRWxlbWVudGFyeUNvbmZpZywgY29udGFpbmVyPzogc3RyaW5nLCBpZD86IHN0cmluZykge1xyXG4gICAgICAgIGlmICghY29udGFpbmVyKSB7IGNvbnRhaW5lciA9ICdnYW1lLXZpZXcnOyB9XHJcbiAgICAgICAgaWYgKCFpZCkgeyBpZCA9ICdnYW1lLWNhbnZhcyc7IH1cclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50YXJ5Y29uZmlnID0gY29uZmlnO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGNvbnN0IFtjYW52YXMsIGNvbnRleHRdID0gdGhpcy5jcmVhdGVIRFBJQ2FudmFzRWxlbWVudChjb250YWluZXIsIGlkKTtcclxuICAgICAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xyXG4gICAgICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByZW5kZXIoZ2VuZXJhdGlvbnM6IEFycmF5PEFycmF5PG51bWJlcj4+KSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmVsZW1lbnRhcnljb25maWcpIHsgdGhyb3cgJ0VsZW1udGFyeUNvbmZpZyBoYXMgdG8gYmUgc2V0IGlmIHRoZSBncmlkIHNob3VsZCBiZSBjYW52YXMgcmVuZGVyZWQnOyB9XHJcbiAgICAgICAgaWYgKCFnZW5lcmF0aW9ucykgeyB0aHJvdyAnSWxsZWdhbCBzdGF0ZSAtIERpc3BsYXkgZ3JpZCBpcyB1bmRlZmluZWQnOyB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJhdGlvID0gdGhpcy5lbGVtZW50YXJ5Y29uZmlnLnJhdGlvO1xyXG4gICAgICAgIGNvbnN0IGdyaWR3aWR0aCA9IHRoaXMuZWxlbWVudGFyeWNvbmZpZy53aWR0aDtcclxuICAgICAgICBjb25zdCBjb25maWdzaXplID0gdGhpcy5lbGVtZW50YXJ5Y29uZmlnLmNlbGxzaXplO1xyXG5cclxuICAgICAgICBsZXQgY2VsbHcgPSByYXRpbyA/IHRoaXMuY2FudmFzLndpZHRoIC8gZ3JpZHdpZHRoIDogY29uZmlnc2l6ZTtcclxuICAgICAgICBsZXQgY2VsbGggPSByYXRpbyA/IHRoaXMuY2FudmFzLndpZHRoIC8gZ3JpZHdpZHRoIDogY29uZmlnc2l6ZTtcclxuXHJcbiAgICAgICAgZ2VuZXJhdGlvbnMuZm9yRWFjaCgoZ2VuLCB5ZWFyKSA9PiB7XHJcbiAgICAgICAgICAgIGdlbi5mb3JFYWNoKChjZWxsLCBncmlkY2VsbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZXh0LmZpbGxTdHlsZSA9IGNlbGwgPyB0aGlzLmVsZW1lbnRhcnljb25maWcuY2VsbGNvbG9yT24gOiB0aGlzLmVsZW1lbnRhcnljb25maWcuY2VsbGNvbG9yT2ZmO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZXh0LmZpbGxSZWN0KGdyaWRjZWxsICogY2VsbHcsIHllYXIgKiBjZWxsaCwgY2VsbHcsIGNlbGxoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjcmVhdGVIRFBJQ2FudmFzRWxlbWVudChjb250YWluZXI6IHN0cmluZywgaWQ6IHN0cmluZyA9IHVuZGVmaW5lZCk6IFtIVE1MQ2FudmFzRWxlbWVudCwgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEXSB7XHJcbiAgICAgICAgY29uc3QgY2FudmFzY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY29udGFpbmVyKTtcclxuICAgICAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKSBhcyBIVE1MQ2FudmFzRWxlbWVudDtcclxuICAgICAgICBsZXQgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcblxyXG4gICAgICAgIGNvbnN0IGRldmljZXBpeGVscmF0aW8gPSB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyB8fCAxO1xyXG4gICAgICAgIGNvbnN0IGNyZWN0ID0gY2FudmFzY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuICAgICAgICBjYW52YXMud2lkdGggPSBjcmVjdC53aWR0aCAqIGRldmljZXBpeGVscmF0aW87XHJcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IGNyZWN0LmhlaWdodCAqIGRldmljZXBpeGVscmF0aW87XHJcbiAgICAgICAgY3R4LnNjYWxlKGRldmljZXBpeGVscmF0aW8sIGRldmljZXBpeGVscmF0aW8pO1xyXG4gICAgICAgIGN0eC50cmFuc2xhdGUoMC41LCAwLjUpO1xyXG5cclxuICAgICAgICBjdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGlmIChpZCkgeyBjYW52YXMuaWQgPSBpZDsgfVxyXG4gICAgICAgIGNhbnZhc2NvbnRhaW5lci5hcHBlbmRDaGlsZChjYW52YXMpO1xyXG4gICAgICAgIHJldHVybiBbY2FudmFzLCBjdHhdO1xyXG4gICAgfVxyXG59IiwiZGVjbGFyZSB0eXBlIEVsZW1lbnRhcnlLZXlWYWx1ZSA9IHtcclxuICAgIGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nXHJcbn1cclxuXHJcbmRlY2xhcmUgdHlwZSBFbGVtZW50YXJ5RWxlbWVudCA9IHtcclxuICAgIGNvbnRleHQ6IERvY3VtZW50RnJhZ21lbnQgfCBIVE1MRWxlbWVudCxcclxuICAgIGVsZW1lbnQ6IEhUTUxFbGVtZW50LFxyXG5cclxuICAgIGJ5SWQ6IChzZWxlY3Rvcjogc3RyaW5nKSA9PiBFbGVtZW50YXJ5RWxlbWVudCxcclxuICAgIGJ5Q2xhc3M6IChzZWxlY3Rvcjogc3RyaW5nKSA9PiBFbGVtZW50YXJ5RWxlbWVudCxcclxuICAgIHdpdGg6IChjb250ZXh0OiBEb2N1bWVudEZyYWdtZW50IHwgSFRNTEVsZW1lbnQpID0+IEVsZW1lbnRhcnlFbGVtZW50LFxyXG5cclxuICAgIGNzczogKC4uLnRva2Vuczogc3RyaW5nW10pID0+IEVsZW1lbnRhcnlFbGVtZW50LFxyXG4gICAgYXR0cjogKGF0dHJzOiBhbnkpID0+IEVsZW1lbnRhcnlFbGVtZW50LFxyXG4gICAgdGV4dDogKHRleHQ6IHN0cmluZykgPT4gRWxlbWVudGFyeUVsZW1lbnQsXHJcbiAgICBtYWtlOiAodGFnOiBzdHJpbmcpID0+IEVsZW1lbnRhcnlFbGVtZW50LFxyXG4gICAgX3NlbGY6IChjb250ZXh0OiAoKSA9PiBhbnkpID0+IEVsZW1lbnRhcnlFbGVtZW50LFxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgRWxlbWVudGFyeURvbSB7XHJcbiAgICByZW5kZXJTZWxlY3Rpb25Qcm9tcHRzKHNlbGVjdGlvbjogKHY6IG51bWJlcikgPT4gdm9pZCkge1xyXG4gICAgICAgIGNvbnN0IHNlbGVjdGlvbkNvbnRhaW5lciA9IGVsZW1lbnRhcnlFbGVtZW50RmFjdG9yeS53aXRoKGRvY3VtZW50KS5ieUlkKCdzZWxlY3Rpb24tdmlldycpLmVsZW1lbnQ7XHJcbiAgICAgICAgY29uc3QgZ2FtZUNvbnRhaW5lciA9IGVsZW1lbnRhcnlFbGVtZW50RmFjdG9yeS53aXRoKGRvY3VtZW50KS5ieUlkKCdnYW1lLXZpZXcnKS5lbGVtZW50O1xyXG4gICAgICAgIGlmICghc2VsZWN0aW9uQ29udGFpbmVyKSB7IHRocm93ICdGYWlsZWQgdG8gbG9hZCBzZWxlY3Rpb24gc2VsZWN0aW9uQ29udGFpbmVyIC0gdGhpcyBpcyBhIGZhdGFsIGVycm9yJzsgfVxyXG5cclxuICAgICAgICBjb25zdCBmcmFnbWVudFJvb3QgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XHJcbiAgICAgICAgY29uc3QgW2NvbnRhaW5lciwgaW5wdXQsIHN1Ym1pdCwgbm90aWZpZXJdID0gdGhpcy5idWlsZEVsZW1lbnRzKGZyYWdtZW50Um9vdCk7XHJcblxyXG4gICAgICAgIGlmIChzZWxlY3Rpb24pIHtcclxuICAgICAgICAgICAgc3VibWl0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcnVsZSA9IHBhcnNlSW50KChpbnB1dCBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAocnVsZSA+PSAwICYmIHJ1bGUgPCBNYXRoLnBvdygyLCA4KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdkaXNwbGF5LW5vbmUnKTtcclxuICAgICAgICAgICAgICAgICAgICBnYW1lQ29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoJ2Rpc3BsYXktbm9uZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxlY3Rpb24ocnVsZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRWxzZSB3ZSBoYXZlIGEgZXJyb3IsIHNvIGRpc3BsYXkgbm90aWZpZXJcclxuICAgICAgICAgICAgICAgIG5vdGlmaWVyLmNsYXNzTGlzdC50b2dnbGUoJ2Rpc3BsYXktbm9uZScpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2VsZWN0aW9uQ29udGFpbmVyLmFwcGVuZChmcmFnbWVudFJvb3QpO1xyXG4gICAgfVxyXG5cclxuICAgIGJ1aWxkRWxlbWVudHMoY29udGV4dDogRG9jdW1lbnRGcmFnbWVudCkgOiBIVE1MRWxlbWVudFtdIHtcclxuICAgICAgICBjb25zdCBydWxlSW5wdXRDb250YWluZXIgPSBlbGVtZW50YXJ5RWxlbWVudEZhY3Rvcnkud2l0aChjb250ZXh0KS5tYWtlKCdkaXYnKS5jc3MoJ3J1bGUtY2FyZCcsICdwdC1ub3JtYWwnKS5lbGVtZW50O1xyXG4gICAgICAgIGNvbnN0IGlucHV0UHJvbXB0ID0gZWxlbWVudGFyeUVsZW1lbnRGYWN0b3J5LndpdGgocnVsZUlucHV0Q29udGFpbmVyKS5tYWtlKCdpbnB1dCcpLmF0dHIoeyAndHlwZSc6ICd0ZXh0JyB9KS5jc3MoJ3J1bGUtaW5wdXQnKS5lbGVtZW50O1xyXG4gICAgICAgIGNvbnN0IHN1Ym1pdEJ1dHRvbiA9IGVsZW1lbnRhcnlFbGVtZW50RmFjdG9yeS53aXRoKHJ1bGVJbnB1dENvbnRhaW5lcikubWFrZSgnYnV0dG9uJykuYXR0cih7ICd0eXBlJzogJ2J1dHRvbicgfSkuY3NzKCdydWxlLWJ0bicpLnRleHQoJ0dvIScpLmVsZW1lbnQ7XHJcbiAgICAgICAgY29uc3Qgbm90aWZpZXIgPSBlbGVtZW50YXJ5RWxlbWVudEZhY3Rvcnkud2l0aChydWxlSW5wdXRDb250YWluZXIpLm1ha2UoJ3NtYWxsJykuY3NzKCdydWxlLW5vdGlmaWNhdGlvbicsICdkLWJsb2NrJywgJ2Rpc3BsYXktbm9uZScpLnRleHQoJ1BsZWFzZSBpbnB1dCBhIHZhbHVlIGJldHdlZW4gMCBhbmQgMjU1JykuZWxlbWVudDtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICBydWxlSW5wdXRDb250YWluZXIsIGlucHV0UHJvbXB0LCBzdWJtaXRCdXR0b24sIG5vdGlmaWVyXHJcbiAgICAgICAgXTtcclxuICAgIH1cclxufVxyXG5cclxuLy8gVE9ETyB0aGlzIGlzIGluIGEgaG9ycmlibGUgc3RhdGVcclxuY29uc3QgZWxlbWVudGFyeUVsZW1lbnRGYWN0b3J5OiBFbGVtZW50YXJ5RWxlbWVudCA9IHtcclxuICAgIGNvbnRleHQ6IHVuZGVmaW5lZCxcclxuICAgIGVsZW1lbnQ6IHVuZGVmaW5lZCxcclxuXHJcbiAgICBieUNsYXNzOiBmdW5jdGlvbiAoc2VsZWN0b3I6IHN0cmluZyk6IEVsZW1lbnRhcnlFbGVtZW50IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2VsZigoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudCA9IHRoaXMuY29udGV4dC5xdWVyeVNlbGVjdG9yKGAuJHtzZWxlY3Rvcn1gKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBieUlkOiBmdW5jdGlvbiAoc2VsZWN0b3I6IHN0cmluZyk6IEVsZW1lbnRhcnlFbGVtZW50IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2VsZigoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudCA9IHRoaXMuY29udGV4dC5xdWVyeVNlbGVjdG9yKGAjJHtzZWxlY3Rvcn1gKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBtYWtlOiBmdW5jdGlvbiAodGFnOiBzdHJpbmcpOiBFbGVtZW50YXJ5RWxlbWVudCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbGYoKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQgPSB0aGlzLmNvbnRleHQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICB0ZXh0OiBmdW5jdGlvbiAodGV4dDogc3RyaW5nKTogRWxlbWVudGFyeUVsZW1lbnQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZWxmKCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmlubmVyVGV4dCA9IHRleHQ7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgY3NzOiBmdW5jdGlvbiAoLi4udG9rZW5zOiBzdHJpbmdbXSk6IEVsZW1lbnRhcnlFbGVtZW50IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2VsZigoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKC4uLnRva2Vucyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgYXR0cjogZnVuY3Rpb24gKGF0dHJzOiBhbnkpOiBFbGVtZW50YXJ5RWxlbWVudCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbGYoKCkgPT4ge1xyXG4gICAgICAgICAgICBmb3IgKHZhciB0b2tlbiBpbiBhdHRycykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSh0b2tlbiwgYXR0cnNbdG9rZW5dKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIHdpdGg6IGZ1bmN0aW9uIChjb250ZXh0OiBEb2N1bWVudEZyYWdtZW50IHwgSFRNTEVsZW1lbnQpOiBFbGVtZW50YXJ5RWxlbWVudCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbGYoKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQgPSBjb250ZXh0LmdldFJvb3ROb2RlKCkgYXMgSFRNTEVsZW1lbnQ7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIF9zZWxmOiBmdW5jdGlvbiAoY29udGV4dDogKCkgPT4gRWxlbWVudGFyeUVsZW1lbnQpOiBFbGVtZW50YXJ5RWxlbWVudCB7XHJcbiAgICAgICAgY29udGV4dCgpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgRWxlbWVudGFyeUNvbmZpZyB9IGZyb20gXCIuL21haW5cIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBFbGVtZW50YXJ5IHtcclxuICAgIHByaXZhdGUgZWxlbWVudGFyeWNvbmZpZzogRWxlbWVudGFyeUNvbmZpZ1xyXG4gICAgcHJpdmF0ZSBnZW5lcmF0aW9uczogQXJyYXk8QXJyYXk8bnVtYmVyPj47XHJcbiAgICBwcml2YXRlIGdyaWQ6IEFycmF5PG51bWJlcj47XHJcblxyXG4gICAgYm9vdHN0cmFwQXBwbGljYXRpb24oY29uZmlnOiBFbGVtZW50YXJ5Q29uZmlnKTogRWxlbWVudGFyeSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50YXJ5Y29uZmlnID0gY29uZmlnO1xyXG5cclxuICAgICAgICB0aGlzLmdlbmVyYXRpb25zID0gbmV3IEFycmF5PEFycmF5PG51bWJlcj4+KCk7XHJcbiAgICAgICAgdGhpcy5ncmlkID0gbmV3IEFycmF5PG51bWJlcj4oKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFuaW1hdGUgdGhlIHN0ZXAgY29sY3VsYXRpb24sIHJ1biB1bnRpbGwgc3BlY2lmaWVkIGFtb3VudCBvZiBnZW5lcmF0aW9ucyBoYXMgcGFzc2VkLlxyXG4gICAgICovXHJcbiAgICBhbmltYXRlKG9uU3VjY2VzczogKGdlbmVyYXRpb25zOiBBcnJheTxBcnJheTxudW1iZXI+PikgPT4gdm9pZCkge1xyXG4gICAgICAgIGNvbnN0IGZpcnN0Z2VuID0gbmV3IEFycmF5PG51bWJlcj4odGhpcy5lbGVtZW50YXJ5Y29uZmlnLmdlbmVyYXRpb25zKS5maWxsKDAsIDAsIHRoaXMuZWxlbWVudGFyeWNvbmZpZy53aWR0aCk7XHJcbiAgICAgICAgZmlyc3RnZW4uZmlsbCgxLCB0aGlzLmVsZW1lbnRhcnljb25maWcud2lkdGggLyAyLCB0aGlzLmVsZW1lbnRhcnljb25maWcud2lkdGggLyAyICsgMSk7XHJcbiAgICAgICAgdGhpcy5nZW5lcmF0aW9ucy5wdXNoKGZpcnN0Z2VuKTtcclxuXHJcbiAgICAgICAgY29uc3QgdGljayA9ICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5ncmlkID0gdGhpcy5jdXJyZW50R2VuZXJhdGlvbigpO1xyXG4gICAgICAgICAgICB0aGlzLmdlbmVyYXRpb25zLnB1c2godGhpcy5zdGVwKCkpO1xyXG5cclxuICAgICAgICAgICAgbGV0IG5leHRHZW5lcmF0aW9uID0gdGhpcy5nZW5lcmF0aW9ucy5sZW5ndGggPCB0aGlzLmVsZW1lbnRhcnljb25maWcuZ2VuZXJhdGlvbnM7XHJcbiAgICAgICAgICAgIGlmIChuZXh0R2VuZXJhdGlvbikgeyB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRpY2spOyB9XHJcbiAgICAgICAgICAgIG9uU3VjY2Vzcyh0aGlzLmdlbmVyYXRpb25zKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRpY2spO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBcclxuICAgICogUGVyZm9ybSBhIHN0ZXAsIGNhbGN1bGF0ZSBvbmUgZ2VuZXJhdGlvbi5cclxuICAgICovXHJcbiAgICBzdGVwKCk6IG51bWJlcltdIHtcclxuICAgICAgICBjb25zdCBuZXh0Z3JpZDogbnVtYmVyW10gPSBbXTtcclxuICAgICAgICB0aGlzLmdyaWQuZm9yRWFjaCgoXywgZ3JpZGNlbGwpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgbiA9IHRoaXMubmVpZ2hib3VycyhncmlkY2VsbCk7XHJcbiAgICAgICAgICAgIGlmICghbiAmJiBuIDwgMCkgeyB0aHJvdyBgSWxsZWdhbCBzdGF0ZTogJHtncmlkY2VsbH1gOyB9XHJcbiAgICAgICAgICAgIG5leHRncmlkW2dyaWRjZWxsXSA9IHRoaXMucnVsZShuKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5leHRncmlkO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBcclxuICAgICogR2V0IHRoZSBuZWlnaGJvdXJSdWxlcy1pbmRleCBjYWxjdWxhdGVkIGZyb20gdGhlIG5laWdoYm91cnMgb2YgdGhlIGNlbGwgY3VycmVudGx5IGJlZWluZyB2aXNpc3RlZC5cclxuICAgICAqL1xyXG4gICAgbmVpZ2hib3VycyhjZWxsOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAoY2VsbCA8IDAgfHwgY2VsbCA+IHRoaXMuZWxlbWVudGFyeWNvbmZpZy53aWR0aCkgeyByZXR1cm4gMDsgfVxyXG5cclxuICAgICAgICBjb25zdCByID0gdGhpcy5ncmlkW2NlbGwgKyAxID49IHRoaXMuZWxlbWVudGFyeWNvbmZpZy53aWR0aCA/IDAgOiBjZWxsICsgMV07XHJcbiAgICAgICAgY29uc3QgbCA9IHRoaXMuZ3JpZFtjZWxsIC0gMSA8PSAwID8gMCA6IGNlbGwgLSAxXTtcclxuICAgICAgICByZXR1cm4gMHhmICYgKHIgPDwgMiB8IHRoaXMuZ3JpZFtjZWxsXSA8PCAxIHwgbCk7XHJcbiAgICB9XHJcblxyXG4gICAgcnVsZShpbmRleDogbnVtYmVyKSB7IHJldHVybiB0aGlzLmVsZW1lbnRhcnljb25maWcucnVsZXNldFt0aGlzLmVsZW1lbnRhcnljb25maWcubmVpZ2hib3VyUnVsZXNbaW5kZXhdXTsgfVxyXG4gICAgY3VycmVudEdlbmVyYXRpb24oKSB7IHJldHVybiB0aGlzLmdlbmVyYXRpb25zLnNsaWNlKC0xKVswXTsgfVxyXG4gICAgZ2VuZXJhdGlvbih5ZWFyPzogbnVtYmVyKSB7IHJldHVybiB0aGlzLmdlbmVyYXRpb25zW3llYXJdOyB9XHJcblxyXG4gICAgY2hhbmdlUnVsZXNldChyZGVjaW1hbDogbnVtYmVyKSB7XHJcbiAgICAgICAgY29uc3QgZHRvYiA9IChuOiBudW1iZXIpID0+IHsgcmV0dXJuIHJkZWNpbWFsID4+IG4gJiAweDE7IH1cclxuICAgICAgICB0aGlzLmVsZW1lbnRhcnljb25maWcucnVsZXNldCA9IFtkdG9iKDcpLCBkdG9iKDYpLCBkdG9iKDUpLCBkdG9iKDQpLCBkdG9iKDMpLCBkdG9iKDIpLCBkdG9iKDEpLCBkdG9iKDApXTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufSIsImltcG9ydCB7IERpc3BsYXkgfSBmcm9tIFwiLi9kaXNwbGF5XCI7XHJcbmltcG9ydCB7IEVsZW1lbnRhcnlEb20gfSBmcm9tIFwiLi9kb21cIjtcclxuaW1wb3J0IHsgRWxlbWVudGFyeSB9IGZyb20gXCIuL2VsZW1lbnRhcnlcIjtcclxuXHJcbi8qKlxyXG4gKiBXSUtJUEVESUE6XHJcbiAqIFxyXG4gKiBUaGUgZXZvbHV0aW9uIG9mIGFuIGVsZW1lbnRhcnkgY2VsbHVsYXIgYXV0b21hdG9uIGNhbiBjb21wbGV0ZWx5IGJlIGRlc2NyaWJlZCBieSBhIHRhYmxlIHNwZWNpZnlpbmcgdGhlIHN0YXRlIGEgZ2l2ZW4gY2VsbCB3aWxsIGhhdmUgaW4gdGhlIG5leHQgZ2VuZXJhdGlvbiBiYXNlZCBvbiB0aGUgdmFsdWUgb2YgdGhlIGNlbGwgdG8gaXRzIGxlZnQsXHJcbiAqIHRoZSB2YWx1ZSBmcm9tIHRoZSBjZWxsIGl0c2VsZiwgYW5kIHRoZSB2YWx1ZSBvZiB0aGUgY2VsbCB0byBpdHMgcmlnaHQuIFxyXG4gKiBcclxuICogU2luY2UgdGhlcmUgYXJlIDLDlzLDlzI9Ml4zPTggcG9zc2libGUgYmluYXJ5IHN0YXRlcyBmb3IgdGhlIHRocmVlIGNlbGxzIG5laWdoYm9yaW5nIGEgZ2l2ZW4gY2VsbCwgdGhlcmUgYXJlIGEgdG90YWwgb2YgMl44PTI1NiBlbGVtZW50YXJ5IGNlbGx1bGFyIGF1dG9tYXRhLCBlYWNoIG9mIHdoaWNoIGNhbiBiZSBpbmRleGVkIHdpdGggYW4gOC1iaXQgYmluYXJ5IG51bWJlciAoV29sZnJhbSAxOTgzLCAyMDAyKVxyXG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIDI1NiBlbGVtZW50YXJ5IGNlbGx1bGFyIGF1dG9tYXRhIGNhbiBiZSBkZXNjcmliZWQgYnkgYSA4IGJpdCBudW1iZXIuIFxyXG4gKiBcclxuICogVGhlIHJ1bGUgZGVmaW5pbmcgdGhlIGNlbGx1bGFyIGF1dG9tYXRvbiBtdXN0IHNwZWNpZnkgdGhlIHJlc3VsdGluZyBzdGF0ZSBmb3IgZWFjaCBvZiB0aGVzZSBwb3NzaWJpbGl0aWVzIHNvIHRoZXJlIGFyZSAyNTYgPSAyXjJeMyBwb3NzaWJsZSBlbGVtZW50YXJ5IGNlbGx1bGFyIGF1dG9tYXRhLiBcclxuICogU3RlcGhlbiBXb2xmcmFtIHByb3Bvc2VkIGEgc2NoZW1lLCBrbm93biBhcyB0aGUgV29sZnJhbSBjb2RlLCB0byBhc3NpZ24gZWFjaCBydWxlIGEgbnVtYmVyIGZyb20gMCB0byAyNTUgd2hpY2ggaGFzIGJlY29tZSBzdGFuZGFyZC4gRWFjaCBwb3NzaWJsZSBjdXJyZW50IGNvbmZpZ3VyYXRpb24gaXMgd3JpdHRlbiBpbiBvcmRlciwgMTExLCAxMTAsIC4uLiwgMDAxLCAwMDAsIFxyXG4gKiBhbmQgdGhlIHJlc3VsdGluZyBzdGF0ZSBmb3IgZWFjaCBvZiB0aGVzZSBjb25maWd1cmF0aW9ucyBpcyB3cml0dGVuIGluIHRoZSBzYW1lIG9yZGVyIGFuZCBpbnRlcnByZXRlZCBhcyB0aGUgYmluYXJ5IHJlcHJlc2VudGF0aW9uIG9mIGFuIGludGVnZXIuIFxyXG4gKiBcclxuICogVGhpcyBudW1iZXIgaXMgdGFrZW4gdG8gYmUgdGhlIHJ1bGUgbnVtYmVyIG9mIHRoZSBhdXRvbWF0b24uIEZvciBleGFtcGxlLCAxMTBkPTAxMTAxMTEwMi4gU28gcnVsZSAxMTAgaXMgZGVmaW5lZCBieSB0aGUgdHJhbnNpdGlvbiBydWxlOlxyXG4gKiBcclxuICogMTExXHQxMTBcdDEwMVx0MTAwXHQwMTFcdDAxMFx0MDAxXHQwMDBcdGN1cnJlbnQgcGF0dGVyblx0UD0oTCxDLFIpXHJcbiAqICAwXHQxXHQxXHQwXHQxXHQxXHQxXHQwXHRuZXcgc3RhdGUgZm9yIGNlbnRlciBjZWxsXHROMTEwZD0oQytSK0MqUitMKkMqUiklMlxyXG4gKi9cclxuXHJcbmV4cG9ydCBjbGFzcyBFbGVtZW50YXJ5Q29uZmlnIHtcclxuICAgIHJlYWRvbmx5IG5laWdoYm91clJ1bGVzOiBBcnJheTxudW1iZXI+OyAvLyBUaGlzIGlzIHRoZSA4IHBvc3NpYmxlIHN0YXRlcyBhIGNlbGwgY2FuIHRha2UgZnJvbSBpdHMgdGhyZWUgbmVpZ2hib3Vycywga2VlcCB0aGVtIGluIGEgaW1tdXRhYmxlIGxhZGRlciB0byBiZSB1c2VkIGZvciBydWxlIGluZGV4aW5nIGxhdGVyXHJcbiAgICBydWxlc2V0OiBBcnJheTxudW1iZXI+OyAgIC8vIFRoaXMgaXMgdGhlIGN1cnJlbnQgcnVsZXNldCwgaW5kaWNhdGluZyBob3cgdGhlIG5leHQgZ2VuZXJhdGlvbiBzaG91bGQgY2hvb3NlIGl0cyB2YWx1ZSBhY2NvcmRpbmcgdG8gdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIGNlbGwgYW5kIGl0cyB0d28gaW1tZWRpYXRlIG5laWdoYm9yc1xyXG5cclxuICAgIGNvbnRhaW5lcjogc3RyaW5nOyAgICAgIC8vIE1hcmtlciBlbGVtZW50IHdoZXJlIEVsZW1lbnRhcnkgd2lsbCBnZW5lcmF0ZSBpdCdzIHZpZXcgKHByb21wdCBhbmQgY2FudmFzKVxyXG4gICAgZ2VuZXJhdGlvbnM6IG51bWJlcjsgICAgLy8gQW1vdW50IG9mIGdlbmVyYXRpb25zIHRvIHNpbXVsYXRlXHJcbiAgICB3aWR0aDogbnVtYmVyOyAgICAgICAgICAvLyBHcmlkIHdpZHRoIFxyXG5cclxuICAgIHJhdGlvOiBib29sZWFuOyAgICAgICAgIC8vIElmIHRydWUgLSBDYWxjdWxhdGUgY2VsbHNpemUgdG8gZmlsbCB3aW5kb3cgd2lkdGhcclxuICAgIGNlbGxzaXplOiBudW1iZXI7ICAgICAgIC8vIFRoaXMgaXMgdGhlIHNpemUgb2YgYSBzaW5nbGUgY2VsbFxyXG4gICAgY2VsbGNvbG9yT2ZmOiBzdHJpbmc7ICAgLy8gY29sb3IgZm9yIHN0YXRlIG9mZiAtIHRoaXMgc2hvdWxkIGJlIGEgY29sb3IgdmFsaWQgaW4gQ1NTIChleCAncmdiKDEzMiwgMjA4LCAyMTIpJylcclxuICAgIGNlbGxjb2xvck9uOiBzdHJpbmc7ICAgIC8vIGNvbG9yIGZvciBzdGF0ZSBvbiAtIHRoaXMgc2hvdWxkIGJlIGEgY29sb3IgdmFsaWQgaW4gQ1NTIChleCAncmdiKDg3LCA5MSwgMTA3KScpXHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgZWxlbWVudGFyeUNvbmZpZzogRWxlbWVudGFyeUNvbmZpZyA9IHtcclxuICAgIG5laWdoYm91clJ1bGVzOiBbNywgNiwgNSwgNCwgMywgMiwgMSwgMF0sXHJcbiAgICBydWxlc2V0OiBbMCwgMCwgMCwgMSwgMSwgMSwgMSwgMF0sIC8vIFJ1bGUgMzBcclxuXHJcbiAgICBnZW5lcmF0aW9uczogMTAwMCxcclxuICAgIGNlbGxzaXplOiA1LFxyXG4gICAgd2lkdGg6IDEwMDAsXHJcbiAgICBcclxuICAgIHJhdGlvOiB0cnVlLFxyXG4gICAgY29udGFpbmVyOiAnI2VsZW1lbnRhcnktY29udGFpbmVyJyxcclxuICAgIGNlbGxjb2xvck9mZjogJ3JnYigxMzIsIDIwOCwgMjEyKScsXHJcbiAgICBjZWxsY29sb3JPbjogJ3JnYig4NywgOTEsIDEwNyknLFxyXG59O1xyXG5cclxuZXhwb3J0IGNsYXNzIEVsZW1lbnRhcnlNYWluIHtcclxuICAgIHByaXZhdGUgZWxlbWVudGFyeURvbTogRWxlbWVudGFyeURvbSA9IG5ldyBFbGVtZW50YXJ5RG9tKCk7XHJcbiAgICBwcml2YXRlIGRpc3BsYXk6IERpc3BsYXkgPSBuZXcgRGlzcGxheSgpO1xyXG5cclxuICAgIHJ1blNpbXVsYXRpb24oY29uZmlnPzogRWxlbWVudGFyeUNvbmZpZykge1xyXG4gICAgICAgIGNvbnN0IGRlZmF1bHRDb25maWcgPSBjb25maWcgfHwgZWxlbWVudGFyeUNvbmZpZztcclxuICAgICAgICBjb25zdCBlbGVtZW50YXJ5ID0gbmV3IEVsZW1lbnRhcnkoKS5ib290c3RyYXBBcHBsaWNhdGlvbihkZWZhdWx0Q29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbGVtZW50YXJ5RG9tLnJlbmRlclNlbGVjdGlvblByb21wdHMoKHJ1bGUpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5kaXNwbGF5LmluaXQoZGVmYXVsdENvbmZpZyk7XHJcbiAgICAgICAgICAgIGVsZW1lbnRhcnkuY2hhbmdlUnVsZXNldChydWxlKS5hbmltYXRlKChnZW5lcmF0aW9ucykgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5LnJlbmRlcihnZW5lcmF0aW9ucyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5uZXcgRWxlbWVudGFyeU1haW4oKS5ydW5TaW11bGF0aW9uKCk7IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc291cmNlL21haW4udHNcIik7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=