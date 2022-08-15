/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./source/app.ts":
/*!***********************!*\
  !*** ./source/app.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
const asciiCfg = __webpack_require__(/*! ../data/main.json */ "./data/main.json");
const display_1 = __webpack_require__(/*! ./display */ "./source/display.ts");
const dom_1 = __webpack_require__(/*! ./dom */ "./source/dom.ts");
const elementary_1 = __webpack_require__(/*! ./elementary */ "./source/elementary.ts");
class ElementaryConfig {
}
__webpack_unused_export__ = ElementaryConfig;
;
exports.elementaryConfig = {
    neighbourRules: [7, 6, 5, 4, 3, 2, 1, 0],
    generations: 500,
    width: 500,
    cellsize: 1,
    ratio: false,
    container: '#elementary-container',
    cellcolorOff: '#84d0d4',
    cellcolorOn: '#374b5b',
};
class SimpleASCIISplasher {
    constructor(ascii) {
        this.ascii = ascii;
        return this;
    }
    splash() { console.info(this.ascii.art, this.ascii.color, this.ascii.ending); }
}
class ElementaryApp {
    constructor() {
        this.elementaryDom = new dom_1.ElementaryDom();
        this.display = new display_1.ElementaryDisplay();
        this.config = exports.elementaryConfig;
    }
    withConfig(config) {
        if (!config && !exports.elementaryConfig) {
            throw `${this.constructor.name} - A default or user config must be present`;
        }
        this.config = config || exports.elementaryConfig;
        return this;
    }
    withSplash(ascii) {
        if (!ascii || !ascii.art) {
            throw `${this.constructor.name} - Could not find splash  data`;
        }
        new SimpleASCIISplasher(ascii).splash();
        return this;
    }
    run() {
        const defaultConfig = this.config || exports.elementaryConfig;
        const elementary = new elementary_1.Elementary().bootstrapApplication(defaultConfig);
        this.elementaryDom.renderSelectionPrompts((rule) => {
            this.display.init(defaultConfig);
            elementary.changeRuleset(rule).animate((generations, year) => {
                this.display.render(generations, year);
            });
        });
    }
}
__webpack_unused_export__ = ElementaryApp;
new ElementaryApp().withSplash(asciiCfg.entryAscii)
    .withConfig(exports.elementaryConfig).run();


/***/ }),

/***/ "./source/buffer.ts":
/*!**************************!*\
  !*** ./source/buffer.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
class ElementaryBuffer {
    constructor(width, generations) {
        this.width = width;
        this.generations = generations;
        this.internalBuffer = undefined;
        this.highestGenerationIndex = 0;
        this.internalBuffer = this.internalCreateBuffer(this.generations, this.width);
        if (!this.internalBuffer || this.internalBuffer.buffer.byteLength < this.size) {
            throw `${this.constructor.name} - Failed to create buffer with size ${this.size}`;
        }
        this.internalBuffer.fill(0, 0, this.size);
        this.internalBuffer.fill(1, this.width / 2, this.width / 2 + 1);
    }
    get age() { return this.highestGenerationIndex; }
    get size() { return this.generations * this.width; }
    get buffer() { return this.internalBuffer; }
    currentGeneration() { return this.generation(this.highestGenerationIndex); }
    generation(year) { return this.internalBuffer.subarray(this.width * year, this.width * year + this.width); }
    toggle(year, col) { this.internalElementSet(year, col, this.internalElementAt(year, col) ? 0 : 1); }
    set(year, col, value) { this.internalElementSet(year, col, value); }
    read(year, col) { return this.internalElementAt(year, col); }
    internalElementSet(row, col, flag) {
        const binaryNumber = flag;
        const flatIndex = row * this.width + col;
        if (flatIndex < 0 || flatIndex > this.size) {
            throw `${this.constructor.name} - Argument out of bounds ${row}, ${col}`;
        }
        if (binaryNumber != 1 && binaryNumber != 0) {
            throw `${this.constructor.name} - Flag is not in a correct form. Should be a bit (0 or 1) `;
        }
        this.buffer[flatIndex] = flag;
        if (row > this.highestGenerationIndex) {
            this.highestGenerationIndex = row;
        }
    }
    internalElementAt(row, col) {
        const flatIndex = row * this.width + col;
        if (flatIndex < 0 || flatIndex > this.size) {
            throw `${this.constructor.name} - Argument out of bounds ${row}, ${col}`;
        }
        return this.buffer[flatIndex];
    }
    internalCreateBuffer(rows, cols) {
        try {
            if (!rows || !cols || rows <= 0 || cols <= 0) {
                throw Error(`${this.constructor.name} - Invalid row and col data`);
            }
            const buffer = new ArrayBuffer(rows * cols);
            return new Uint8Array(buffer, 0, rows * cols);
        }
        catch (e) {
            throw `${this.constructor.name} - ${e}`;
        }
    }
}
exports.ElementaryBuffer = ElementaryBuffer;


/***/ }),

/***/ "./source/display.ts":
/*!***************************!*\
  !*** ./source/display.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
class ElementaryDisplay {
    init(config, container, id) {
        if (!container) {
            container = 'game-view';
        }
        if (!id) {
            id = 'game-canvas';
        }
        const [canvas, context] = this.createHDPICanvasElement(config, container, id);
        this.centerAutomataInView(config, context);
        this.elementaryconfig = config;
        this.context = context;
        this.canvas = canvas;
    }
    render(generations, year) {
        if (!this.elementaryconfig) {
            throw 'ElemntaryConfig has to be set if the grid should be canvas rendered';
        }
        if (!generations) {
            throw 'Illegal state - Display grid is undefined';
        }
        const configsize = this.elementaryconfig.cellsize;
        const gridheight = this.elementaryconfig.generations;
        const gridwidth = this.elementaryconfig.width;
        const ratio = this.elementaryconfig.ratio;
        let cellw = ratio ? this.canvas.width * window.devicePixelRatio / gridwidth : configsize;
        let cellh = ratio ? this.canvas.height * window.devicePixelRatio / gridheight : configsize;
        generations.forEach((cell, gridcell) => {
            this.context.fillStyle = cell ? this.elementaryconfig.cellcolorOn : this.elementaryconfig.cellcolorOff;
            this.context.fillRect(gridcell * cellw, year * cellh, cellw, cellh);
        });
    }
    createHDPICanvasElement(config, container, id = undefined) {
        const canvascontainer = document.getElementById(container);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const devicepixelratio = window.devicePixelRatio || 1;
        let { width, height } = canvascontainer.getBoundingClientRect();
        if (!width || !height) {
            width = window.innerWidth;
            height = window.innerHeight;
        }
        width += 1;
        height += 1;
        canvas.width = width * devicepixelratio;
        canvas.height = height * devicepixelratio;
        canvas.style.width = `${width * devicepixelratio}px`;
        canvas.style.height = `${height * devicepixelratio}px`;
        ctx.imageSmoothingEnabled = false;
        canvas.style.imageRendering = 'pixelated';
        canvas.style.backgroundColor = config.cellcolorOff;
        if (id) {
            canvas.id = id;
        }
        canvascontainer.appendChild(canvas);
        return [canvas, ctx];
    }
    centerAutomataInView(config, context) {
        const panVertical = config.generations < context.canvas.height;
        const translateX = context.canvas.width / 2 - config.width / 2;
        const translateY = context.canvas.height / 2 - config.generations / 2;
        context.translate(translateX, panVertical ? translateY : 0);
    }
}
exports.ElementaryDisplay = ElementaryDisplay;


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
                    gameContainer.classList.remove('display-none');
                    container.classList.add('display-none');
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
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const buffer_1 = __webpack_require__(/*! ./buffer */ "./source/buffer.ts");
var AnimationStyle;
(function (AnimationStyle) {
    AnimationStyle[AnimationStyle["Stepwise"] = 0] = "Stepwise";
    AnimationStyle[AnimationStyle["Direct"] = 1] = "Direct";
})(AnimationStyle = exports.AnimationStyle || (exports.AnimationStyle = {}));
class Elementary {
    bootstrapApplication(config, animationStyle = AnimationStyle.Stepwise) {
        this.generationBuffer = new buffer_1.ElementaryBuffer(config.width, config.generations);
        this.animationStyle = animationStyle;
        this.ruleset = new Array(8);
        this.elementaryConfig = config;
        return this;
    }
    animate(onSuccess) {
        const tick = () => {
            const grid = this.step(this.currentGeneration());
            let nextGeneration = this.generationBuffer.age < this.elementaryConfig.generations - 1;
            if (nextGeneration) {
                window.requestAnimationFrame(tick);
            }
            if (this.animationStyle === AnimationStyle.Stepwise) {
                onSuccess(grid, this.generationBuffer.age);
            }
        };
        window.requestAnimationFrame(tick);
        if (this.animationStyle === AnimationStyle.Direct) {
            onSuccess(this.generationBuffer.buffer, this.elementaryConfig.generations);
        }
    }
    step(currentGeneratingGrid) {
        const year = this.generationBuffer.age + 1;
        for (let gridcell = 0; gridcell < this.elementaryConfig.width; gridcell++) {
            const n = this.neighbours(currentGeneratingGrid, gridcell);
            if (!n && n < 0) {
                throw `Illegal state: ${gridcell}`;
            }
            this.generationBuffer.set(year, gridcell, this.rule(n));
        }
        return currentGeneratingGrid;
    }
    neighbours(currentGeneratingGrid, cell) {
        if (cell < 0 || cell > this.elementaryConfig.width) {
            return 0;
        }
        const r = currentGeneratingGrid[cell + 1 >= this.elementaryConfig.width ? 0 : cell + 1];
        const l = currentGeneratingGrid[cell - 1 <= 0 ? 0 : cell - 1];
        return 0xf & (r << 2 | currentGeneratingGrid[cell] << 1 | l);
    }
    rule(index) { return this.ruleset[this.elementaryConfig.neighbourRules[index]]; }
    generation(year) { return this.generationBuffer.generation(year); }
    currentGeneration() { return this.generationBuffer.currentGeneration(); }
    changeRuleset(rdecimal) {
        const dtob = (n) => { return rdecimal >> n & 0x1; };
        this.ruleset = [dtob(7), dtob(6), dtob(5), dtob(4), dtob(3), dtob(2), dtob(1), dtob(0)];
        return this;
    }
}
exports.Elementary = Elementary;


