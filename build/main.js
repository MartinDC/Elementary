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
    cellsize: 1,
    width: 1000,
    ratio: false,
    container: '#elementary-container',
    cellcolorOff: '#84d0d4',
    cellcolorOn: '#575b6b',
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
        const flatIndex = row * this.generations + col;
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
        const flatIndex = row * this.generations + col;
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
        this.centerViewIfNeeded(config, context);
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
    centerViewIfNeeded(config, context) {
        const panX = config.width < context.canvas.width;
        const panY = config.generations < context.canvas.height;
        debugger;
        const translateX = panX ? context.canvas.width / 2 - config.width / 2 : 0;
        const translateY = panY ? context.canvas.height / 2 - config.generations / 2 : 0;
        if (translateX > 0) {
            context.translate(translateX, 0);
        }
        if (translateY > 0) {
            context.translate(0, translateY);
        }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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IndlYnBhY2s6Ly9lbGVtZW50YXJ5Ly4vc291cmNlL2FwcC50cyIsIndlYnBhY2s6Ly9lbGVtZW50YXJ5Ly4vc291cmNlL2J1ZmZlci50cyIsIndlYnBhY2s6Ly9lbGVtZW50YXJ5Ly4vc291cmNlL2Rpc3BsYXkudHMiLCJ3ZWJwYWNrOi8vZWxlbWVudGFyeS8uL3NvdXJjZS9kb20udHMiLCJ3ZWJwYWNrOi8vZWxlbWVudGFyeS8uL3NvdXJjZS9lbGVtZW50YXJ5LnRzIiwid2VicGFjazovL2VsZW1lbnRhcnkvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZWxlbWVudGFyeS93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL2VsZW1lbnRhcnkvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL2VsZW1lbnRhcnkvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGFzY2lpQ2ZnIGZyb20gXCIuLi9kYXRhL21haW4uanNvblwiO1xuaW1wb3J0IHsgRWxlbWVudGFyeURpc3BsYXkgfSBmcm9tIFwiLi9kaXNwbGF5XCI7XG5pbXBvcnQgeyBFbGVtZW50YXJ5RG9tIH0gZnJvbSBcIi4vZG9tXCI7XG5pbXBvcnQgeyBFbGVtZW50YXJ5IH0gZnJvbSBcIi4vZWxlbWVudGFyeVwiO1xuXG4vKipcbiAqIFdJS0lQRURJQTpcbiAqIFxuICogVGhlIGV2b2x1dGlvbiBvZiBhbiBlbGVtZW50YXJ5IGNlbGx1bGFyIGF1dG9tYXRvbiBjYW4gY29tcGxldGVseSBiZSBkZXNjcmliZWQgYnkgYSB0YWJsZSBzcGVjaWZ5aW5nIHRoZSBzdGF0ZSBhIGdpdmVuIGNlbGwgd2lsbCBoYXZlIGluIHRoZSBuZXh0IGdlbmVyYXRpb24gYmFzZWQgb24gdGhlIHZhbHVlIG9mIHRoZSBjZWxsIHRvIGl0cyBsZWZ0LFxuICogdGhlIHZhbHVlIGZyb20gdGhlIGNlbGwgaXRzZWxmLCBhbmQgdGhlIHZhbHVlIG9mIHRoZSBjZWxsIHRvIGl0cyByaWdodC4gXG4gKiBcbiAqIFNpbmNlIHRoZXJlIGFyZSAyw5cyw5cyPTJeMz04IHBvc3NpYmxlIGJpbmFyeSBzdGF0ZXMgZm9yIHRoZSB0aHJlZSBjZWxscyBuZWlnaGJvcmluZyBhIGdpdmVuIGNlbGwsIHRoZXJlIGFyZSBhIHRvdGFsIG9mIDJeOD0yNTYgZWxlbWVudGFyeSBjZWxsdWxhciBhdXRvbWF0YSwgZWFjaCBvZiB3aGljaCBjYW4gYmUgaW5kZXhlZCB3aXRoIGFuIDgtYml0IGJpbmFyeSBudW1iZXIgKFdvbGZyYW0gMTk4MywgMjAwMilcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgMjU2IGVsZW1lbnRhcnkgY2VsbHVsYXIgYXV0b21hdGEgY2FuIGJlIGRlc2NyaWJlZCBieSBhIDggYml0IG51bWJlci4gXG4gKiBcbiAqIFRoZSBydWxlIGRlZmluaW5nIHRoZSBjZWxsdWxhciBhdXRvbWF0b24gbXVzdCBzcGVjaWZ5IHRoZSByZXN1bHRpbmcgc3RhdGUgZm9yIGVhY2ggb2YgdGhlc2UgcG9zc2liaWxpdGllcyBzbyB0aGVyZSBhcmUgMjU2ID0gMl4yXjMgcG9zc2libGUgZWxlbWVudGFyeSBjZWxsdWxhciBhdXRvbWF0YS4gXG4gKiBTdGVwaGVuIFdvbGZyYW0gcHJvcG9zZWQgYSBzY2hlbWUsIGtub3duIGFzIHRoZSBXb2xmcmFtIGNvZGUsIHRvIGFzc2lnbiBlYWNoIHJ1bGUgYSBudW1iZXIgZnJvbSAwIHRvIDI1NSB3aGljaCBoYXMgYmVjb21lIHN0YW5kYXJkLiBFYWNoIHBvc3NpYmxlIGN1cnJlbnQgY29uZmlndXJhdGlvbiBpcyB3cml0dGVuIGluIG9yZGVyLCAxMTEsIDExMCwgLi4uLCAwMDEsIDAwMCwgXG4gKiBhbmQgdGhlIHJlc3VsdGluZyBzdGF0ZSBmb3IgZWFjaCBvZiB0aGVzZSBjb25maWd1cmF0aW9ucyBpcyB3cml0dGVuIGluIHRoZSBzYW1lIG9yZGVyIGFuZCBpbnRlcnByZXRlZCBhcyB0aGUgYmluYXJ5IHJlcHJlc2VudGF0aW9uIG9mIGFuIGludGVnZXIuIFxuICogXG4gKiBUaGlzIG51bWJlciBpcyB0YWtlbiB0byBiZSB0aGUgcnVsZSBudW1iZXIgb2YgdGhlIGF1dG9tYXRvbi4gRm9yIGV4YW1wbGUsIDExMGQ9MDExMDExMTAyLiBTbyBydWxlIDExMCBpcyBkZWZpbmVkIGJ5IHRoZSB0cmFuc2l0aW9uIHJ1bGU6XG4gKiBcbiAqIDExMVx0MTEwXHQxMDFcdDEwMFx0MDExXHQwMTBcdDAwMVx0MDAwXHRjdXJyZW50IHBhdHRlcm5cdFA9KEwsQyxSKVxuICogIDBcdDFcdDFcdDBcdDFcdDFcdDFcdDBcdG5ldyBzdGF0ZSBmb3IgY2VudGVyIGNlbGxcdE4xMTBkPShDK1IrQypSK0wqQypSKSUyXG4gKi9cblxuZXhwb3J0IGNsYXNzIEVsZW1lbnRhcnlDb25maWcge1xuICAgIHJlYWRvbmx5IG5laWdoYm91clJ1bGVzOiBBcnJheTxudW1iZXI+OyAvLyBUaGlzIGlzIHRoZSA4IHBvc3NpYmxlIHN0YXRlcyBhIGNlbGwgY2FuIHRha2UgZnJvbSBpdHMgdGhyZWUgbmVpZ2hib3Vycywga2VlcCB0aGVtIGluIGEgaW1tdXRhYmxlIGxhZGRlciB0byBiZSB1c2VkIGZvciBydWxlIGluZGV4aW5nIGxhdGVyXG5cbiAgICBjb250YWluZXI6IHN0cmluZzsgICAgICAvLyBNYXJrZXIgZWxlbWVudCB3aGVyZSBFbGVtZW50YXJ5IHdpbGwgZ2VuZXJhdGUgaXQncyB2aWV3IChwcm9tcHQgYW5kIGNhbnZhcylcbiAgICBnZW5lcmF0aW9uczogbnVtYmVyOyAgICAvLyBBbW91bnQgb2YgZ2VuZXJhdGlvbnMgdG8gc2ltdWxhdGVcbiAgICB3aWR0aDogbnVtYmVyOyAgICAgICAgICAvLyBHcmlkIHdpZHRoIFxuXG4gICAgcmF0aW86IGJvb2xlYW47ICAgICAgICAgLy8gSWYgdHJ1ZSAtIENhbGN1bGF0ZSBjZWxsc2l6ZSB0byBmaWxsIHdpbmRvdyB3aWR0aFxuICAgIGNlbGxzaXplOiBudW1iZXI7ICAgICAgIC8vIFRoaXMgaXMgdGhlIHNpemUgb2YgYSBzaW5nbGUgY2VsbFxuICAgIGNlbGxjb2xvck9mZjogc3RyaW5nOyAgIC8vIGNvbG9yIGZvciBzdGF0ZSBvZmYgLSB0aGlzIHNob3VsZCBiZSBhIGNvbG9yIHZhbGlkIGluIENTUyAoZXggJ3JnYigxMzIsIDIwOCwgMjEyKScpXG4gICAgY2VsbGNvbG9yT246IHN0cmluZzsgICAgLy8gY29sb3IgZm9yIHN0YXRlIG9uIC0gdGhpcyBzaG91bGQgYmUgYSBjb2xvciB2YWxpZCBpbiBDU1MgKGV4ICdyZ2IoODcsIDkxLCAxMDcpJylcbn07XG5cbmV4cG9ydCBjb25zdCBlbGVtZW50YXJ5Q29uZmlnOiBFbGVtZW50YXJ5Q29uZmlnID0ge1xuICAgIG5laWdoYm91clJ1bGVzOiBbNywgNiwgNSwgNCwgMywgMiwgMSwgMF0sXG5cbiAgICBnZW5lcmF0aW9uczogNTAwLFxuICAgIGNlbGxzaXplOiAxLFxuICAgIHdpZHRoOiAxMDAwLFxuXG4gICAgcmF0aW86IGZhbHNlLFxuICAgIGNvbnRhaW5lcjogJyNlbGVtZW50YXJ5LWNvbnRhaW5lcicsXG4gICAgY2VsbGNvbG9yT2ZmOiAnIzg0ZDBkNCcsXG4gICAgY2VsbGNvbG9yT246ICcjNTc1YjZiJyxcbn07XG5cbmRlY2xhcmUgdHlwZSBBU0NJSVNwbGFzaEl0ZW0gPSB7IGVuZGluZzogc3RyaW5nOyBjb2xvcjogc3RyaW5nOyBhcnQ6IHN0cmluZzsgfTtcbmRlY2xhcmUgdHlwZSBBU0NJSURhdGEgPSBQYXJ0aWFsPHsgZW50cnlBc2NpaTogQVNDSUlTcGxhc2hJdGVtIH0+XG5cbmNsYXNzIFNpbXBsZUFTQ0lJU3BsYXNoZXIge1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgYXNjaWk6IEFTQ0lJU3BsYXNoSXRlbSkgeyByZXR1cm4gdGhpczsgfVxuICAgIHNwbGFzaCgpIHsgY29uc29sZS5pbmZvKHRoaXMuYXNjaWkuYXJ0LCB0aGlzLmFzY2lpLmNvbG9yLCB0aGlzLmFzY2lpLmVuZGluZyk7IH1cbn1cblxuLy8gVE9ETzogUmFuZG9tIHNlZWRzLCBVSSBhbmQgcGl4ZWwgcGVyZmVjdCByZW5kZXJpbmcgd2l0aCBzY3JvbGxcblxuZXhwb3J0IGNsYXNzIEVsZW1lbnRhcnlBcHAge1xuICAgIHByaXZhdGUgZWxlbWVudGFyeURvbTogRWxlbWVudGFyeURvbSA9IG5ldyBFbGVtZW50YXJ5RG9tKCk7XG4gICAgcHJpdmF0ZSBkaXNwbGF5OiBFbGVtZW50YXJ5RGlzcGxheSA9IG5ldyBFbGVtZW50YXJ5RGlzcGxheSgpO1xuICAgIHByaXZhdGUgY29uZmlnOiBFbGVtZW50YXJ5Q29uZmlnID0gZWxlbWVudGFyeUNvbmZpZztcblxuICAgIC8qKiBcbiAgICAgKiBUaGlzIGZ1bmN0aW9uIGlzIHVzZWQgdG8gc3VwcGx5IGEgdXNlciBjb25maWcuIFxuICAgICAqIElmIG5vIGNvbmZpZyBpcyBzcGVjaWZpZWQgdGhlIGRlZmF1bHQgd2lsbCBiZSB1c2VkIFxuICAgICAqICovXG4gICAgd2l0aENvbmZpZyhjb25maWc6IEVsZW1lbnRhcnlDb25maWcpIHtcbiAgICAgICAgaWYgKCFjb25maWcgJiYgIWVsZW1lbnRhcnlDb25maWcpIHtcbiAgICAgICAgICAgIHRocm93IGAke3RoaXMuY29uc3RydWN0b3IubmFtZX0gLSBBIGRlZmF1bHQgb3IgdXNlciBjb25maWcgbXVzdCBiZSBwcmVzZW50YDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZyB8fCBlbGVtZW50YXJ5Q29uZmlnO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgLyoqIFxuICAgICAqIERpc3BsYXkgYSAnTU9URCcgc3R5bGUgbWVzc2FnZSBpbiB0aGUgYnJvd3NlciBjb25zb2xlLiBcbiAgICAgKiBUaGUgYXJ0IGlzIGRlZmluZWQgaW4gZGF0YS9tYWluLmpzb24uIFxuICAgICAqICovXG4gICAgd2l0aFNwbGFzaChhc2NpaTogQVNDSUlTcGxhc2hJdGVtKSB7XG4gICAgICAgIGlmICghYXNjaWkgfHwgIWFzY2lpLmFydCkge1xuICAgICAgICAgICAgdGhyb3cgYCR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfSAtIENvdWxkIG5vdCBmaW5kIHNwbGFzaCAgZGF0YWA7XG4gICAgICAgIH1cbiAgICAgICAgbmV3IFNpbXBsZUFTQ0lJU3BsYXNoZXIoYXNjaWkpLnNwbGFzaCgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBydW4oKSB7XG4gICAgICAgIGNvbnN0IGRlZmF1bHRDb25maWcgPSB0aGlzLmNvbmZpZyB8fCBlbGVtZW50YXJ5Q29uZmlnO1xuICAgICAgICBjb25zdCBlbGVtZW50YXJ5ID0gbmV3IEVsZW1lbnRhcnkoKS5ib290c3RyYXBBcHBsaWNhdGlvbihkZWZhdWx0Q29uZmlnKTtcblxuICAgICAgICB0aGlzLmVsZW1lbnRhcnlEb20ucmVuZGVyU2VsZWN0aW9uUHJvbXB0cygocnVsZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5kaXNwbGF5LmluaXQoZGVmYXVsdENvbmZpZyk7XG4gICAgICAgICAgICBlbGVtZW50YXJ5LmNoYW5nZVJ1bGVzZXQocnVsZSkuYW5pbWF0ZSgoZ2VuZXJhdGlvbnMsIHllYXIpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BsYXkucmVuZGVyKGdlbmVyYXRpb25zLCB5ZWFyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cbi8vIEFQSSAtIGhvdyB0byBydW4gZXhhbXBsZVxubmV3IEVsZW1lbnRhcnlBcHAoKS53aXRoU3BsYXNoKCg8QVNDSUlEYXRhPmFzY2lpQ2ZnKS5lbnRyeUFzY2lpKVxuICAgIC53aXRoQ29uZmlnKGVsZW1lbnRhcnlDb25maWcpLnJ1bigpOyIsIi8qKlxyXG4gKiAgRWxlbWVudGFyeUJ1ZmZlciBpcyB0aGUgaW50ZXJuYWwgZGF0YSBzdHJ1Y3R1cmUgdGhhdCBob2xkcyB0aGUgYml0LWdyaWQgbWFraW5nIHVwIHRoZSBhdXRvbWF0YS5cclxuICogICcxJyBtZWFucyByZW5kZXIgYW5kIHRyZWF0IGFzIGEgbmVpZ2hib3VyLCAnMCcgbWVhbnMgdG8gaWdub3JlXHJcbiAqL1xyXG5cclxuZXhwb3J0IGRlY2xhcmUgdHlwZSBFbGVtZW50YXJ5QmluYXJ5TnVtYmVyID0gMCB8IDE7XHJcblxyXG5leHBvcnQgY2xhc3MgRWxlbWVudGFyeUJ1ZmZlciB7XHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgaW50ZXJuYWxCdWZmZXI6IFVpbnQ4QXJyYXkgPSB1bmRlZmluZWQ7XHJcbiAgICBwcml2YXRlIGhpZ2hlc3RHZW5lcmF0aW9uSW5kZXg6IG51bWJlciA9IDA7XHJcblxyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSB3aWR0aDogbnVtYmVyLCBwcml2YXRlIHJlYWRvbmx5IGdlbmVyYXRpb25zOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLmludGVybmFsQnVmZmVyID0gdGhpcy5pbnRlcm5hbENyZWF0ZUJ1ZmZlcih0aGlzLmdlbmVyYXRpb25zLCB0aGlzLndpZHRoKTtcclxuICAgICAgICBpZiAoIXRoaXMuaW50ZXJuYWxCdWZmZXIgfHwgdGhpcy5pbnRlcm5hbEJ1ZmZlci5idWZmZXIuYnl0ZUxlbmd0aCA8IHRoaXMuc2l6ZSkge1xyXG4gICAgICAgICAgICB0aHJvdyBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9IC0gRmFpbGVkIHRvIGNyZWF0ZSBidWZmZXIgd2l0aCBzaXplICR7dGhpcy5zaXplfWA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmludGVybmFsQnVmZmVyLmZpbGwoMCwgMCwgdGhpcy5zaXplKTsgLy8gU2VlZCBmaXJzdCBnZW5lcmF0aW9uXHJcbiAgICAgICAgdGhpcy5pbnRlcm5hbEJ1ZmZlci5maWxsKDEsIHRoaXMud2lkdGggLyAyLCB0aGlzLndpZHRoIC8gMiArIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBhZ2UoKSB7IHJldHVybiB0aGlzLmhpZ2hlc3RHZW5lcmF0aW9uSW5kZXg7IH0gLy8gQW1vdW50IG9mIHllYXJzIHByb2Nlc3NlZCBzbyBmYXIgXHJcbiAgICBnZXQgc2l6ZSgpIHsgcmV0dXJuIHRoaXMuZ2VuZXJhdGlvbnMgKiB0aGlzLndpZHRoOyB9XHJcbiAgICBnZXQgYnVmZmVyKCkgeyByZXR1cm4gdGhpcy5pbnRlcm5hbEJ1ZmZlcjsgfVxyXG5cclxuICAgIHB1YmxpYyBjdXJyZW50R2VuZXJhdGlvbigpOiBVaW50OEFycmF5IHsgcmV0dXJuIHRoaXMuZ2VuZXJhdGlvbih0aGlzLmhpZ2hlc3RHZW5lcmF0aW9uSW5kZXgpOyB9XHJcbiAgICBwdWJsaWMgZ2VuZXJhdGlvbih5ZWFyOiBudW1iZXIpOiBVaW50OEFycmF5IHsgcmV0dXJuIHRoaXMuaW50ZXJuYWxCdWZmZXIuc3ViYXJyYXkodGhpcy53aWR0aCAqIHllYXIsIHRoaXMud2lkdGggKiB5ZWFyICsgdGhpcy53aWR0aCk7IH1cclxuICAgIHB1YmxpYyB0b2dnbGUoeWVhcjogbnVtYmVyLCBjb2w6IG51bWJlcikgeyB0aGlzLmludGVybmFsRWxlbWVudFNldCh5ZWFyLCBjb2wsIHRoaXMuaW50ZXJuYWxFbGVtZW50QXQoeWVhciwgY29sKSA/IDAgOiAxKTsgfVxyXG4gICAgcHVibGljIHNldCh5ZWFyOiBudW1iZXIsIGNvbDogbnVtYmVyLCB2YWx1ZTogbnVtYmVyKSB7IHRoaXMuaW50ZXJuYWxFbGVtZW50U2V0KHllYXIsIGNvbCwgdmFsdWUpOyB9XHJcbiAgICBwdWJsaWMgcmVhZCh5ZWFyOiBudW1iZXIsIGNvbDogbnVtYmVyKSB7IHJldHVybiB0aGlzLmludGVybmFsRWxlbWVudEF0KHllYXIsIGNvbCk7IH1cclxuXHJcbiAgICBwcml2YXRlIGludGVybmFsRWxlbWVudFNldChyb3c6IG51bWJlciwgY29sOiBudW1iZXIsIGZsYWc6IG51bWJlcikge1xyXG4gICAgICAgIGNvbnN0IGJpbmFyeU51bWJlciA9IGZsYWcgYXMgRWxlbWVudGFyeUJpbmFyeU51bWJlcjtcclxuICAgICAgICBjb25zdCBmbGF0SW5kZXggPSByb3cgKiB0aGlzLmdlbmVyYXRpb25zICsgY29sO1xyXG5cclxuICAgICAgICBpZiAoZmxhdEluZGV4IDwgMCB8fCBmbGF0SW5kZXggPiB0aGlzLnNpemUpIHsgdGhyb3cgYCR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfSAtIEFyZ3VtZW50IG91dCBvZiBib3VuZHMgJHtyb3d9LCAke2NvbH1gOyB9XHJcbiAgICAgICAgaWYgKGJpbmFyeU51bWJlciAhPSAxICYmIGJpbmFyeU51bWJlciAhPSAwKSB7IHRocm93IGAke3RoaXMuY29uc3RydWN0b3IubmFtZX0gLSBGbGFnIGlzIG5vdCBpbiBhIGNvcnJlY3QgZm9ybS4gU2hvdWxkIGJlIGEgYml0ICgwIG9yIDEpIGA7IH1cclxuXHJcbiAgICAgICAgdGhpcy5idWZmZXJbZmxhdEluZGV4XSA9IGZsYWc7IC8vIENoZWNrIGlmIHdlIGhhdmUgcmVhY2hlZCBhIGhpZ2hlciBnZW5lcmF0aW9uXHJcbiAgICAgICAgaWYgKHJvdyA+IHRoaXMuaGlnaGVzdEdlbmVyYXRpb25JbmRleCkgeyAvLyBUT0RPIG1vdmUgdGhpcyB0byBlbGVtZW50YXJ5LnRzIGZvciBwZXJmb3JtYW5jZVxyXG4gICAgICAgICAgICB0aGlzLmhpZ2hlc3RHZW5lcmF0aW9uSW5kZXggPSByb3c7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaW50ZXJuYWxFbGVtZW50QXQocm93OiBudW1iZXIsIGNvbDogbnVtYmVyKSB7XHJcbiAgICAgICAgY29uc3QgZmxhdEluZGV4ID0gcm93ICogdGhpcy5nZW5lcmF0aW9ucyArIGNvbDtcclxuICAgICAgICBpZiAoZmxhdEluZGV4IDwgMCB8fCBmbGF0SW5kZXggPiB0aGlzLnNpemUpIHtcclxuICAgICAgICAgICAgdGhyb3cgYCR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfSAtIEFyZ3VtZW50IG91dCBvZiBib3VuZHMgJHtyb3d9LCAke2NvbH1gO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5idWZmZXJbZmxhdEluZGV4XTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGludGVybmFsQ3JlYXRlQnVmZmVyKHJvd3M6IG51bWJlciwgY29sczogbnVtYmVyKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKCFyb3dzIHx8ICFjb2xzIHx8IHJvd3MgPD0gMCB8fCBjb2xzIDw9IDApIHtcclxuICAgICAgICAgICAgICAgIHRocm93IEVycm9yKGAke3RoaXMuY29uc3RydWN0b3IubmFtZX0gLSBJbnZhbGlkIHJvdyBhbmQgY29sIGRhdGFgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIocm93cyAqIGNvbHMpO1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyLCAwLCByb3dzICogY29scyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICB0aHJvdyBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9IC0gJHtlfWA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiaW1wb3J0IHsgRWxlbWVudGFyeUNvbmZpZyB9IGZyb20gXCIuL2FwcFwiO1xuXG5leHBvcnQgY2xhc3MgRWxlbWVudGFyeURpc3BsYXkge1xuICAgIHB1YmxpYyBjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG4gICAgcHVibGljIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQ7XG5cbiAgICBwcml2YXRlIGVsZW1lbnRhcnljb25maWc6IEVsZW1lbnRhcnlDb25maWc7XG5cbiAgICBwdWJsaWMgaW5pdChjb25maWc6IEVsZW1lbnRhcnlDb25maWcsIGNvbnRhaW5lcj86IHN0cmluZywgaWQ/OiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKCFjb250YWluZXIpIHsgY29udGFpbmVyID0gJ2dhbWUtdmlldyc7IH1cbiAgICAgICAgaWYgKCFpZCkgeyBpZCA9ICdnYW1lLWNhbnZhcyc7IH1cblxuICAgICAgICBjb25zdCBbY2FudmFzLCBjb250ZXh0XSA9IHRoaXMuY3JlYXRlSERQSUNhbnZhc0VsZW1lbnQoY29uZmlnLCBjb250YWluZXIsIGlkKTtcbiAgICAgICAgdGhpcy5jZW50ZXJWaWV3SWZOZWVkZWQoY29uZmlnLCBjb250ZXh0KTtcblxuICAgICAgICB0aGlzLmVsZW1lbnRhcnljb25maWcgPSBjb25maWc7XG4gICAgICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW5kZXIoZ2VuZXJhdGlvbnM6IFVpbnQ4QXJyYXksIHllYXI6IG51bWJlcikge1xuICAgICAgICBpZiAoIXRoaXMuZWxlbWVudGFyeWNvbmZpZykgeyB0aHJvdyAnRWxlbW50YXJ5Q29uZmlnIGhhcyB0byBiZSBzZXQgaWYgdGhlIGdyaWQgc2hvdWxkIGJlIGNhbnZhcyByZW5kZXJlZCc7IH1cbiAgICAgICAgaWYgKCFnZW5lcmF0aW9ucykgeyB0aHJvdyAnSWxsZWdhbCBzdGF0ZSAtIERpc3BsYXkgZ3JpZCBpcyB1bmRlZmluZWQnOyB9XG5cbiAgICAgICAgY29uc3QgY29uZmlnc2l6ZSA9IHRoaXMuZWxlbWVudGFyeWNvbmZpZy5jZWxsc2l6ZTtcbiAgICAgICAgY29uc3QgZ3JpZGhlaWdodCA9IHRoaXMuZWxlbWVudGFyeWNvbmZpZy5nZW5lcmF0aW9ucztcbiAgICAgICAgY29uc3QgZ3JpZHdpZHRoID0gdGhpcy5lbGVtZW50YXJ5Y29uZmlnLndpZHRoO1xuICAgICAgICBjb25zdCByYXRpbyA9IHRoaXMuZWxlbWVudGFyeWNvbmZpZy5yYXRpbztcblxuICAgICAgICBsZXQgY2VsbHcgPSByYXRpbyA/IHRoaXMuY2FudmFzLndpZHRoICogd2luZG93LmRldmljZVBpeGVsUmF0aW8gLyBncmlkd2lkdGggOiBjb25maWdzaXplO1xuICAgICAgICBsZXQgY2VsbGggPSByYXRpbyA/IHRoaXMuY2FudmFzLmhlaWdodCAqIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIC8gZ3JpZGhlaWdodCA6IGNvbmZpZ3NpemU7XG5cbiAgICAgICAgZ2VuZXJhdGlvbnMuZm9yRWFjaCgoY2VsbCwgZ3JpZGNlbGwpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5maWxsU3R5bGUgPSBjZWxsID8gdGhpcy5lbGVtZW50YXJ5Y29uZmlnLmNlbGxjb2xvck9uIDogdGhpcy5lbGVtZW50YXJ5Y29uZmlnLmNlbGxjb2xvck9mZjtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5maWxsUmVjdChncmlkY2VsbCAqIGNlbGx3LCB5ZWFyICogY2VsbGgsIGNlbGx3LCBjZWxsaCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgY3JlYXRlSERQSUNhbnZhc0VsZW1lbnQoY29uZmlnOiBFbGVtZW50YXJ5Q29uZmlnLCBjb250YWluZXI6IHN0cmluZywgaWQ6IHN0cmluZyA9IHVuZGVmaW5lZCk6IFtIVE1MQ2FudmFzRWxlbWVudCwgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEXSB7XG4gICAgICAgIGNvbnN0IGNhbnZhc2NvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbnRhaW5lcik7XG4gICAgICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpIGFzIEhUTUxDYW52YXNFbGVtZW50O1xuICAgICAgICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICBjb25zdCBkZXZpY2VwaXhlbHJhdGlvID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMTtcbiAgICAgICAgbGV0IHsgd2lkdGgsIGhlaWdodCB9ID0gY2FudmFzY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICAgIGlmICghd2lkdGggfHwgIWhlaWdodCkge1xuICAgICAgICAgICAgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgICAgICAgIGhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoICogZGV2aWNlcGl4ZWxyYXRpbztcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IGhlaWdodCAqIGRldmljZXBpeGVscmF0aW87XG4gICAgICAgIGNhbnZhcy5zdHlsZS53aWR0aCA9IGAke3dpZHRoICogZGV2aWNlcGl4ZWxyYXRpb31weGA7XG4gICAgICAgIGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHQgKiBkZXZpY2VwaXhlbHJhdGlvfXB4YDtcblxuICAgICAgICBjdHguaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG4gICAgICAgIGNhbnZhcy5zdHlsZS5pbWFnZVJlbmRlcmluZyA9ICdwaXhlbGF0ZWQnO1xuICAgICAgICBjYW52YXMuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gY29uZmlnLmNlbGxjb2xvck9mZjtcblxuICAgICAgICBpZiAoaWQpIHsgY2FudmFzLmlkID0gaWQ7IH1cbiAgICAgICAgY2FudmFzY29udGFpbmVyLmFwcGVuZENoaWxkKGNhbnZhcyk7XG4gICAgICAgIHJldHVybiBbY2FudmFzLCBjdHhdO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2VudGVyVmlld0lmTmVlZGVkKGNvbmZpZzogRWxlbWVudGFyeUNvbmZpZywgY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKSB7XG4gICAgICAgIGNvbnN0IHBhblggPSBjb25maWcud2lkdGggPCBjb250ZXh0LmNhbnZhcy53aWR0aDtcbiAgICAgICAgY29uc3QgcGFuWSA9IGNvbmZpZy5nZW5lcmF0aW9ucyA8IGNvbnRleHQuY2FudmFzLmhlaWdodDtcbmRlYnVnZ2VyO1xuICAgICAgICBjb25zdCB0cmFuc2xhdGVYID0gcGFuWCA/IGNvbnRleHQuY2FudmFzLndpZHRoIC8gMiAtIGNvbmZpZy53aWR0aCAvIDIgOiAwO1xuICAgICAgICBjb25zdCB0cmFuc2xhdGVZID0gcGFuWSA/IGNvbnRleHQuY2FudmFzLmhlaWdodCAvIDIgLSBjb25maWcuZ2VuZXJhdGlvbnMgLyAyIDogMDtcbiAgICAgICAgaWYgKHRyYW5zbGF0ZVggPiAwKSB7IGNvbnRleHQudHJhbnNsYXRlKHRyYW5zbGF0ZVgsIDApOyB9XG4gICAgICAgIGlmICh0cmFuc2xhdGVZID4gMCkgeyBjb250ZXh0LnRyYW5zbGF0ZSgwLCB0cmFuc2xhdGVZKTsgfVxuICAgIH1cbn0iLCJkZWNsYXJlIHR5cGUgRWxlbWVudGFyeUVsZW1lbnQgPSB7XG4gICAgY29udGV4dDogRG9jdW1lbnRGcmFnbWVudCB8IEhUTUxFbGVtZW50LFxuICAgIGVsZW1lbnQ6IEhUTUxFbGVtZW50LFxuXG4gICAgYnlJZDogKHNlbGVjdG9yOiBzdHJpbmcpID0+IEVsZW1lbnRhcnlFbGVtZW50LFxuICAgIGJ5Q2xhc3M6IChzZWxlY3Rvcjogc3RyaW5nKSA9PiBFbGVtZW50YXJ5RWxlbWVudCxcbiAgICB3aXRoOiAoY29udGV4dDogRG9jdW1lbnRGcmFnbWVudCB8IEhUTUxFbGVtZW50KSA9PiBFbGVtZW50YXJ5RWxlbWVudCxcblxuICAgIGNzczogKC4uLnRva2Vuczogc3RyaW5nW10pID0+IEVsZW1lbnRhcnlFbGVtZW50LFxuICAgIGF0dHI6IChhdHRyczogYW55KSA9PiBFbGVtZW50YXJ5RWxlbWVudCxcbiAgICB0ZXh0OiAodGV4dDogc3RyaW5nKSA9PiBFbGVtZW50YXJ5RWxlbWVudCxcbiAgICBtYWtlOiAodGFnOiBzdHJpbmcpID0+IEVsZW1lbnRhcnlFbGVtZW50LFxuICAgIF9zZWxmOiAoY29udGV4dDogKCkgPT4gYW55KSA9PiBFbGVtZW50YXJ5RWxlbWVudCxcbn1cblxuZXhwb3J0IGNsYXNzIEVsZW1lbnRhcnlEb20ge1xuICAgIHJlbmRlclNlbGVjdGlvblByb21wdHMoc2VsZWN0aW9uOiAodjogbnVtYmVyKSA9PiB2b2lkKSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdGlvbkNvbnRhaW5lciA9IGVsZW1lbnRhcnlFbGVtZW50RmFjdG9yeS53aXRoKGRvY3VtZW50KS5ieUlkKCdzZWxlY3Rpb24tdmlldycpLmVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IGdhbWVDb250YWluZXIgPSBlbGVtZW50YXJ5RWxlbWVudEZhY3Rvcnkud2l0aChkb2N1bWVudCkuYnlJZCgnZ2FtZS12aWV3JykuZWxlbWVudDtcbiAgICAgICAgaWYgKCFzZWxlY3Rpb25Db250YWluZXIpIHsgdGhyb3cgJ0ZhaWxlZCB0byBsb2FkIHNlbGVjdGlvbiBzZWxlY3Rpb25Db250YWluZXIgLSB0aGlzIGlzIGEgZmF0YWwgZXJyb3InOyB9XG5cbiAgICAgICAgY29uc3QgZnJhZ21lbnRSb290ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgICAgICBjb25zdCBbY29udGFpbmVyLCBpbnB1dCwgc3VibWl0LCBub3RpZmllcl0gPSB0aGlzLmJ1aWxkRWxlbWVudHMoZnJhZ21lbnRSb290KTtcblxuICAgICAgICBpZiAoc2VsZWN0aW9uKSB7XG4gICAgICAgICAgICBzdWJtaXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcnVsZSA9IHBhcnNlSW50KChpbnB1dCBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgaWYgKHJ1bGUgPj0gMCAmJiBydWxlIDwgTWF0aC5wb3coMiwgOCkpIHtcbiAgICAgICAgICAgICAgICAgICAgZ2FtZUNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKCdkaXNwbGF5LW5vbmUnKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ2Rpc3BsYXktbm9uZScpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZWN0aW9uKHJ1bGUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIEVsc2Ugd2UgaGF2ZSBhIGVycm9yLCBzbyBkaXNwbGF5IG5vdGlmaWVyXG4gICAgICAgICAgICAgICAgbm90aWZpZXIuY2xhc3NMaXN0LnRvZ2dsZSgnZGlzcGxheS1ub25lJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBzZWxlY3Rpb25Db250YWluZXIuYXBwZW5kKGZyYWdtZW50Um9vdCk7XG4gICAgfVxuXG4gICAgYnVpbGRFbGVtZW50cyhjb250ZXh0OiBEb2N1bWVudEZyYWdtZW50KSA6IEhUTUxFbGVtZW50W10ge1xuICAgICAgICBjb25zdCBydWxlSW5wdXRDb250YWluZXIgPSBlbGVtZW50YXJ5RWxlbWVudEZhY3Rvcnkud2l0aChjb250ZXh0KS5tYWtlKCdkaXYnKS5jc3MoJ3J1bGUtY2FyZCcsICdwdC1ub3JtYWwnKS5lbGVtZW50O1xuICAgICAgICBjb25zdCBpbnB1dFByb21wdCA9IGVsZW1lbnRhcnlFbGVtZW50RmFjdG9yeS53aXRoKHJ1bGVJbnB1dENvbnRhaW5lcikubWFrZSgnaW5wdXQnKS5hdHRyKHsgJ3R5cGUnOiAndGV4dCcgfSkuY3NzKCdydWxlLWlucHV0JykuZWxlbWVudDtcbiAgICAgICAgY29uc3Qgc3VibWl0QnV0dG9uID0gZWxlbWVudGFyeUVsZW1lbnRGYWN0b3J5LndpdGgocnVsZUlucHV0Q29udGFpbmVyKS5tYWtlKCdidXR0b24nKS5hdHRyKHsgJ3R5cGUnOiAnYnV0dG9uJyB9KS5jc3MoJ3J1bGUtYnRuJykudGV4dCgnR28hJykuZWxlbWVudDtcbiAgICAgICAgY29uc3Qgbm90aWZpZXIgPSBlbGVtZW50YXJ5RWxlbWVudEZhY3Rvcnkud2l0aChydWxlSW5wdXRDb250YWluZXIpLm1ha2UoJ3NtYWxsJykuY3NzKCdydWxlLW5vdGlmaWNhdGlvbicsICdkLWJsb2NrJywgJ2Rpc3BsYXktbm9uZScpLnRleHQoJ1BsZWFzZSBpbnB1dCBhIHZhbHVlIGJldHdlZW4gMCBhbmQgMjU1JykuZWxlbWVudDtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBydWxlSW5wdXRDb250YWluZXIsIGlucHV0UHJvbXB0LCBzdWJtaXRCdXR0b24sIG5vdGlmaWVyXG4gICAgICAgIF07XG4gICAgfVxufVxuXG5jb25zdCBlbGVtZW50YXJ5RWxlbWVudEZhY3Rvcnk6IEVsZW1lbnRhcnlFbGVtZW50ID0ge1xuICAgIGNvbnRleHQ6IHVuZGVmaW5lZCxcbiAgICBlbGVtZW50OiB1bmRlZmluZWQsXG5cbiAgICBieUNsYXNzOiBmdW5jdGlvbiAoc2VsZWN0b3I6IHN0cmluZyk6IEVsZW1lbnRhcnlFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbGYoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50ID0gdGhpcy5jb250ZXh0LnF1ZXJ5U2VsZWN0b3IoYC4ke3NlbGVjdG9yfWApO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIGJ5SWQ6IGZ1bmN0aW9uIChzZWxlY3Rvcjogc3RyaW5nKTogRWxlbWVudGFyeUVsZW1lbnQge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2VsZigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQgPSB0aGlzLmNvbnRleHQucXVlcnlTZWxlY3RvcihgIyR7c2VsZWN0b3J9YCk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgbWFrZTogZnVuY3Rpb24gKHRhZzogc3RyaW5nKTogRWxlbWVudGFyeUVsZW1lbnQge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2VsZigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQgPSB0aGlzLmNvbnRleHQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICB0ZXh0OiBmdW5jdGlvbiAodGV4dDogc3RyaW5nKTogRWxlbWVudGFyeUVsZW1lbnQge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2VsZigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuaW5uZXJUZXh0ID0gdGV4dDtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBjc3M6IGZ1bmN0aW9uICguLi50b2tlbnM6IHN0cmluZ1tdKTogRWxlbWVudGFyeUVsZW1lbnQge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2VsZigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCguLi50b2tlbnMpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIGF0dHI6IGZ1bmN0aW9uIChhdHRyczogYW55KTogRWxlbWVudGFyeUVsZW1lbnQge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2VsZigoKSA9PiB7XG4gICAgICAgICAgICBmb3IgKHZhciB0b2tlbiBpbiBhdHRycykge1xuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUodG9rZW4sIGF0dHJzW3Rva2VuXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgd2l0aDogZnVuY3Rpb24gKGNvbnRleHQ6IERvY3VtZW50RnJhZ21lbnQgfCBIVE1MRWxlbWVudCk6IEVsZW1lbnRhcnlFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbGYoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50ID0gY29udGV4dC5nZXRSb290Tm9kZSgpIGFzIEhUTUxFbGVtZW50O1xuICAgICAgICAgICAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIF9zZWxmOiBmdW5jdGlvbiAoY29udGV4dDogKCkgPT4gRWxlbWVudGFyeUVsZW1lbnQpOiBFbGVtZW50YXJ5RWxlbWVudCB7XG4gICAgICAgIGNvbnRleHQoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxufSIsImltcG9ydCB7IEVsZW1lbnRhcnlCdWZmZXIgfSBmcm9tIFwiLi9idWZmZXJcIjtcbmltcG9ydCB7IEVsZW1lbnRhcnlDb25maWcgfSBmcm9tIFwiLi9hcHBcIjtcblxuZXhwb3J0IGVudW0gQW5pbWF0aW9uU3R5bGUge1xuICAgIFN0ZXB3aXNlID0gMCxcbiAgICBEaXJlY3QgPSAxXG59XG5cbmV4cG9ydCBjbGFzcyBFbGVtZW50YXJ5IHtcbiAgICBwcml2YXRlIGVsZW1lbnRhcnlDb25maWc6IEVsZW1lbnRhcnlDb25maWdcbiAgICBwcml2YXRlIGdlbmVyYXRpb25CdWZmZXI6IEVsZW1lbnRhcnlCdWZmZXI7XG4gICAgcHJpdmF0ZSBhbmltYXRpb25TdHlsZTogQW5pbWF0aW9uU3R5bGU7XG5cbiAgICAvKiogXG4gICAgICogIFRoaXMgaXMgdGhlIGN1cnJlbnQgcnVsZXNldCwgaW5kaWNhdGluZyBob3cgdGhlIG5leHQgZ2VuZXJhdGlvbiBzaG91bGQgY2hvb3NlIGl0cyB2YWx1ZSBhY2NvcmRpbmcgdG8gdGhlIGN1cnJlbnQgc3RhdGVcbiAgICAgKiAgb2YgdGhlIGNlbGwgYW5kIGl0cyB0d28gaW1tZWRpYXRlIG5laWdoYm9yc1xuICAgICovXG4gICAgcHJpdmF0ZSBydWxlc2V0OiBBcnJheTxudW1iZXI+O1xuXG4gICAgYm9vdHN0cmFwQXBwbGljYXRpb24oY29uZmlnOiBFbGVtZW50YXJ5Q29uZmlnLCBhbmltYXRpb25TdHlsZTogQW5pbWF0aW9uU3R5bGUgPSBBbmltYXRpb25TdHlsZS5TdGVwd2lzZSk6IEVsZW1lbnRhcnkge1xuICAgICAgICB0aGlzLmdlbmVyYXRpb25CdWZmZXIgPSBuZXcgRWxlbWVudGFyeUJ1ZmZlcihjb25maWcud2lkdGgsIGNvbmZpZy5nZW5lcmF0aW9ucyk7XG4gICAgICAgIHRoaXMuYW5pbWF0aW9uU3R5bGUgPSBhbmltYXRpb25TdHlsZTtcbiAgICAgICAgdGhpcy5ydWxlc2V0ID0gbmV3IEFycmF5PG51bWJlcj4oOCk7XG4gICAgICAgIHRoaXMuZWxlbWVudGFyeUNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQW5pbWF0ZSB0aGUgc3RlcCBjb2xjdWxhdGlvbiwgcnVuIHVudGlsbCBzcGVjaWZpZWQgYW1vdW50IG9mIGdlbmVyYXRpb25zIGhhcyBwYXNzZWQuXG4gICAgICovXG4gICAgYW5pbWF0ZShvblN1Y2Nlc3M6IChnZW5lcmF0aW9uczogVWludDhBcnJheSwgeWVhcjogbnVtYmVyKSA9PiB2b2lkKSB7XG4gICAgICAgIGNvbnN0IHRpY2sgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBncmlkID0gdGhpcy5zdGVwKHRoaXMuY3VycmVudEdlbmVyYXRpb24oKSk7XG4gICAgICAgICAgICBsZXQgbmV4dEdlbmVyYXRpb24gPSB0aGlzLmdlbmVyYXRpb25CdWZmZXIuYWdlIDwgdGhpcy5lbGVtZW50YXJ5Q29uZmlnLmdlbmVyYXRpb25zIC0gMTtcbiAgICAgICAgICAgIGlmIChuZXh0R2VuZXJhdGlvbikgeyB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRpY2spOyB9XG4gICAgICAgICAgICBpZiAodGhpcy5hbmltYXRpb25TdHlsZSA9PT0gQW5pbWF0aW9uU3R5bGUuU3RlcHdpc2UpIHtcbiAgICAgICAgICAgICAgICBvblN1Y2Nlc3MoZ3JpZCwgdGhpcy5nZW5lcmF0aW9uQnVmZmVyLmFnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aWNrKTtcbiAgICAgICAgaWYgKHRoaXMuYW5pbWF0aW9uU3R5bGUgPT09IEFuaW1hdGlvblN0eWxlLkRpcmVjdCkge1xuICAgICAgICAgICAgb25TdWNjZXNzKHRoaXMuZ2VuZXJhdGlvbkJ1ZmZlci5idWZmZXIsIHRoaXMuZWxlbWVudGFyeUNvbmZpZy5nZW5lcmF0aW9ucyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogXG4gICAgKiBQZXJmb3JtIGEgc3RlcCwgY2FsY3VsYXRlIG9uZSBnZW5lcmF0aW9uLlxuICAgICogQHBhcmFtIGN1cnJlbnRHZW5lcmF0aW5nR3JpZCAgVGhlIHJvdyBpbiB0aGUgZ2VuZXJhdGlvbiBjdXJyZW50bHkgYmVlaW5nIGdlbmVyYXRlZFxuICAgICovXG4gICAgc3RlcChjdXJyZW50R2VuZXJhdGluZ0dyaWQ6IFVpbnQ4QXJyYXkpOiBVaW50OEFycmF5IHtcbiAgICAgICAgY29uc3QgeWVhciA9IHRoaXMuZ2VuZXJhdGlvbkJ1ZmZlci5hZ2UgKyAxO1xuICAgICAgICBmb3IgKGxldCBncmlkY2VsbCA9IDA7IGdyaWRjZWxsIDwgdGhpcy5lbGVtZW50YXJ5Q29uZmlnLndpZHRoOyBncmlkY2VsbCsrKSB7XG4gICAgICAgICAgICBjb25zdCBuID0gdGhpcy5uZWlnaGJvdXJzKGN1cnJlbnRHZW5lcmF0aW5nR3JpZCwgZ3JpZGNlbGwpO1xuICAgICAgICAgICAgaWYgKCFuICYmIG4gPCAwKSB7IHRocm93IGBJbGxlZ2FsIHN0YXRlOiAke2dyaWRjZWxsfWA7IH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5nZW5lcmF0aW9uQnVmZmVyLnNldCh5ZWFyLCBncmlkY2VsbCwgdGhpcy5ydWxlKG4pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY3VycmVudEdlbmVyYXRpbmdHcmlkO1xuICAgIH1cblxuICAgIC8qKiBcbiAgICAqIEdldCB0aGUgbmVpZ2hib3VyUnVsZXMtaW5kZXggY2FsY3VsYXRlZCBmcm9tIHRoZSBuZWlnaGJvdXJzIG9mIHRoZSBjZWxsIGN1cnJlbnRseSBiZWVpbmcgdmlzaXN0ZWQuXG4gICAgKiBAcGFyYW0gY3VycmVudEdlbmVyYXRpbmdHcmlkICBUaGUgcm93IGluIHRoZSBnZW5lcmF0aW9uIGN1cnJlbnRseSBiZWVpbmcgZ2VuZXJhdGVkXG4gICAgICovXG4gICAgbmVpZ2hib3VycyhjdXJyZW50R2VuZXJhdGluZ0dyaWQ6IFVpbnQ4QXJyYXksIGNlbGw6IG51bWJlcikge1xuICAgICAgICBpZiAoY2VsbCA8IDAgfHwgY2VsbCA+IHRoaXMuZWxlbWVudGFyeUNvbmZpZy53aWR0aCkgeyByZXR1cm4gMDsgfVxuXG4gICAgICAgIGNvbnN0IHIgPSBjdXJyZW50R2VuZXJhdGluZ0dyaWRbY2VsbCArIDEgPj0gdGhpcy5lbGVtZW50YXJ5Q29uZmlnLndpZHRoID8gMCA6IGNlbGwgKyAxXTtcbiAgICAgICAgY29uc3QgbCA9IGN1cnJlbnRHZW5lcmF0aW5nR3JpZFtjZWxsIC0gMSA8PSAwID8gMCA6IGNlbGwgLSAxXTtcbiAgICAgICAgcmV0dXJuIDB4ZiAmIChyIDw8IDIgfCBjdXJyZW50R2VuZXJhdGluZ0dyaWRbY2VsbF0gPDwgMSB8IGwpO1xuICAgIH1cblxuICAgIHJ1bGUoaW5kZXg6IG51bWJlcikgeyByZXR1cm4gdGhpcy5ydWxlc2V0W3RoaXMuZWxlbWVudGFyeUNvbmZpZy5uZWlnaGJvdXJSdWxlc1tpbmRleF1dOyB9XG4gICAgZ2VuZXJhdGlvbih5ZWFyPzogbnVtYmVyKSB7IHJldHVybiB0aGlzLmdlbmVyYXRpb25CdWZmZXIuZ2VuZXJhdGlvbih5ZWFyKTsgfVxuICAgIGN1cnJlbnRHZW5lcmF0aW9uKCkgeyByZXR1cm4gdGhpcy5nZW5lcmF0aW9uQnVmZmVyLmN1cnJlbnRHZW5lcmF0aW9uKCk7IH1cblxuICAgIGNoYW5nZVJ1bGVzZXQocmRlY2ltYWw6IG51bWJlcikge1xuICAgICAgICBjb25zdCBkdG9iID0gKG46IG51bWJlcikgPT4geyByZXR1cm4gcmRlY2ltYWwgPj4gbiAmIDB4MTsgfVxuICAgICAgICB0aGlzLnJ1bGVzZXQgPSBbZHRvYig3KSwgZHRvYig2KSwgZHRvYig1KSwgZHRvYig0KSwgZHRvYigzKSwgZHRvYigyKSwgZHRvYigxKSwgZHRvYigwKV07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn0iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBpcyByZWZlcmVuY2VkIGJ5IG90aGVyIG1vZHVsZXMgc28gaXQgY2FuJ3QgYmUgaW5saW5lZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9zb3VyY2UvYXBwLnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9