/***/ }),

/***/ "./data/main.json":
/*!************************!*\
  !*** ./data/main.json ***!
  \************************/
/***/ ((module) => {

module.exports = JSON.parse('{"entryAscii":{"ending":"\\n\\n","color":"color: green;","art":"%c\\r\\n      ______ ______\\r\\n    _/      Y      \\\\\\\\_\\r\\n   // ~~ ~~ | ~~ ~  \\\\\\\\\\\\\\\\\\r\\n  // ~ ~ ~~ | ~~~ ~~ \\\\\\\\\\\\\\\\      Welcome to Elementary \\r\\n //________.|.________\\\\\\\\\\\\\\\\        A thing made on a rainy day in 2022 by MDC(www.mdcthings.se)\\r\\n\\\\`----------\\\\`-\'----------\'%s"}}');

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
/******/ 	var __webpack_exports__ = __webpack_require__("./source/app.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0FBQyxJQUFhLElBQUksT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM1RSxpQkFBaUIsS0FBSyxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUV6RSxhQUFhLENBQUMsUUFBZ0I7UUFDMUIsTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFTLEVBQUUsRUFBRSxHQUFHLE9BQU8sUUFBUSxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzNELElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEYsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztDQUNKO0FBMUVELGdDQTBFQzs7Ozs7Ozs7Ozs7Ozs7Ozs7VUNsRkQ7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7OztVRXRCQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2VsZW1lbnRhcnkvLi9zb3VyY2UvYXBwLnRzIiwid2VicGFjazovL2VsZW1lbnRhcnkvLi9zb3VyY2UvYnVmZmVyLnRzIiwid2VicGFjazovL2VsZW1lbnRhcnkvLi9zb3VyY2UvZGlzcGxheS50cyIsIndlYnBhY2s6Ly9lbGVtZW50YXJ5Ly4vc291cmNlL2RvbS50cyIsIndlYnBhY2s6Ly9lbGVtZW50YXJ5Ly4vc291cmNlL2VsZW1lbnRhcnkudHMiLCJ3ZWJwYWNrOi8vZWxlbWVudGFyeS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9lbGVtZW50YXJ5L3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vZWxlbWVudGFyeS93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vZWxlbWVudGFyeS93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgYXNjaWlDZmcgZnJvbSBcIi4uL2RhdGEvbWFpbi5qc29uXCI7XG5pbXBvcnQgeyBFbGVtZW50YXJ5RGlzcGxheSB9IGZyb20gXCIuL2Rpc3BsYXlcIjtcbmltcG9ydCB7IEVsZW1lbnRhcnlEb20gfSBmcm9tIFwiLi9kb21cIjtcbmltcG9ydCB7IEVsZW1lbnRhcnkgfSBmcm9tIFwiLi9lbGVtZW50YXJ5XCI7XG5cbi8qKlxuICogV0lLSVBFRElBOlxuICogXG4gKiBUaGUgZXZvbHV0aW9uIG9mIGFuIGVsZW1lbnRhcnkgY2VsbHVsYXIgYXV0b21hdG9uIGNhbiBjb21wbGV0ZWx5IGJlIGRlc2NyaWJlZCBieSBhIHRhYmxlIHNwZWNpZnlpbmcgdGhlIHN0YXRlIGEgZ2l2ZW4gY2VsbCB3aWxsIGhhdmUgaW4gdGhlIG5leHQgZ2VuZXJhdGlvbiBiYXNlZCBvbiB0aGUgdmFsdWUgb2YgdGhlIGNlbGwgdG8gaXRzIGxlZnQsXG4gKiB0aGUgdmFsdWUgZnJvbSB0aGUgY2VsbCBpdHNlbGYsIGFuZCB0aGUgdmFsdWUgb2YgdGhlIGNlbGwgdG8gaXRzIHJpZ2h0LiBcbiAqIFxuICogU2luY2UgdGhlcmUgYXJlIDLDlzLDlzI9Ml4zPTggcG9zc2libGUgYmluYXJ5IHN0YXRlcyBmb3IgdGhlIHRocmVlIGNlbGxzIG5laWdoYm9yaW5nIGEgZ2l2ZW4gY2VsbCwgdGhlcmUgYXJlIGEgdG90YWwgb2YgMl44PTI1NiBlbGVtZW50YXJ5IGNlbGx1bGFyIGF1dG9tYXRhLCBlYWNoIG9mIHdoaWNoIGNhbiBiZSBpbmRleGVkIHdpdGggYW4gOC1iaXQgYmluYXJ5IG51bWJlciAoV29sZnJhbSAxOTgzLCAyMDAyKVxuICogVGhlIGNvbXBsZXRlIHNldCBvZiAyNTYgZWxlbWVudGFyeSBjZWxsdWxhciBhdXRvbWF0YSBjYW4gYmUgZGVzY3JpYmVkIGJ5IGEgOCBiaXQgbnVtYmVyLiBcbiAqIFxuICogVGhlIHJ1bGUgZGVmaW5pbmcgdGhlIGNlbGx1bGFyIGF1dG9tYXRvbiBtdXN0IHNwZWNpZnkgdGhlIHJlc3VsdGluZyBzdGF0ZSBmb3IgZWFjaCBvZiB0aGVzZSBwb3NzaWJpbGl0aWVzIHNvIHRoZXJlIGFyZSAyNTYgPSAyXjJeMyBwb3NzaWJsZSBlbGVtZW50YXJ5IGNlbGx1bGFyIGF1dG9tYXRhLiBcbiAqIFN0ZXBoZW4gV29sZnJhbSBwcm9wb3NlZCBhIHNjaGVtZSwga25vd24gYXMgdGhlIFdvbGZyYW0gY29kZSwgdG8gYXNzaWduIGVhY2ggcnVsZSBhIG51bWJlciBmcm9tIDAgdG8gMjU1IHdoaWNoIGhhcyBiZWNvbWUgc3RhbmRhcmQuIEVhY2ggcG9zc2libGUgY3VycmVudCBjb25maWd1cmF0aW9uIGlzIHdyaXR0ZW4gaW4gb3JkZXIsIDExMSwgMTEwLCAuLi4sIDAwMSwgMDAwLCBcbiAqIGFuZCB0aGUgcmVzdWx0aW5nIHN0YXRlIGZvciBlYWNoIG9mIHRoZXNlIGNvbmZpZ3VyYXRpb25zIGlzIHdyaXR0ZW4gaW4gdGhlIHNhbWUgb3JkZXIgYW5kIGludGVycHJldGVkIGFzIHRoZSBiaW5hcnkgcmVwcmVzZW50YXRpb24gb2YgYW4gaW50ZWdlci4gXG4gKiBcbiAqIFRoaXMgbnVtYmVyIGlzIHRha2VuIHRvIGJlIHRoZSBydWxlIG51bWJlciBvZiB0aGUgYXV0b21hdG9uLiBGb3IgZXhhbXBsZSwgMTEwZD0wMTEwMTExMDIuIFNvIHJ1bGUgMTEwIGlzIGRlZmluZWQgYnkgdGhlIHRyYW5zaXRpb24gcnVsZTpcbiAqIFxuICogMTExXHQxMTBcdDEwMVx0MTAwXHQwMTFcdDAxMFx0MDAxXHQwMDBcdGN1cnJlbnQgcGF0dGVyblx0UD0oTCxDLFIpXG4gKiAgMFx0MVx0MVx0MFx0MVx0MVx0MVx0MFx0bmV3IHN0YXRlIGZvciBjZW50ZXIgY2VsbFx0TjExMGQ9KEMrUitDKlIrTCpDKlIpJTJcbiAqL1xuXG5leHBvcnQgY2xhc3MgRWxlbWVudGFyeUNvbmZpZyB7XG4gICAgcmVhZG9ubHkgbmVpZ2hib3VyUnVsZXM6IEFycmF5PG51bWJlcj47IC8vIFRoaXMgaXMgdGhlIDggcG9zc2libGUgc3RhdGVzIGEgY2VsbCBjYW4gdGFrZSBmcm9tIGl0cyB0aHJlZSBuZWlnaGJvdXJzLCBrZWVwIHRoZW0gaW4gYSBpbW11dGFibGUgbGFkZGVyIHRvIGJlIHVzZWQgZm9yIHJ1bGUgaW5kZXhpbmcgbGF0ZXJcblxuICAgIGNvbnRhaW5lcjogc3RyaW5nOyAgICAgIC8vIE1hcmtlciBlbGVtZW50IHdoZXJlIEVsZW1lbnRhcnkgd2lsbCBnZW5lcmF0ZSBpdCdzIHZpZXcgKHByb21wdCBhbmQgY2FudmFzKVxuICAgIGdlbmVyYXRpb25zOiBudW1iZXI7ICAgIC8vIEFtb3VudCBvZiBnZW5lcmF0aW9ucyB0byBzaW11bGF0ZVxuICAgIHdpZHRoOiBudW1iZXI7ICAgICAgICAgIC8vIEdyaWQgd2lkdGggXG5cbiAgICByYXRpbzogYm9vbGVhbjsgICAgICAgICAvLyBJZiB0cnVlIC0gQ2FsY3VsYXRlIGNlbGxzaXplIHRvIGZpbGwgd2luZG93IHdpZHRoXG4gICAgY2VsbHNpemU6IG51bWJlcjsgICAgICAgLy8gVGhpcyBpcyB0aGUgc2l6ZSBvZiBhIHNpbmdsZSBjZWxsXG4gICAgY2VsbGNvbG9yT2ZmOiBzdHJpbmc7ICAgLy8gY29sb3IgZm9yIHN0YXRlIG9mZiAtIHRoaXMgc2hvdWxkIGJlIGEgY29sb3IgdmFsaWQgaW4gQ1NTIChleCAncmdiKDEzMiwgMjA4LCAyMTIpJylcbiAgICBjZWxsY29sb3JPbjogc3RyaW5nOyAgICAvLyBjb2xvciBmb3Igc3RhdGUgb24gLSB0aGlzIHNob3VsZCBiZSBhIGNvbG9yIHZhbGlkIGluIENTUyAoZXggJ3JnYig4NywgOTEsIDEwNyknKVxufTtcblxuZXhwb3J0IGNvbnN0IGVsZW1lbnRhcnlDb25maWc6IEVsZW1lbnRhcnlDb25maWcgPSB7XG4gICAgbmVpZ2hib3VyUnVsZXM6IFs3LCA2LCA1LCA0LCAzLCAyLCAxLCAwXSxcblxuICAgIGdlbmVyYXRpb25zOiA1MDAsXG4gICAgd2lkdGg6IDUwMCxcbiAgICBjZWxsc2l6ZTogMSxcblxuICAgIHJhdGlvOiBmYWxzZSxcbiAgICBjb250YWluZXI6ICcjZWxlbWVudGFyeS1jb250YWluZXInLFxuICAgIGNlbGxjb2xvck9mZjogJyM4NGQwZDQnLFxuICAgIGNlbGxjb2xvck9uOiAnIzM3NGI1YicsXG59O1xuXG5kZWNsYXJlIHR5cGUgQVNDSUlTcGxhc2hJdGVtID0geyBlbmRpbmc6IHN0cmluZzsgY29sb3I6IHN0cmluZzsgYXJ0OiBzdHJpbmc7IH07XG5kZWNsYXJlIHR5cGUgQVNDSUlEYXRhID0gUGFydGlhbDx7IGVudHJ5QXNjaWk6IEFTQ0lJU3BsYXNoSXRlbSB9PlxuXG5jbGFzcyBTaW1wbGVBU0NJSVNwbGFzaGVyIHtcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGFzY2lpOiBBU0NJSVNwbGFzaEl0ZW0pIHsgcmV0dXJuIHRoaXM7IH1cbiAgICBzcGxhc2goKSB7IGNvbnNvbGUuaW5mbyh0aGlzLmFzY2lpLmFydCwgdGhpcy5hc2NpaS5jb2xvciwgdGhpcy5hc2NpaS5lbmRpbmcpOyB9XG59XG5cbi8vIFRPRE86IFJhbmRvbSBzZWVkcywgVUkgYW5kIHBpeGVsIHBlcmZlY3QgcmVuZGVyaW5nIHdpdGggc2Nyb2xsXG5cbmV4cG9ydCBjbGFzcyBFbGVtZW50YXJ5QXBwIHtcbiAgICBwcml2YXRlIGVsZW1lbnRhcnlEb206IEVsZW1lbnRhcnlEb20gPSBuZXcgRWxlbWVudGFyeURvbSgpO1xuICAgIHByaXZhdGUgZGlzcGxheTogRWxlbWVudGFyeURpc3BsYXkgPSBuZXcgRWxlbWVudGFyeURpc3BsYXkoKTtcbiAgICBwcml2YXRlIGNvbmZpZzogRWxlbWVudGFyeUNvbmZpZyA9IGVsZW1lbnRhcnlDb25maWc7XG5cbiAgICAvKiogXG4gICAgICogVGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIHN1cHBseSBhIHVzZXIgY29uZmlnLiBcbiAgICAgKiBJZiBubyBjb25maWcgaXMgc3BlY2lmaWVkIHRoZSBkZWZhdWx0IHdpbGwgYmUgdXNlZCBcbiAgICAgKiAqL1xuICAgIHdpdGhDb25maWcoY29uZmlnOiBFbGVtZW50YXJ5Q29uZmlnKSB7XG4gICAgICAgIGlmICghY29uZmlnICYmICFlbGVtZW50YXJ5Q29uZmlnKSB7XG4gICAgICAgICAgICB0aHJvdyBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9IC0gQSBkZWZhdWx0IG9yIHVzZXIgY29uZmlnIG11c3QgYmUgcHJlc2VudGA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb25maWcgPSBjb25maWcgfHwgZWxlbWVudGFyeUNvbmZpZztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8qKiBcbiAgICAgKiBEaXNwbGF5IGEgJ01PVEQnIHN0eWxlIG1lc3NhZ2UgaW4gdGhlIGJyb3dzZXIgY29uc29sZS4gXG4gICAgICogVGhlIGFydCBpcyBkZWZpbmVkIGluIGRhdGEvbWFpbi5qc29uLiBcbiAgICAgKiAqL1xuICAgIHdpdGhTcGxhc2goYXNjaWk6IEFTQ0lJU3BsYXNoSXRlbSkge1xuICAgICAgICBpZiAoIWFzY2lpIHx8ICFhc2NpaS5hcnQpIHtcbiAgICAgICAgICAgIHRocm93IGAke3RoaXMuY29uc3RydWN0b3IubmFtZX0gLSBDb3VsZCBub3QgZmluZCBzcGxhc2ggIGRhdGFgO1xuICAgICAgICB9XG4gICAgICAgIG5ldyBTaW1wbGVBU0NJSVNwbGFzaGVyKGFzY2lpKS5zcGxhc2goKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcnVuKCkge1xuICAgICAgICBjb25zdCBkZWZhdWx0Q29uZmlnID0gdGhpcy5jb25maWcgfHwgZWxlbWVudGFyeUNvbmZpZztcbiAgICAgICAgY29uc3QgZWxlbWVudGFyeSA9IG5ldyBFbGVtZW50YXJ5KCkuYm9vdHN0cmFwQXBwbGljYXRpb24oZGVmYXVsdENvbmZpZyk7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50YXJ5RG9tLnJlbmRlclNlbGVjdGlvblByb21wdHMoKHJ1bGUpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheS5pbml0KGRlZmF1bHRDb25maWcpO1xuICAgICAgICAgICAgZWxlbWVudGFyeS5jaGFuZ2VSdWxlc2V0KHJ1bGUpLmFuaW1hdGUoKGdlbmVyYXRpb25zLCB5ZWFyKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5LnJlbmRlcihnZW5lcmF0aW9ucywgeWVhcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG4vLyBBUEkgLSBob3cgdG8gcnVuIGV4YW1wbGVcbm5ldyBFbGVtZW50YXJ5QXBwKCkud2l0aFNwbGFzaCgoPEFTQ0lJRGF0YT5hc2NpaUNmZykuZW50cnlBc2NpaSlcbiAgICAud2l0aENvbmZpZyhlbGVtZW50YXJ5Q29uZmlnKS5ydW4oKTsiLCIvKipcclxuICogIEVsZW1lbnRhcnlCdWZmZXIgaXMgdGhlIGludGVybmFsIGRhdGEgc3RydWN0dXJlIHRoYXQgaG9sZHMgdGhlIGJpdC1ncmlkIG1ha2luZyB1cCB0aGUgYXV0b21hdGEuXHJcbiAqICAnMScgbWVhbnMgcmVuZGVyIGFuZCB0cmVhdCBhcyBhIG5laWdoYm91ciwgJzAnIG1lYW5zIHRvIGlnbm9yZVxyXG4gKi9cclxuXHJcbmV4cG9ydCBkZWNsYXJlIHR5cGUgRWxlbWVudGFyeUJpbmFyeU51bWJlciA9IDAgfCAxO1xyXG5cclxuZXhwb3J0IGNsYXNzIEVsZW1lbnRhcnlCdWZmZXIge1xyXG4gICAgcHVibGljIHJlYWRvbmx5IGludGVybmFsQnVmZmVyOiBVaW50OEFycmF5ID0gdW5kZWZpbmVkO1xyXG4gICAgcHJpdmF0ZSBoaWdoZXN0R2VuZXJhdGlvbkluZGV4OiBudW1iZXIgPSAwO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgd2lkdGg6IG51bWJlciwgcHJpdmF0ZSByZWFkb25seSBnZW5lcmF0aW9uczogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5pbnRlcm5hbEJ1ZmZlciA9IHRoaXMuaW50ZXJuYWxDcmVhdGVCdWZmZXIodGhpcy5nZW5lcmF0aW9ucywgdGhpcy53aWR0aCk7XHJcbiAgICAgICAgaWYgKCF0aGlzLmludGVybmFsQnVmZmVyIHx8IHRoaXMuaW50ZXJuYWxCdWZmZXIuYnVmZmVyLmJ5dGVMZW5ndGggPCB0aGlzLnNpemUpIHtcclxuICAgICAgICAgICAgdGhyb3cgYCR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfSAtIEZhaWxlZCB0byBjcmVhdGUgYnVmZmVyIHdpdGggc2l6ZSAke3RoaXMuc2l6ZX1gO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5pbnRlcm5hbEJ1ZmZlci5maWxsKDAsIDAsIHRoaXMuc2l6ZSk7IC8vIFNlZWQgZmlyc3QgZ2VuZXJhdGlvblxyXG4gICAgICAgIHRoaXMuaW50ZXJuYWxCdWZmZXIuZmlsbCgxLCB0aGlzLndpZHRoIC8gMiwgdGhpcy53aWR0aCAvIDIgKyAxKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgYWdlKCkgeyByZXR1cm4gdGhpcy5oaWdoZXN0R2VuZXJhdGlvbkluZGV4OyB9IC8vIEFtb3VudCBvZiB5ZWFycyBwcm9jZXNzZWQgc28gZmFyIFxyXG4gICAgZ2V0IHNpemUoKSB7IHJldHVybiB0aGlzLmdlbmVyYXRpb25zICogdGhpcy53aWR0aDsgfVxyXG4gICAgZ2V0IGJ1ZmZlcigpIHsgcmV0dXJuIHRoaXMuaW50ZXJuYWxCdWZmZXI7IH1cclxuXHJcbiAgICBwdWJsaWMgY3VycmVudEdlbmVyYXRpb24oKTogVWludDhBcnJheSB7IHJldHVybiB0aGlzLmdlbmVyYXRpb24odGhpcy5oaWdoZXN0R2VuZXJhdGlvbkluZGV4KTsgfVxyXG4gICAgcHVibGljIGdlbmVyYXRpb24oeWVhcjogbnVtYmVyKTogVWludDhBcnJheSB7IHJldHVybiB0aGlzLmludGVybmFsQnVmZmVyLnN1YmFycmF5KHRoaXMud2lkdGggKiB5ZWFyLCB0aGlzLndpZHRoICogeWVhciArIHRoaXMud2lkdGgpOyB9XHJcbiAgICBwdWJsaWMgdG9nZ2xlKHllYXI6IG51bWJlciwgY29sOiBudW1iZXIpIHsgdGhpcy5pbnRlcm5hbEVsZW1lbnRTZXQoeWVhciwgY29sLCB0aGlzLmludGVybmFsRWxlbWVudEF0KHllYXIsIGNvbCkgPyAwIDogMSk7IH1cclxuICAgIHB1YmxpYyBzZXQoeWVhcjogbnVtYmVyLCBjb2w6IG51bWJlciwgdmFsdWU6IG51bWJlcikgeyB0aGlzLmludGVybmFsRWxlbWVudFNldCh5ZWFyLCBjb2wsIHZhbHVlKTsgfVxyXG4gICAgcHVibGljIHJlYWQoeWVhcjogbnVtYmVyLCBjb2w6IG51bWJlcikgeyByZXR1cm4gdGhpcy5pbnRlcm5hbEVsZW1lbnRBdCh5ZWFyLCBjb2wpOyB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbnRlcm5hbEVsZW1lbnRTZXQocm93OiBudW1iZXIsIGNvbDogbnVtYmVyLCBmbGFnOiBudW1iZXIpIHtcclxuICAgICAgICBjb25zdCBiaW5hcnlOdW1iZXIgPSBmbGFnIGFzIEVsZW1lbnRhcnlCaW5hcnlOdW1iZXI7XHJcbiAgICAgICAgY29uc3QgZmxhdEluZGV4ID0gcm93ICogdGhpcy53aWR0aCArIGNvbDtcclxuXHJcbiAgICAgICAgaWYgKGZsYXRJbmRleCA8IDAgfHwgZmxhdEluZGV4ID4gdGhpcy5zaXplKSB7IHRocm93IGAke3RoaXMuY29uc3RydWN0b3IubmFtZX0gLSBBcmd1bWVudCBvdXQgb2YgYm91bmRzICR7cm93fSwgJHtjb2x9YDsgfVxyXG4gICAgICAgIGlmIChiaW5hcnlOdW1iZXIgIT0gMSAmJiBiaW5hcnlOdW1iZXIgIT0gMCkgeyB0aHJvdyBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9IC0gRmxhZyBpcyBub3QgaW4gYSBjb3JyZWN0IGZvcm0uIFNob3VsZCBiZSBhIGJpdCAoMCBvciAxKSBgOyB9XHJcblxyXG4gICAgICAgIHRoaXMuYnVmZmVyW2ZsYXRJbmRleF0gPSBmbGFnOyAvLyBDaGVjayBpZiB3ZSBoYXZlIHJlYWNoZWQgYSBoaWdoZXIgZ2VuZXJhdGlvblxyXG4gICAgICAgIGlmIChyb3cgPiB0aGlzLmhpZ2hlc3RHZW5lcmF0aW9uSW5kZXgpIHsgLy8gVE9ETyBtb3ZlIHRoaXMgdG8gZWxlbWVudGFyeS50cyBmb3IgcGVyZm9ybWFuY2VcclxuICAgICAgICAgICAgdGhpcy5oaWdoZXN0R2VuZXJhdGlvbkluZGV4ID0gcm93O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGludGVybmFsRWxlbWVudEF0KHJvdzogbnVtYmVyLCBjb2w6IG51bWJlcikge1xyXG4gICAgICAgIGNvbnN0IGZsYXRJbmRleCA9IHJvdyAqIHRoaXMud2lkdGggKyBjb2w7XHJcbiAgICAgICAgaWYgKGZsYXRJbmRleCA8IDAgfHwgZmxhdEluZGV4ID4gdGhpcy5zaXplKSB7XHJcbiAgICAgICAgICAgIHRocm93IGAke3RoaXMuY29uc3RydWN0b3IubmFtZX0gLSBBcmd1bWVudCBvdXQgb2YgYm91bmRzICR7cm93fSwgJHtjb2x9YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYnVmZmVyW2ZsYXRJbmRleF07XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbnRlcm5hbENyZWF0ZUJ1ZmZlcihyb3dzOiBudW1iZXIsIGNvbHM6IG51bWJlcikge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmICghcm93cyB8fCAhY29scyB8fCByb3dzIDw9IDAgfHwgY29scyA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBFcnJvcihgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9IC0gSW52YWxpZCByb3cgYW5kIGNvbCBkYXRhYCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKHJvd3MgKiBjb2xzKTtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGJ1ZmZlciwgMCwgcm93cyAqIGNvbHMpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgdGhyb3cgYCR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfSAtICR7ZX1gO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImltcG9ydCB7IEVsZW1lbnRhcnlDb25maWcgfSBmcm9tIFwiLi9hcHBcIjtcblxuZXhwb3J0IGNsYXNzIEVsZW1lbnRhcnlEaXNwbGF5IHtcbiAgICBwdWJsaWMgY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuICAgIHB1YmxpYyBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50O1xuXG4gICAgcHJpdmF0ZSBlbGVtZW50YXJ5Y29uZmlnOiBFbGVtZW50YXJ5Q29uZmlnO1xuXG4gICAgcHVibGljIGluaXQoY29uZmlnOiBFbGVtZW50YXJ5Q29uZmlnLCBjb250YWluZXI/OiBzdHJpbmcsIGlkPzogc3RyaW5nKSB7XG4gICAgICAgIGlmICghY29udGFpbmVyKSB7IGNvbnRhaW5lciA9ICdnYW1lLXZpZXcnOyB9XG4gICAgICAgIGlmICghaWQpIHsgaWQgPSAnZ2FtZS1jYW52YXMnOyB9XG5cbiAgICAgICAgY29uc3QgW2NhbnZhcywgY29udGV4dF0gPSB0aGlzLmNyZWF0ZUhEUElDYW52YXNFbGVtZW50KGNvbmZpZywgY29udGFpbmVyLCBpZCk7XG4gICAgICAgIHRoaXMuY2VudGVyQXV0b21hdGFJblZpZXcoY29uZmlnLCBjb250ZXh0KTtcblxuICAgICAgICB0aGlzLmVsZW1lbnRhcnljb25maWcgPSBjb25maWc7XG4gICAgICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW5kZXIoZ2VuZXJhdGlvbnM6IFVpbnQ4QXJyYXksIHllYXI6IG51bWJlcik6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuZWxlbWVudGFyeWNvbmZpZykgeyB0aHJvdyAnRWxlbW50YXJ5Q29uZmlnIGhhcyB0byBiZSBzZXQgaWYgdGhlIGdyaWQgc2hvdWxkIGJlIGNhbnZhcyByZW5kZXJlZCc7IH1cbiAgICAgICAgaWYgKCFnZW5lcmF0aW9ucykgeyB0aHJvdyAnSWxsZWdhbCBzdGF0ZSAtIERpc3BsYXkgZ3JpZCBpcyB1bmRlZmluZWQnOyB9XG5cbiAgICAgICAgY29uc3QgY29uZmlnc2l6ZSA9IHRoaXMuZWxlbWVudGFyeWNvbmZpZy5jZWxsc2l6ZTtcbiAgICAgICAgY29uc3QgZ3JpZGhlaWdodCA9IHRoaXMuZWxlbWVudGFyeWNvbmZpZy5nZW5lcmF0aW9ucztcbiAgICAgICAgY29uc3QgZ3JpZHdpZHRoID0gdGhpcy5lbGVtZW50YXJ5Y29uZmlnLndpZHRoO1xuICAgICAgICBjb25zdCByYXRpbyA9IHRoaXMuZWxlbWVudGFyeWNvbmZpZy5yYXRpbztcblxuICAgICAgICBsZXQgY2VsbHcgPSByYXRpbyA/IHRoaXMuY2FudmFzLndpZHRoICogd2luZG93LmRldmljZVBpeGVsUmF0aW8gLyBncmlkd2lkdGggOiBjb25maWdzaXplO1xuICAgICAgICBsZXQgY2VsbGggPSByYXRpbyA/IHRoaXMuY2FudmFzLmhlaWdodCAqIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIC8gZ3JpZGhlaWdodCA6IGNvbmZpZ3NpemU7XG5cbiAgICAgICAgZ2VuZXJhdGlvbnMuZm9yRWFjaCgoY2VsbCwgZ3JpZGNlbGwpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5maWxsU3R5bGUgPSBjZWxsID8gdGhpcy5lbGVtZW50YXJ5Y29uZmlnLmNlbGxjb2xvck9uIDogdGhpcy5lbGVtZW50YXJ5Y29uZmlnLmNlbGxjb2xvck9mZjtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5maWxsUmVjdChncmlkY2VsbCAqIGNlbGx3LCB5ZWFyICogY2VsbGgsIGNlbGx3LCBjZWxsaCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgY3JlYXRlSERQSUNhbnZhc0VsZW1lbnQoY29uZmlnOiBFbGVtZW50YXJ5Q29uZmlnLCBjb250YWluZXI6IHN0cmluZywgaWQ6IHN0cmluZyA9IHVuZGVmaW5lZCk6IFtIVE1MQ2FudmFzRWxlbWVudCwgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEXSB7XG4gICAgICAgIGNvbnN0IGNhbnZhc2NvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbnRhaW5lcik7XG4gICAgICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpIGFzIEhUTUxDYW52YXNFbGVtZW50O1xuICAgICAgICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICBjb25zdCBkZXZpY2VwaXhlbHJhdGlvID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMTtcbiAgICAgICAgbGV0IHsgd2lkdGgsIGhlaWdodCB9ID0gY2FudmFzY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICAgIGlmICghd2lkdGggfHwgIWhlaWdodCkge1xuICAgICAgICAgICAgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgICAgICAgIGhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICAgICAgfVxuICAgICAgICB3aWR0aCArPSAxOyBoZWlnaHQgKz0xO1xuICAgICAgICBjYW52YXMud2lkdGggPSB3aWR0aCAqIGRldmljZXBpeGVscmF0aW87XG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQgKiBkZXZpY2VwaXhlbHJhdGlvO1xuICAgICAgICBjYW52YXMuc3R5bGUud2lkdGggPSBgJHt3aWR0aCAqIGRldmljZXBpeGVscmF0aW99cHhgO1xuICAgICAgICBjYW52YXMuc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0ICogZGV2aWNlcGl4ZWxyYXRpb31weGA7XG5cbiAgICAgICAgY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICBjYW52YXMuc3R5bGUuaW1hZ2VSZW5kZXJpbmcgPSAncGl4ZWxhdGVkJztcbiAgICAgICAgY2FudmFzLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGNvbmZpZy5jZWxsY29sb3JPZmY7XG5cbiAgICAgICAgaWYgKGlkKSB7IGNhbnZhcy5pZCA9IGlkOyB9XG4gICAgICAgIGNhbnZhc2NvbnRhaW5lci5hcHBlbmRDaGlsZChjYW52YXMpO1xuICAgICAgICByZXR1cm4gW2NhbnZhcywgY3R4XTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNlbnRlckF1dG9tYXRhSW5WaWV3KGNvbmZpZzogRWxlbWVudGFyeUNvbmZpZywgY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHBhblZlcnRpY2FsID0gY29uZmlnLmdlbmVyYXRpb25zIDwgY29udGV4dC5jYW52YXMuaGVpZ2h0O1xuICAgICAgICBjb25zdCB0cmFuc2xhdGVYID0gY29udGV4dC5jYW52YXMud2lkdGggLyAyIC0gY29uZmlnLndpZHRoIC8gMjtcbiAgICAgICAgY29uc3QgdHJhbnNsYXRlWSA9IGNvbnRleHQuY2FudmFzLmhlaWdodCAvIDIgLSBjb25maWcuZ2VuZXJhdGlvbnMgLyAyO1xuICAgICAgICBjb250ZXh0LnRyYW5zbGF0ZSh0cmFuc2xhdGVYLCBwYW5WZXJ0aWNhbCA/IHRyYW5zbGF0ZVkgOiAwKTtcbiAgICB9XG59IiwiZGVjbGFyZSB0eXBlIEVsZW1lbnRhcnlFbGVtZW50ID0ge1xuICAgIGNvbnRleHQ6IERvY3VtZW50RnJhZ21lbnQgfCBIVE1MRWxlbWVudCxcbiAgICBlbGVtZW50OiBIVE1MRWxlbWVudCxcblxuICAgIGJ5SWQ6IChzZWxlY3Rvcjogc3RyaW5nKSA9PiBFbGVtZW50YXJ5RWxlbWVudCxcbiAgICBieUNsYXNzOiAoc2VsZWN0b3I6IHN0cmluZykgPT4gRWxlbWVudGFyeUVsZW1lbnQsXG4gICAgd2l0aDogKGNvbnRleHQ6IERvY3VtZW50RnJhZ21lbnQgfCBIVE1MRWxlbWVudCkgPT4gRWxlbWVudGFyeUVsZW1lbnQsXG5cbiAgICBjc3M6ICguLi50b2tlbnM6IHN0cmluZ1tdKSA9PiBFbGVtZW50YXJ5RWxlbWVudCxcbiAgICBhdHRyOiAoYXR0cnM6IGFueSkgPT4gRWxlbWVudGFyeUVsZW1lbnQsXG4gICAgdGV4dDogKHRleHQ6IHN0cmluZykgPT4gRWxlbWVudGFyeUVsZW1lbnQsXG4gICAgbWFrZTogKHRhZzogc3RyaW5nKSA9PiBFbGVtZW50YXJ5RWxlbWVudCxcbiAgICBfc2VsZjogKGNvbnRleHQ6ICgpID0+IGFueSkgPT4gRWxlbWVudGFyeUVsZW1lbnQsXG59XG5cbmV4cG9ydCBjbGFzcyBFbGVtZW50YXJ5RG9tIHtcbiAgICByZW5kZXJTZWxlY3Rpb25Qcm9tcHRzKHNlbGVjdGlvbjogKHY6IG51bWJlcikgPT4gdm9pZCkge1xuICAgICAgICBjb25zdCBzZWxlY3Rpb25Db250YWluZXIgPSBlbGVtZW50YXJ5RWxlbWVudEZhY3Rvcnkud2l0aChkb2N1bWVudCkuYnlJZCgnc2VsZWN0aW9uLXZpZXcnKS5lbGVtZW50O1xuICAgICAgICBjb25zdCBnYW1lQ29udGFpbmVyID0gZWxlbWVudGFyeUVsZW1lbnRGYWN0b3J5LndpdGgoZG9jdW1lbnQpLmJ5SWQoJ2dhbWUtdmlldycpLmVsZW1lbnQ7XG4gICAgICAgIGlmICghc2VsZWN0aW9uQ29udGFpbmVyKSB7IHRocm93ICdGYWlsZWQgdG8gbG9hZCBzZWxlY3Rpb24gc2VsZWN0aW9uQ29udGFpbmVyIC0gdGhpcyBpcyBhIGZhdGFsIGVycm9yJzsgfVxuXG4gICAgICAgIGNvbnN0IGZyYWdtZW50Um9vdCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICAgICAgY29uc3QgW2NvbnRhaW5lciwgaW5wdXQsIHN1Ym1pdCwgbm90aWZpZXJdID0gdGhpcy5idWlsZEVsZW1lbnRzKGZyYWdtZW50Um9vdCk7XG5cbiAgICAgICAgaWYgKHNlbGVjdGlvbikge1xuICAgICAgICAgICAgc3VibWl0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJ1bGUgPSBwYXJzZUludCgoaW5wdXQgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWUpO1xuICAgICAgICAgICAgICAgIGlmIChydWxlID49IDAgJiYgcnVsZSA8IE1hdGgucG93KDIsIDgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGdhbWVDb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnZGlzcGxheS1ub25lJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdkaXNwbGF5LW5vbmUnKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGVjdGlvbihydWxlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBFbHNlIHdlIGhhdmUgYSBlcnJvciwgc28gZGlzcGxheSBub3RpZmllclxuICAgICAgICAgICAgICAgIG5vdGlmaWVyLmNsYXNzTGlzdC50b2dnbGUoJ2Rpc3BsYXktbm9uZScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgc2VsZWN0aW9uQ29udGFpbmVyLmFwcGVuZChmcmFnbWVudFJvb3QpO1xuICAgIH1cblxuICAgIGJ1aWxkRWxlbWVudHMoY29udGV4dDogRG9jdW1lbnRGcmFnbWVudCkgOiBIVE1MRWxlbWVudFtdIHtcbiAgICAgICAgY29uc3QgcnVsZUlucHV0Q29udGFpbmVyID0gZWxlbWVudGFyeUVsZW1lbnRGYWN0b3J5LndpdGgoY29udGV4dCkubWFrZSgnZGl2JykuY3NzKCdydWxlLWNhcmQnLCAncHQtbm9ybWFsJykuZWxlbWVudDtcbiAgICAgICAgY29uc3QgaW5wdXRQcm9tcHQgPSBlbGVtZW50YXJ5RWxlbWVudEZhY3Rvcnkud2l0aChydWxlSW5wdXRDb250YWluZXIpLm1ha2UoJ2lucHV0JykuYXR0cih7ICd0eXBlJzogJ3RleHQnIH0pLmNzcygncnVsZS1pbnB1dCcpLmVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IHN1Ym1pdEJ1dHRvbiA9IGVsZW1lbnRhcnlFbGVtZW50RmFjdG9yeS53aXRoKHJ1bGVJbnB1dENvbnRhaW5lcikubWFrZSgnYnV0dG9uJykuYXR0cih7ICd0eXBlJzogJ2J1dHRvbicgfSkuY3NzKCdydWxlLWJ0bicpLnRleHQoJ0dvIScpLmVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IG5vdGlmaWVyID0gZWxlbWVudGFyeUVsZW1lbnRGYWN0b3J5LndpdGgocnVsZUlucHV0Q29udGFpbmVyKS5tYWtlKCdzbWFsbCcpLmNzcygncnVsZS1ub3RpZmljYXRpb24nLCAnZC1ibG9jaycsICdkaXNwbGF5LW5vbmUnKS50ZXh0KCdQbGVhc2UgaW5wdXQgYSB2YWx1ZSBiZXR3ZWVuIDAgYW5kIDI1NScpLmVsZW1lbnQ7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgcnVsZUlucHV0Q29udGFpbmVyLCBpbnB1dFByb21wdCwgc3VibWl0QnV0dG9uLCBub3RpZmllclxuICAgICAgICBdO1xuICAgIH1cbn1cblxuY29uc3QgZWxlbWVudGFyeUVsZW1lbnRGYWN0b3J5OiBFbGVtZW50YXJ5RWxlbWVudCA9IHtcbiAgICBjb250ZXh0OiB1bmRlZmluZWQsXG4gICAgZWxlbWVudDogdW5kZWZpbmVkLFxuXG4gICAgYnlDbGFzczogZnVuY3Rpb24gKHNlbGVjdG9yOiBzdHJpbmcpOiBFbGVtZW50YXJ5RWxlbWVudCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZWxmKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudCA9IHRoaXMuY29udGV4dC5xdWVyeVNlbGVjdG9yKGAuJHtzZWxlY3Rvcn1gKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBieUlkOiBmdW5jdGlvbiAoc2VsZWN0b3I6IHN0cmluZyk6IEVsZW1lbnRhcnlFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbGYoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50ID0gdGhpcy5jb250ZXh0LnF1ZXJ5U2VsZWN0b3IoYCMke3NlbGVjdG9yfWApO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIG1ha2U6IGZ1bmN0aW9uICh0YWc6IHN0cmluZyk6IEVsZW1lbnRhcnlFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbGYoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50ID0gdGhpcy5jb250ZXh0LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnKSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgdGV4dDogZnVuY3Rpb24gKHRleHQ6IHN0cmluZyk6IEVsZW1lbnRhcnlFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbGYoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmlubmVyVGV4dCA9IHRleHQ7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgY3NzOiBmdW5jdGlvbiAoLi4udG9rZW5zOiBzdHJpbmdbXSk6IEVsZW1lbnRhcnlFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbGYoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoLi4udG9rZW5zKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBhdHRyOiBmdW5jdGlvbiAoYXR0cnM6IGFueSk6IEVsZW1lbnRhcnlFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbGYoKCkgPT4ge1xuICAgICAgICAgICAgZm9yICh2YXIgdG9rZW4gaW4gYXR0cnMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKHRva2VuLCBhdHRyc1t0b2tlbl0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIHdpdGg6IGZ1bmN0aW9uIChjb250ZXh0OiBEb2N1bWVudEZyYWdtZW50IHwgSFRNTEVsZW1lbnQpOiBFbGVtZW50YXJ5RWxlbWVudCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZWxmKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudCA9IGNvbnRleHQuZ2V0Um9vdE5vZGUoKSBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBfc2VsZjogZnVuY3Rpb24gKGNvbnRleHQ6ICgpID0+IEVsZW1lbnRhcnlFbGVtZW50KTogRWxlbWVudGFyeUVsZW1lbnQge1xuICAgICAgICBjb250ZXh0KCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBFbGVtZW50YXJ5QnVmZmVyIH0gZnJvbSBcIi4vYnVmZmVyXCI7XG5pbXBvcnQgeyBFbGVtZW50YXJ5Q29uZmlnIH0gZnJvbSBcIi4vYXBwXCI7XG5cbmV4cG9ydCBlbnVtIEFuaW1hdGlvblN0eWxlIHtcbiAgICBTdGVwd2lzZSA9IDAsXG4gICAgRGlyZWN0ID0gMVxufVxuXG5leHBvcnQgY2xhc3MgRWxlbWVudGFyeSB7XG4gICAgcHJpdmF0ZSBlbGVtZW50YXJ5Q29uZmlnOiBFbGVtZW50YXJ5Q29uZmlnXG4gICAgcHJpdmF0ZSBnZW5lcmF0aW9uQnVmZmVyOiBFbGVtZW50YXJ5QnVmZmVyO1xuICAgIHByaXZhdGUgYW5pbWF0aW9uU3R5bGU6IEFuaW1hdGlvblN0eWxlO1xuXG4gICAgLyoqIFxuICAgICAqICBUaGlzIGlzIHRoZSBjdXJyZW50IHJ1bGVzZXQsIGluZGljYXRpbmcgaG93IHRoZSBuZXh0IGdlbmVyYXRpb24gc2hvdWxkIGNob29zZSBpdHMgdmFsdWUgYWNjb3JkaW5nIHRvIHRoZSBjdXJyZW50IHN0YXRlXG4gICAgICogIG9mIHRoZSBjZWxsIGFuZCBpdHMgdHdvIGltbWVkaWF0ZSBuZWlnaGJvcnNcbiAgICAqL1xuICAgIHByaXZhdGUgcnVsZXNldDogQXJyYXk8bnVtYmVyPjtcblxuICAgIGJvb3RzdHJhcEFwcGxpY2F0aW9uKGNvbmZpZzogRWxlbWVudGFyeUNvbmZpZywgYW5pbWF0aW9uU3R5bGU6IEFuaW1hdGlvblN0eWxlID0gQW5pbWF0aW9uU3R5bGUuU3RlcHdpc2UpOiBFbGVtZW50YXJ5IHtcbiAgICAgICAgdGhpcy5nZW5lcmF0aW9uQnVmZmVyID0gbmV3IEVsZW1lbnRhcnlCdWZmZXIoY29uZmlnLndpZHRoLCBjb25maWcuZ2VuZXJhdGlvbnMpO1xuICAgICAgICB0aGlzLmFuaW1hdGlvblN0eWxlID0gYW5pbWF0aW9uU3R5bGU7XG4gICAgICAgIHRoaXMucnVsZXNldCA9IG5ldyBBcnJheTxudW1iZXI+KDgpO1xuICAgICAgICB0aGlzLmVsZW1lbnRhcnlDb25maWcgPSBjb25maWc7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFuaW1hdGUgdGhlIHN0ZXAgY29sY3VsYXRpb24sIHJ1biB1bnRpbGwgc3BlY2lmaWVkIGFtb3VudCBvZiBnZW5lcmF0aW9ucyBoYXMgcGFzc2VkLlxuICAgICAqL1xuICAgIGFuaW1hdGUob25TdWNjZXNzOiAoZ2VuZXJhdGlvbnM6IFVpbnQ4QXJyYXksIHllYXI6IG51bWJlcikgPT4gdm9pZCkge1xuICAgICAgICBjb25zdCB0aWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZ3JpZCA9IHRoaXMuc3RlcCh0aGlzLmN1cnJlbnRHZW5lcmF0aW9uKCkpO1xuICAgICAgICAgICAgbGV0IG5leHRHZW5lcmF0aW9uID0gdGhpcy5nZW5lcmF0aW9uQnVmZmVyLmFnZSA8IHRoaXMuZWxlbWVudGFyeUNvbmZpZy5nZW5lcmF0aW9ucyAtIDE7XG4gICAgICAgICAgICBpZiAobmV4dEdlbmVyYXRpb24pIHsgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aWNrKTsgfVxuICAgICAgICAgICAgaWYgKHRoaXMuYW5pbWF0aW9uU3R5bGUgPT09IEFuaW1hdGlvblN0eWxlLlN0ZXB3aXNlKSB7XG4gICAgICAgICAgICAgICAgb25TdWNjZXNzKGdyaWQsIHRoaXMuZ2VuZXJhdGlvbkJ1ZmZlci5hZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGljayk7XG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGlvblN0eWxlID09PSBBbmltYXRpb25TdHlsZS5EaXJlY3QpIHtcbiAgICAgICAgICAgIG9uU3VjY2Vzcyh0aGlzLmdlbmVyYXRpb25CdWZmZXIuYnVmZmVyLCB0aGlzLmVsZW1lbnRhcnlDb25maWcuZ2VuZXJhdGlvbnMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIFxuICAgICogUGVyZm9ybSBhIHN0ZXAsIGNhbGN1bGF0ZSBvbmUgZ2VuZXJhdGlvbi5cbiAgICAqIEBwYXJhbSBjdXJyZW50R2VuZXJhdGluZ0dyaWQgIFRoZSByb3cgaW4gdGhlIGdlbmVyYXRpb24gY3VycmVudGx5IGJlZWluZyBnZW5lcmF0ZWRcbiAgICAqL1xuICAgIHN0ZXAoY3VycmVudEdlbmVyYXRpbmdHcmlkOiBVaW50OEFycmF5KTogVWludDhBcnJheSB7XG4gICAgICAgIGNvbnN0IHllYXIgPSB0aGlzLmdlbmVyYXRpb25CdWZmZXIuYWdlICsgMTtcbiAgICAgICAgZm9yIChsZXQgZ3JpZGNlbGwgPSAwOyBncmlkY2VsbCA8IHRoaXMuZWxlbWVudGFyeUNvbmZpZy53aWR0aDsgZ3JpZGNlbGwrKykge1xuICAgICAgICAgICAgY29uc3QgbiA9IHRoaXMubmVpZ2hib3VycyhjdXJyZW50R2VuZXJhdGluZ0dyaWQsIGdyaWRjZWxsKTtcbiAgICAgICAgICAgIGlmICghbiAmJiBuIDwgMCkgeyB0aHJvdyBgSWxsZWdhbCBzdGF0ZTogJHtncmlkY2VsbH1gOyB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuZ2VuZXJhdGlvbkJ1ZmZlci5zZXQoeWVhciwgZ3JpZGNlbGwsIHRoaXMucnVsZShuKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGN1cnJlbnRHZW5lcmF0aW5nR3JpZDtcbiAgICB9XG5cbiAgICAvKiogXG4gICAgKiBHZXQgdGhlIG5laWdoYm91clJ1bGVzLWluZGV4IGNhbGN1bGF0ZWQgZnJvbSB0aGUgbmVpZ2hib3VycyBvZiB0aGUgY2VsbCBjdXJyZW50bHkgYmVlaW5nIHZpc2lzdGVkLlxuICAgICogQHBhcmFtIGN1cnJlbnRHZW5lcmF0aW5nR3JpZCAgVGhlIHJvdyBpbiB0aGUgZ2VuZXJhdGlvbiBjdXJyZW50bHkgYmVlaW5nIGdlbmVyYXRlZFxuICAgICAqL1xuICAgIG5laWdoYm91cnMoY3VycmVudEdlbmVyYXRpbmdHcmlkOiBVaW50OEFycmF5LCBjZWxsOiBudW1iZXIpIHtcbiAgICAgICAgaWYgKGNlbGwgPCAwIHx8IGNlbGwgPiB0aGlzLmVsZW1lbnRhcnlDb25maWcud2lkdGgpIHsgcmV0dXJuIDA7IH1cblxuICAgICAgICBjb25zdCByID0gY3VycmVudEdlbmVyYXRpbmdHcmlkW2NlbGwgKyAxID49IHRoaXMuZWxlbWVudGFyeUNvbmZpZy53aWR0aCA/IDAgOiBjZWxsICsgMV07XG4gICAgICAgIGNvbnN0IGwgPSBjdXJyZW50R2VuZXJhdGluZ0dyaWRbY2VsbCAtIDEgPD0gMCA/IDAgOiBjZWxsIC0gMV07XG4gICAgICAgIHJldHVybiAweGYgJiAociA8PCAyIHwgY3VycmVudEdlbmVyYXRpbmdHcmlkW2NlbGxdIDw8IDEgfCBsKTtcbiAgICB9XG5cbiAgICBydWxlKGluZGV4OiBudW1iZXIpIHsgcmV0dXJuIHRoaXMucnVsZXNldFt0aGlzLmVsZW1lbnRhcnlDb25maWcubmVpZ2hib3VyUnVsZXNbaW5kZXhdXTsgfVxuICAgIGdlbmVyYXRpb24oeWVhcj86IG51bWJlcikgeyByZXR1cm4gdGhpcy5nZW5lcmF0aW9uQnVmZmVyLmdlbmVyYXRpb24oeWVhcik7IH1cbiAgICBjdXJyZW50R2VuZXJhdGlvbigpIHsgcmV0dXJuIHRoaXMuZ2VuZXJhdGlvbkJ1ZmZlci5jdXJyZW50R2VuZXJhdGlvbigpOyB9XG5cbiAgICBjaGFuZ2VSdWxlc2V0KHJkZWNpbWFsOiBudW1iZXIpIHtcbiAgICAgICAgY29uc3QgZHRvYiA9IChuOiBudW1iZXIpID0+IHsgcmV0dXJuIHJkZWNpbWFsID4+IG4gJiAweDE7IH1cbiAgICAgICAgdGhpcy5ydWxlc2V0ID0gW2R0b2IoNyksIGR0b2IoNiksIGR0b2IoNSksIGR0b2IoNCksIGR0b2IoMyksIGR0b2IoMiksIGR0b2IoMSksIGR0b2IoMCldO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc291cmNlL2FwcC50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==