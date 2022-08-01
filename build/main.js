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
    generations: 1000,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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IndlYnBhY2s6Ly9lbGVtZW50YXJ5Ly4vc291cmNlL2FwcC50cyIsIndlYnBhY2s6Ly9lbGVtZW50YXJ5Ly4vc291cmNlL2J1ZmZlci50cyIsIndlYnBhY2s6Ly9lbGVtZW50YXJ5Ly4vc291cmNlL2Rpc3BsYXkudHMiLCJ3ZWJwYWNrOi8vZWxlbWVudGFyeS8uL3NvdXJjZS9kb20udHMiLCJ3ZWJwYWNrOi8vZWxlbWVudGFyeS8uL3NvdXJjZS9lbGVtZW50YXJ5LnRzIiwid2VicGFjazovL2VsZW1lbnRhcnkvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZWxlbWVudGFyeS93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL2VsZW1lbnRhcnkvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL2VsZW1lbnRhcnkvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGFzY2lpQ2ZnIGZyb20gXCIuLi9kYXRhL21haW4uanNvblwiO1xuaW1wb3J0IHsgRWxlbWVudGFyeURpc3BsYXkgfSBmcm9tIFwiLi9kaXNwbGF5XCI7XG5pbXBvcnQgeyBFbGVtZW50YXJ5RG9tIH0gZnJvbSBcIi4vZG9tXCI7XG5pbXBvcnQgeyBFbGVtZW50YXJ5IH0gZnJvbSBcIi4vZWxlbWVudGFyeVwiO1xuXG4vKipcbiAqIFdJS0lQRURJQTpcbiAqIFxuICogVGhlIGV2b2x1dGlvbiBvZiBhbiBlbGVtZW50YXJ5IGNlbGx1bGFyIGF1dG9tYXRvbiBjYW4gY29tcGxldGVseSBiZSBkZXNjcmliZWQgYnkgYSB0YWJsZSBzcGVjaWZ5aW5nIHRoZSBzdGF0ZSBhIGdpdmVuIGNlbGwgd2lsbCBoYXZlIGluIHRoZSBuZXh0IGdlbmVyYXRpb24gYmFzZWQgb24gdGhlIHZhbHVlIG9mIHRoZSBjZWxsIHRvIGl0cyBsZWZ0LFxuICogdGhlIHZhbHVlIGZyb20gdGhlIGNlbGwgaXRzZWxmLCBhbmQgdGhlIHZhbHVlIG9mIHRoZSBjZWxsIHRvIGl0cyByaWdodC4gXG4gKiBcbiAqIFNpbmNlIHRoZXJlIGFyZSAyw5cyw5cyPTJeMz04IHBvc3NpYmxlIGJpbmFyeSBzdGF0ZXMgZm9yIHRoZSB0aHJlZSBjZWxscyBuZWlnaGJvcmluZyBhIGdpdmVuIGNlbGwsIHRoZXJlIGFyZSBhIHRvdGFsIG9mIDJeOD0yNTYgZWxlbWVudGFyeSBjZWxsdWxhciBhdXRvbWF0YSwgZWFjaCBvZiB3aGljaCBjYW4gYmUgaW5kZXhlZCB3aXRoIGFuIDgtYml0IGJpbmFyeSBudW1iZXIgKFdvbGZyYW0gMTk4MywgMjAwMilcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgMjU2IGVsZW1lbnRhcnkgY2VsbHVsYXIgYXV0b21hdGEgY2FuIGJlIGRlc2NyaWJlZCBieSBhIDggYml0IG51bWJlci4gXG4gKiBcbiAqIFRoZSBydWxlIGRlZmluaW5nIHRoZSBjZWxsdWxhciBhdXRvbWF0b24gbXVzdCBzcGVjaWZ5IHRoZSByZXN1bHRpbmcgc3RhdGUgZm9yIGVhY2ggb2YgdGhlc2UgcG9zc2liaWxpdGllcyBzbyB0aGVyZSBhcmUgMjU2ID0gMl4yXjMgcG9zc2libGUgZWxlbWVudGFyeSBjZWxsdWxhciBhdXRvbWF0YS4gXG4gKiBTdGVwaGVuIFdvbGZyYW0gcHJvcG9zZWQgYSBzY2hlbWUsIGtub3duIGFzIHRoZSBXb2xmcmFtIGNvZGUsIHRvIGFzc2lnbiBlYWNoIHJ1bGUgYSBudW1iZXIgZnJvbSAwIHRvIDI1NSB3aGljaCBoYXMgYmVjb21lIHN0YW5kYXJkLiBFYWNoIHBvc3NpYmxlIGN1cnJlbnQgY29uZmlndXJhdGlvbiBpcyB3cml0dGVuIGluIG9yZGVyLCAxMTEsIDExMCwgLi4uLCAwMDEsIDAwMCwgXG4gKiBhbmQgdGhlIHJlc3VsdGluZyBzdGF0ZSBmb3IgZWFjaCBvZiB0aGVzZSBjb25maWd1cmF0aW9ucyBpcyB3cml0dGVuIGluIHRoZSBzYW1lIG9yZGVyIGFuZCBpbnRlcnByZXRlZCBhcyB0aGUgYmluYXJ5IHJlcHJlc2VudGF0aW9uIG9mIGFuIGludGVnZXIuIFxuICogXG4gKiBUaGlzIG51bWJlciBpcyB0YWtlbiB0byBiZSB0aGUgcnVsZSBudW1iZXIgb2YgdGhlIGF1dG9tYXRvbi4gRm9yIGV4YW1wbGUsIDExMGQ9MDExMDExMTAyLiBTbyBydWxlIDExMCBpcyBkZWZpbmVkIGJ5IHRoZSB0cmFuc2l0aW9uIHJ1bGU6XG4gKiBcbiAqIDExMVx0MTEwXHQxMDFcdDEwMFx0MDExXHQwMTBcdDAwMVx0MDAwXHRjdXJyZW50IHBhdHRlcm5cdFA9KEwsQyxSKVxuICogIDBcdDFcdDFcdDBcdDFcdDFcdDFcdDBcdG5ldyBzdGF0ZSBmb3IgY2VudGVyIGNlbGxcdE4xMTBkPShDK1IrQypSK0wqQypSKSUyXG4gKi9cblxuZXhwb3J0IGNsYXNzIEVsZW1lbnRhcnlDb25maWcge1xuICAgIHJlYWRvbmx5IG5laWdoYm91clJ1bGVzOiBBcnJheTxudW1iZXI+OyAvLyBUaGlzIGlzIHRoZSA4IHBvc3NpYmxlIHN0YXRlcyBhIGNlbGwgY2FuIHRha2UgZnJvbSBpdHMgdGhyZWUgbmVpZ2hib3Vycywga2VlcCB0aGVtIGluIGEgaW1tdXRhYmxlIGxhZGRlciB0byBiZSB1c2VkIGZvciBydWxlIGluZGV4aW5nIGxhdGVyXG5cbiAgICBjb250YWluZXI6IHN0cmluZzsgICAgICAvLyBNYXJrZXIgZWxlbWVudCB3aGVyZSBFbGVtZW50YXJ5IHdpbGwgZ2VuZXJhdGUgaXQncyB2aWV3IChwcm9tcHQgYW5kIGNhbnZhcylcbiAgICBnZW5lcmF0aW9uczogbnVtYmVyOyAgICAvLyBBbW91bnQgb2YgZ2VuZXJhdGlvbnMgdG8gc2ltdWxhdGVcbiAgICB3aWR0aDogbnVtYmVyOyAgICAgICAgICAvLyBHcmlkIHdpZHRoIFxuXG4gICAgcmF0aW86IGJvb2xlYW47ICAgICAgICAgLy8gSWYgdHJ1ZSAtIENhbGN1bGF0ZSBjZWxsc2l6ZSB0byBmaWxsIHdpbmRvdyB3aWR0aFxuICAgIGNlbGxzaXplOiBudW1iZXI7ICAgICAgIC8vIFRoaXMgaXMgdGhlIHNpemUgb2YgYSBzaW5nbGUgY2VsbFxuICAgIGNlbGxjb2xvck9mZjogc3RyaW5nOyAgIC8vIGNvbG9yIGZvciBzdGF0ZSBvZmYgLSB0aGlzIHNob3VsZCBiZSBhIGNvbG9yIHZhbGlkIGluIENTUyAoZXggJ3JnYigxMzIsIDIwOCwgMjEyKScpXG4gICAgY2VsbGNvbG9yT246IHN0cmluZzsgICAgLy8gY29sb3IgZm9yIHN0YXRlIG9uIC0gdGhpcyBzaG91bGQgYmUgYSBjb2xvciB2YWxpZCBpbiBDU1MgKGV4ICdyZ2IoODcsIDkxLCAxMDcpJylcbn07XG5cbmV4cG9ydCBjb25zdCBlbGVtZW50YXJ5Q29uZmlnOiBFbGVtZW50YXJ5Q29uZmlnID0ge1xuICAgIG5laWdoYm91clJ1bGVzOiBbNywgNiwgNSwgNCwgMywgMiwgMSwgMF0sXG5cbiAgICBnZW5lcmF0aW9uczogMTAwMCxcbiAgICBjZWxsc2l6ZTogMSxcbiAgICB3aWR0aDogMTAwMCxcblxuICAgIHJhdGlvOiBmYWxzZSxcbiAgICBjb250YWluZXI6ICcjZWxlbWVudGFyeS1jb250YWluZXInLFxuICAgIGNlbGxjb2xvck9mZjogJyM4NGQwZDQnLFxuICAgIGNlbGxjb2xvck9uOiAnIzU3NWI2YicsXG59O1xuXG5kZWNsYXJlIHR5cGUgQVNDSUlTcGxhc2hJdGVtID0geyBlbmRpbmc6IHN0cmluZzsgY29sb3I6IHN0cmluZzsgYXJ0OiBzdHJpbmc7IH07XG5kZWNsYXJlIHR5cGUgQVNDSUlEYXRhID0gUGFydGlhbDx7IGVudHJ5QXNjaWk6IEFTQ0lJU3BsYXNoSXRlbSB9PlxuXG5jbGFzcyBTaW1wbGVBU0NJSVNwbGFzaGVyIHtcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGFzY2lpOiBBU0NJSVNwbGFzaEl0ZW0pIHsgcmV0dXJuIHRoaXM7IH1cbiAgICBzcGxhc2goKSB7IGNvbnNvbGUuaW5mbyh0aGlzLmFzY2lpLmFydCwgdGhpcy5hc2NpaS5jb2xvciwgdGhpcy5hc2NpaS5lbmRpbmcpOyB9XG59XG5cbi8vIFRPRE86IFJhbmRvbSBzZWVkcywgVUkgYW5kIHBpeGVsIHBlcmZlY3QgcmVuZGVyaW5nIHdpdGggc2Nyb2xsXG5cbmV4cG9ydCBjbGFzcyBFbGVtZW50YXJ5QXBwIHtcbiAgICBwcml2YXRlIGVsZW1lbnRhcnlEb206IEVsZW1lbnRhcnlEb20gPSBuZXcgRWxlbWVudGFyeURvbSgpO1xuICAgIHByaXZhdGUgZGlzcGxheTogRWxlbWVudGFyeURpc3BsYXkgPSBuZXcgRWxlbWVudGFyeURpc3BsYXkoKTtcbiAgICBwcml2YXRlIGNvbmZpZzogRWxlbWVudGFyeUNvbmZpZyA9IGVsZW1lbnRhcnlDb25maWc7XG5cbiAgICAvKiogXG4gICAgICogVGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIHN1cHBseSBhIHVzZXIgY29uZmlnLiBcbiAgICAgKiBJZiBubyBjb25maWcgaXMgc3BlY2lmaWVkIHRoZSBkZWZhdWx0IHdpbGwgYmUgdXNlZCBcbiAgICAgKiAqL1xuICAgIHdpdGhDb25maWcoY29uZmlnOiBFbGVtZW50YXJ5Q29uZmlnKSB7XG4gICAgICAgIGlmICghY29uZmlnICYmICFlbGVtZW50YXJ5Q29uZmlnKSB7XG4gICAgICAgICAgICB0aHJvdyBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9IC0gQSBkZWZhdWx0IG9yIHVzZXIgY29uZmlnIG11c3QgYmUgcHJlc2VudGA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb25maWcgPSBjb25maWcgfHwgZWxlbWVudGFyeUNvbmZpZztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8qKiBcbiAgICAgKiBEaXNwbGF5IGEgJ01PVEQnIHN0eWxlIG1lc3NhZ2UgaW4gdGhlIGJyb3dzZXIgY29uc29sZS4gXG4gICAgICogVGhlIGFydCBpcyBkZWZpbmVkIGluIGRhdGEvbWFpbi5qc29uLiBcbiAgICAgKiAqL1xuICAgIHdpdGhTcGxhc2goYXNjaWk6IEFTQ0lJU3BsYXNoSXRlbSkge1xuICAgICAgICBpZiAoIWFzY2lpIHx8ICFhc2NpaS5hcnQpIHtcbiAgICAgICAgICAgIHRocm93IGAke3RoaXMuY29uc3RydWN0b3IubmFtZX0gLSBDb3VsZCBub3QgZmluZCBzcGxhc2ggIGRhdGFgO1xuICAgICAgICB9XG4gICAgICAgIG5ldyBTaW1wbGVBU0NJSVNwbGFzaGVyKGFzY2lpKS5zcGxhc2goKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcnVuKCkge1xuICAgICAgICBjb25zdCBkZWZhdWx0Q29uZmlnID0gdGhpcy5jb25maWcgfHwgZWxlbWVudGFyeUNvbmZpZztcbiAgICAgICAgY29uc3QgZWxlbWVudGFyeSA9IG5ldyBFbGVtZW50YXJ5KCkuYm9vdHN0cmFwQXBwbGljYXRpb24oZGVmYXVsdENvbmZpZyk7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50YXJ5RG9tLnJlbmRlclNlbGVjdGlvblByb21wdHMoKHJ1bGUpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheS5pbml0KGRlZmF1bHRDb25maWcpO1xuICAgICAgICAgICAgZWxlbWVudGFyeS5jaGFuZ2VSdWxlc2V0KHJ1bGUpLmFuaW1hdGUoKGdlbmVyYXRpb25zLCB5ZWFyKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5LnJlbmRlcihnZW5lcmF0aW9ucywgeWVhcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG4vLyBBUEkgLSBob3cgdG8gcnVuIGV4YW1wbGVcbm5ldyBFbGVtZW50YXJ5QXBwKCkud2l0aFNwbGFzaCgoPEFTQ0lJRGF0YT5hc2NpaUNmZykuZW50cnlBc2NpaSlcbiAgICAud2l0aENvbmZpZyhlbGVtZW50YXJ5Q29uZmlnKS5ydW4oKTsiLCIvKipcclxuICogIEVsZW1lbnRhcnlCdWZmZXIgaXMgdGhlIGludGVybmFsIGRhdGEgc3RydWN0dXJlIHRoYXQgaG9sZHMgdGhlIGJpdC1ncmlkIG1ha2luZyB1cCB0aGUgYXV0b21hdGEuXHJcbiAqICAnMScgbWVhbnMgcmVuZGVyIGFuZCB0cmVhdCBhcyBhIG5laWdoYm91ciwgJzAnIG1lYW5zIHRvIGlnbm9yZVxyXG4gKi9cclxuXHJcbmV4cG9ydCBkZWNsYXJlIHR5cGUgRWxlbWVudGFyeUJpbmFyeU51bWJlciA9IDAgfCAxO1xyXG5cclxuZXhwb3J0IGNsYXNzIEVsZW1lbnRhcnlCdWZmZXIge1xyXG4gICAgcHVibGljIHJlYWRvbmx5IGludGVybmFsQnVmZmVyOiBVaW50OEFycmF5ID0gdW5kZWZpbmVkO1xyXG4gICAgcHJpdmF0ZSBoaWdoZXN0R2VuZXJhdGlvbkluZGV4OiBudW1iZXIgPSAwO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgd2lkdGg6IG51bWJlciwgcHJpdmF0ZSByZWFkb25seSBnZW5lcmF0aW9uczogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5pbnRlcm5hbEJ1ZmZlciA9IHRoaXMuaW50ZXJuYWxDcmVhdGVCdWZmZXIodGhpcy5nZW5lcmF0aW9ucywgdGhpcy53aWR0aCk7XHJcbiAgICAgICAgaWYgKCF0aGlzLmludGVybmFsQnVmZmVyIHx8IHRoaXMuaW50ZXJuYWxCdWZmZXIuYnVmZmVyLmJ5dGVMZW5ndGggPCB0aGlzLnNpemUpIHtcclxuICAgICAgICAgICAgdGhyb3cgYCR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfSAtIEZhaWxlZCB0byBjcmVhdGUgYnVmZmVyIHdpdGggc2l6ZSAke3RoaXMuc2l6ZX1gO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5pbnRlcm5hbEJ1ZmZlci5maWxsKDAsIDAsIHRoaXMuc2l6ZSk7IC8vIFNlZWQgZmlyc3QgZ2VuZXJhdGlvblxyXG4gICAgICAgIHRoaXMuaW50ZXJuYWxCdWZmZXIuZmlsbCgxLCB0aGlzLndpZHRoIC8gMiwgdGhpcy53aWR0aCAvIDIgKyAxKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgYWdlKCkgeyByZXR1cm4gdGhpcy5oaWdoZXN0R2VuZXJhdGlvbkluZGV4OyB9IC8vIEFtb3VudCBvZiB5ZWFycyBwcm9jZXNzZWQgc28gZmFyIFxyXG4gICAgZ2V0IHNpemUoKSB7IHJldHVybiB0aGlzLmdlbmVyYXRpb25zICogdGhpcy53aWR0aDsgfVxyXG4gICAgZ2V0IGJ1ZmZlcigpIHsgcmV0dXJuIHRoaXMuaW50ZXJuYWxCdWZmZXI7IH1cclxuXHJcbiAgICBwdWJsaWMgY3VycmVudEdlbmVyYXRpb24oKTogVWludDhBcnJheSB7IHJldHVybiB0aGlzLmdlbmVyYXRpb24odGhpcy5oaWdoZXN0R2VuZXJhdGlvbkluZGV4KTsgfVxyXG4gICAgcHVibGljIGdlbmVyYXRpb24oeWVhcjogbnVtYmVyKTogVWludDhBcnJheSB7IHJldHVybiB0aGlzLmludGVybmFsQnVmZmVyLnN1YmFycmF5KHRoaXMud2lkdGggKiB5ZWFyLCB0aGlzLndpZHRoICogeWVhciArIHRoaXMud2lkdGgpOyB9XHJcbiAgICBwdWJsaWMgdG9nZ2xlKHllYXI6IG51bWJlciwgY29sOiBudW1iZXIpIHsgdGhpcy5pbnRlcm5hbEVsZW1lbnRTZXQoeWVhciwgY29sLCB0aGlzLmludGVybmFsRWxlbWVudEF0KHllYXIsIGNvbCkgPyAwIDogMSk7IH1cclxuICAgIHB1YmxpYyBzZXQoeWVhcjogbnVtYmVyLCBjb2w6IG51bWJlciwgdmFsdWU6IG51bWJlcikgeyB0aGlzLmludGVybmFsRWxlbWVudFNldCh5ZWFyLCBjb2wsIHZhbHVlKTsgfVxyXG4gICAgcHVibGljIHJlYWQoeWVhcjogbnVtYmVyLCBjb2w6IG51bWJlcikgeyByZXR1cm4gdGhpcy5pbnRlcm5hbEVsZW1lbnRBdCh5ZWFyLCBjb2wpOyB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbnRlcm5hbEVsZW1lbnRTZXQocm93OiBudW1iZXIsIGNvbDogbnVtYmVyLCBmbGFnOiBudW1iZXIpIHtcclxuICAgICAgICBjb25zdCBiaW5hcnlOdW1iZXIgPSBmbGFnIGFzIEVsZW1lbnRhcnlCaW5hcnlOdW1iZXI7XHJcbiAgICAgICAgY29uc3QgZmxhdEluZGV4ID0gcm93ICogdGhpcy5nZW5lcmF0aW9ucyArIGNvbDtcclxuXHJcbiAgICAgICAgaWYgKGZsYXRJbmRleCA8IDAgfHwgZmxhdEluZGV4ID4gdGhpcy5zaXplKSB7IHRocm93IGAke3RoaXMuY29uc3RydWN0b3IubmFtZX0gLSBBcmd1bWVudCBvdXQgb2YgYm91bmRzICR7cm93fSwgJHtjb2x9YDsgfVxyXG4gICAgICAgIGlmIChiaW5hcnlOdW1iZXIgIT0gMSAmJiBiaW5hcnlOdW1iZXIgIT0gMCkgeyB0aHJvdyBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9IC0gRmxhZyBpcyBub3QgaW4gYSBjb3JyZWN0IGZvcm0uIFNob3VsZCBiZSBhIGJpdCAoMCBvciAxKSBgOyB9XHJcblxyXG4gICAgICAgIHRoaXMuYnVmZmVyW2ZsYXRJbmRleF0gPSBmbGFnOyAvLyBDaGVjayBpZiB3ZSBoYXZlIHJlYWNoZWQgYSBoaWdoZXIgZ2VuZXJhdGlvblxyXG4gICAgICAgIGlmIChyb3cgPiB0aGlzLmhpZ2hlc3RHZW5lcmF0aW9uSW5kZXgpIHsgLy8gVE9ETyBtb3ZlIHRoaXMgdG8gZWxlbWVudGFyeS50cyBmb3IgcGVyZm9ybWFuY2VcclxuICAgICAgICAgICAgdGhpcy5oaWdoZXN0R2VuZXJhdGlvbkluZGV4ID0gcm93O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGludGVybmFsRWxlbWVudEF0KHJvdzogbnVtYmVyLCBjb2w6IG51bWJlcikge1xyXG4gICAgICAgIGNvbnN0IGZsYXRJbmRleCA9IHJvdyAqIHRoaXMuZ2VuZXJhdGlvbnMgKyBjb2w7XHJcbiAgICAgICAgaWYgKGZsYXRJbmRleCA8IDAgfHwgZmxhdEluZGV4ID4gdGhpcy5zaXplKSB7XHJcbiAgICAgICAgICAgIHRocm93IGAke3RoaXMuY29uc3RydWN0b3IubmFtZX0gLSBBcmd1bWVudCBvdXQgb2YgYm91bmRzICR7cm93fSwgJHtjb2x9YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYnVmZmVyW2ZsYXRJbmRleF07XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbnRlcm5hbENyZWF0ZUJ1ZmZlcihyb3dzOiBudW1iZXIsIGNvbHM6IG51bWJlcikge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmICghcm93cyB8fCAhY29scyB8fCByb3dzIDw9IDAgfHwgY29scyA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBFcnJvcihgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9IC0gSW52YWxpZCByb3cgYW5kIGNvbCBkYXRhYCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKHJvd3MgKiBjb2xzKTtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGJ1ZmZlciwgMCwgcm93cyAqIGNvbHMpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgdGhyb3cgYCR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfSAtICR7ZX1gO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImltcG9ydCB7IEVsZW1lbnRhcnlDb25maWcgfSBmcm9tIFwiLi9hcHBcIjtcblxuZXhwb3J0IGNsYXNzIEVsZW1lbnRhcnlEaXNwbGF5IHtcbiAgICBwdWJsaWMgY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuICAgIHB1YmxpYyBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50O1xuXG4gICAgcHJpdmF0ZSBlbGVtZW50YXJ5Y29uZmlnOiBFbGVtZW50YXJ5Q29uZmlnO1xuXG4gICAgcHVibGljIGluaXQoY29uZmlnOiBFbGVtZW50YXJ5Q29uZmlnLCBjb250YWluZXI/OiBzdHJpbmcsIGlkPzogc3RyaW5nKSB7XG4gICAgICAgIGlmICghY29udGFpbmVyKSB7IGNvbnRhaW5lciA9ICdnYW1lLXZpZXcnOyB9XG4gICAgICAgIGlmICghaWQpIHsgaWQgPSAnZ2FtZS1jYW52YXMnOyB9XG5cbiAgICAgICAgY29uc3QgW2NhbnZhcywgY29udGV4dF0gPSB0aGlzLmNyZWF0ZUhEUElDYW52YXNFbGVtZW50KGNvbmZpZywgY29udGFpbmVyLCBpZCk7XG4gICAgICAgIHRoaXMuY2VudGVyVmlld0lmTmVlZGVkKGNvbmZpZywgY29udGV4dCk7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50YXJ5Y29uZmlnID0gY29uZmlnO1xuICAgICAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICAgICAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVuZGVyKGdlbmVyYXRpb25zOiBVaW50OEFycmF5LCB5ZWFyOiBudW1iZXIpIHtcbiAgICAgICAgaWYgKCF0aGlzLmVsZW1lbnRhcnljb25maWcpIHsgdGhyb3cgJ0VsZW1udGFyeUNvbmZpZyBoYXMgdG8gYmUgc2V0IGlmIHRoZSBncmlkIHNob3VsZCBiZSBjYW52YXMgcmVuZGVyZWQnOyB9XG4gICAgICAgIGlmICghZ2VuZXJhdGlvbnMpIHsgdGhyb3cgJ0lsbGVnYWwgc3RhdGUgLSBEaXNwbGF5IGdyaWQgaXMgdW5kZWZpbmVkJzsgfVxuXG4gICAgICAgIGNvbnN0IGNvbmZpZ3NpemUgPSB0aGlzLmVsZW1lbnRhcnljb25maWcuY2VsbHNpemU7XG4gICAgICAgIGNvbnN0IGdyaWRoZWlnaHQgPSB0aGlzLmVsZW1lbnRhcnljb25maWcuZ2VuZXJhdGlvbnM7XG4gICAgICAgIGNvbnN0IGdyaWR3aWR0aCA9IHRoaXMuZWxlbWVudGFyeWNvbmZpZy53aWR0aDtcbiAgICAgICAgY29uc3QgcmF0aW8gPSB0aGlzLmVsZW1lbnRhcnljb25maWcucmF0aW87XG5cbiAgICAgICAgbGV0IGNlbGx3ID0gcmF0aW8gPyB0aGlzLmNhbnZhcy53aWR0aCAqIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIC8gZ3JpZHdpZHRoIDogY29uZmlnc2l6ZTtcbiAgICAgICAgbGV0IGNlbGxoID0gcmF0aW8gPyB0aGlzLmNhbnZhcy5oZWlnaHQgKiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyAvIGdyaWRoZWlnaHQgOiBjb25maWdzaXplO1xuXG4gICAgICAgIGdlbmVyYXRpb25zLmZvckVhY2goKGNlbGwsIGdyaWRjZWxsKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQuZmlsbFN0eWxlID0gY2VsbCA/IHRoaXMuZWxlbWVudGFyeWNvbmZpZy5jZWxsY29sb3JPbiA6IHRoaXMuZWxlbWVudGFyeWNvbmZpZy5jZWxsY29sb3JPZmY7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQuZmlsbFJlY3QoZ3JpZGNlbGwgKiBjZWxsdywgeWVhciAqIGNlbGxoLCBjZWxsdywgY2VsbGgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZUhEUElDYW52YXNFbGVtZW50KGNvbmZpZzogRWxlbWVudGFyeUNvbmZpZywgY29udGFpbmVyOiBzdHJpbmcsIGlkOiBzdHJpbmcgPSB1bmRlZmluZWQpOiBbSFRNTENhbnZhc0VsZW1lbnQsIENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRF0ge1xuICAgICAgICBjb25zdCBjYW52YXNjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb250YWluZXIpO1xuICAgICAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKSBhcyBIVE1MQ2FudmFzRWxlbWVudDtcbiAgICAgICAgY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAgICAgY29uc3QgZGV2aWNlcGl4ZWxyYXRpbyA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDE7XG4gICAgICAgIGxldCB7IHdpZHRoLCBoZWlnaHQgfSA9IGNhbnZhc2NvbnRhaW5lci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgICBpZiAoIXdpZHRoIHx8ICFoZWlnaHQpIHtcbiAgICAgICAgICAgIHdpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgICAgICAgICBoZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICAgIH1cblxuICAgICAgICBjYW52YXMud2lkdGggPSB3aWR0aCAqIGRldmljZXBpeGVscmF0aW87XG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQgKiBkZXZpY2VwaXhlbHJhdGlvO1xuICAgICAgICBjYW52YXMuc3R5bGUud2lkdGggPSBgJHt3aWR0aCAqIGRldmljZXBpeGVscmF0aW99cHhgO1xuICAgICAgICBjYW52YXMuc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0ICogZGV2aWNlcGl4ZWxyYXRpb31weGA7XG5cbiAgICAgICAgY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICBjYW52YXMuc3R5bGUuaW1hZ2VSZW5kZXJpbmcgPSAncGl4ZWxhdGVkJztcbiAgICAgICAgY2FudmFzLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGNvbmZpZy5jZWxsY29sb3JPZmY7XG5cbiAgICAgICAgaWYgKGlkKSB7IGNhbnZhcy5pZCA9IGlkOyB9XG4gICAgICAgIGNhbnZhc2NvbnRhaW5lci5hcHBlbmRDaGlsZChjYW52YXMpO1xuICAgICAgICByZXR1cm4gW2NhbnZhcywgY3R4XTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNlbnRlclZpZXdJZk5lZWRlZChjb25maWc6IEVsZW1lbnRhcnlDb25maWcsIGNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCkge1xuICAgICAgICBjb25zdCBwYW5YID0gY29uZmlnLndpZHRoIDwgY29udGV4dC5jYW52YXMud2lkdGg7XG4gICAgICAgIGNvbnN0IHBhblkgPSBjb25maWcuZ2VuZXJhdGlvbnMgPCBjb250ZXh0LmNhbnZhcy5oZWlnaHQ7XG5kZWJ1Z2dlcjtcbiAgICAgICAgY29uc3QgdHJhbnNsYXRlWCA9IHBhblggPyBjb250ZXh0LmNhbnZhcy53aWR0aCAvIDIgLSBjb25maWcud2lkdGggLyAyIDogMDtcbiAgICAgICAgY29uc3QgdHJhbnNsYXRlWSA9IHBhblkgPyBjb250ZXh0LmNhbnZhcy5oZWlnaHQgLyAyIC0gY29uZmlnLmdlbmVyYXRpb25zIC8gMiA6IDA7XG4gICAgICAgIGlmICh0cmFuc2xhdGVYID4gMCkgeyBjb250ZXh0LnRyYW5zbGF0ZSh0cmFuc2xhdGVYLCAwKTsgfVxuICAgICAgICBpZiAodHJhbnNsYXRlWSA+IDApIHsgY29udGV4dC50cmFuc2xhdGUoMCwgdHJhbnNsYXRlWSk7IH1cbiAgICB9XG59IiwiZGVjbGFyZSB0eXBlIEVsZW1lbnRhcnlFbGVtZW50ID0ge1xuICAgIGNvbnRleHQ6IERvY3VtZW50RnJhZ21lbnQgfCBIVE1MRWxlbWVudCxcbiAgICBlbGVtZW50OiBIVE1MRWxlbWVudCxcblxuICAgIGJ5SWQ6IChzZWxlY3Rvcjogc3RyaW5nKSA9PiBFbGVtZW50YXJ5RWxlbWVudCxcbiAgICBieUNsYXNzOiAoc2VsZWN0b3I6IHN0cmluZykgPT4gRWxlbWVudGFyeUVsZW1lbnQsXG4gICAgd2l0aDogKGNvbnRleHQ6IERvY3VtZW50RnJhZ21lbnQgfCBIVE1MRWxlbWVudCkgPT4gRWxlbWVudGFyeUVsZW1lbnQsXG5cbiAgICBjc3M6ICguLi50b2tlbnM6IHN0cmluZ1tdKSA9PiBFbGVtZW50YXJ5RWxlbWVudCxcbiAgICBhdHRyOiAoYXR0cnM6IGFueSkgPT4gRWxlbWVudGFyeUVsZW1lbnQsXG4gICAgdGV4dDogKHRleHQ6IHN0cmluZykgPT4gRWxlbWVudGFyeUVsZW1lbnQsXG4gICAgbWFrZTogKHRhZzogc3RyaW5nKSA9PiBFbGVtZW50YXJ5RWxlbWVudCxcbiAgICBfc2VsZjogKGNvbnRleHQ6ICgpID0+IGFueSkgPT4gRWxlbWVudGFyeUVsZW1lbnQsXG59XG5cbmV4cG9ydCBjbGFzcyBFbGVtZW50YXJ5RG9tIHtcbiAgICByZW5kZXJTZWxlY3Rpb25Qcm9tcHRzKHNlbGVjdGlvbjogKHY6IG51bWJlcikgPT4gdm9pZCkge1xuICAgICAgICBjb25zdCBzZWxlY3Rpb25Db250YWluZXIgPSBlbGVtZW50YXJ5RWxlbWVudEZhY3Rvcnkud2l0aChkb2N1bWVudCkuYnlJZCgnc2VsZWN0aW9uLXZpZXcnKS5lbGVtZW50O1xuICAgICAgICBjb25zdCBnYW1lQ29udGFpbmVyID0gZWxlbWVudGFyeUVsZW1lbnRGYWN0b3J5LndpdGgoZG9jdW1lbnQpLmJ5SWQoJ2dhbWUtdmlldycpLmVsZW1lbnQ7XG4gICAgICAgIGlmICghc2VsZWN0aW9uQ29udGFpbmVyKSB7IHRocm93ICdGYWlsZWQgdG8gbG9hZCBzZWxlY3Rpb24gc2VsZWN0aW9uQ29udGFpbmVyIC0gdGhpcyBpcyBhIGZhdGFsIGVycm9yJzsgfVxuXG4gICAgICAgIGNvbnN0IGZyYWdtZW50Um9vdCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICAgICAgY29uc3QgW2NvbnRhaW5lciwgaW5wdXQsIHN1Ym1pdCwgbm90aWZpZXJdID0gdGhpcy5idWlsZEVsZW1lbnRzKGZyYWdtZW50Um9vdCk7XG5cbiAgICAgICAgaWYgKHNlbGVjdGlvbikge1xuICAgICAgICAgICAgc3VibWl0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJ1bGUgPSBwYXJzZUludCgoaW5wdXQgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWUpO1xuICAgICAgICAgICAgICAgIGlmIChydWxlID49IDAgJiYgcnVsZSA8IE1hdGgucG93KDIsIDgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGdhbWVDb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnZGlzcGxheS1ub25lJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdkaXNwbGF5LW5vbmUnKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGVjdGlvbihydWxlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBFbHNlIHdlIGhhdmUgYSBlcnJvciwgc28gZGlzcGxheSBub3RpZmllclxuICAgICAgICAgICAgICAgIG5vdGlmaWVyLmNsYXNzTGlzdC50b2dnbGUoJ2Rpc3BsYXktbm9uZScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgc2VsZWN0aW9uQ29udGFpbmVyLmFwcGVuZChmcmFnbWVudFJvb3QpO1xuICAgIH1cblxuICAgIGJ1aWxkRWxlbWVudHMoY29udGV4dDogRG9jdW1lbnRGcmFnbWVudCkgOiBIVE1MRWxlbWVudFtdIHtcbiAgICAgICAgY29uc3QgcnVsZUlucHV0Q29udGFpbmVyID0gZWxlbWVudGFyeUVsZW1lbnRGYWN0b3J5LndpdGgoY29udGV4dCkubWFrZSgnZGl2JykuY3NzKCdydWxlLWNhcmQnLCAncHQtbm9ybWFsJykuZWxlbWVudDtcbiAgICAgICAgY29uc3QgaW5wdXRQcm9tcHQgPSBlbGVtZW50YXJ5RWxlbWVudEZhY3Rvcnkud2l0aChydWxlSW5wdXRDb250YWluZXIpLm1ha2UoJ2lucHV0JykuYXR0cih7ICd0eXBlJzogJ3RleHQnIH0pLmNzcygncnVsZS1pbnB1dCcpLmVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IHN1Ym1pdEJ1dHRvbiA9IGVsZW1lbnRhcnlFbGVtZW50RmFjdG9yeS53aXRoKHJ1bGVJbnB1dENvbnRhaW5lcikubWFrZSgnYnV0dG9uJykuYXR0cih7ICd0eXBlJzogJ2J1dHRvbicgfSkuY3NzKCdydWxlLWJ0bicpLnRleHQoJ0dvIScpLmVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IG5vdGlmaWVyID0gZWxlbWVudGFyeUVsZW1lbnRGYWN0b3J5LndpdGgocnVsZUlucHV0Q29udGFpbmVyKS5tYWtlKCdzbWFsbCcpLmNzcygncnVsZS1ub3RpZmljYXRpb24nLCAnZC1ibG9jaycsICdkaXNwbGF5LW5vbmUnKS50ZXh0KCdQbGVhc2UgaW5wdXQgYSB2YWx1ZSBiZXR3ZWVuIDAgYW5kIDI1NScpLmVsZW1lbnQ7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgcnVsZUlucHV0Q29udGFpbmVyLCBpbnB1dFByb21wdCwgc3VibWl0QnV0dG9uLCBub3RpZmllclxuICAgICAgICBdO1xuICAgIH1cbn1cblxuY29uc3QgZWxlbWVudGFyeUVsZW1lbnRGYWN0b3J5OiBFbGVtZW50YXJ5RWxlbWVudCA9IHtcbiAgICBjb250ZXh0OiB1bmRlZmluZWQsXG4gICAgZWxlbWVudDogdW5kZWZpbmVkLFxuXG4gICAgYnlDbGFzczogZnVuY3Rpb24gKHNlbGVjdG9yOiBzdHJpbmcpOiBFbGVtZW50YXJ5RWxlbWVudCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZWxmKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudCA9IHRoaXMuY29udGV4dC5xdWVyeVNlbGVjdG9yKGAuJHtzZWxlY3Rvcn1gKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBieUlkOiBmdW5jdGlvbiAoc2VsZWN0b3I6IHN0cmluZyk6IEVsZW1lbnRhcnlFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbGYoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50ID0gdGhpcy5jb250ZXh0LnF1ZXJ5U2VsZWN0b3IoYCMke3NlbGVjdG9yfWApO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIG1ha2U6IGZ1bmN0aW9uICh0YWc6IHN0cmluZyk6IEVsZW1lbnRhcnlFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbGYoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50ID0gdGhpcy5jb250ZXh0LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnKSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgdGV4dDogZnVuY3Rpb24gKHRleHQ6IHN0cmluZyk6IEVsZW1lbnRhcnlFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbGYoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmlubmVyVGV4dCA9IHRleHQ7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgY3NzOiBmdW5jdGlvbiAoLi4udG9rZW5zOiBzdHJpbmdbXSk6IEVsZW1lbnRhcnlFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbGYoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoLi4udG9rZW5zKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBhdHRyOiBmdW5jdGlvbiAoYXR0cnM6IGFueSk6IEVsZW1lbnRhcnlFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbGYoKCkgPT4ge1xuICAgICAgICAgICAgZm9yICh2YXIgdG9rZW4gaW4gYXR0cnMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKHRva2VuLCBhdHRyc1t0b2tlbl0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIHdpdGg6IGZ1bmN0aW9uIChjb250ZXh0OiBEb2N1bWVudEZyYWdtZW50IHwgSFRNTEVsZW1lbnQpOiBFbGVtZW50YXJ5RWxlbWVudCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZWxmKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudCA9IGNvbnRleHQuZ2V0Um9vdE5vZGUoKSBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBfc2VsZjogZnVuY3Rpb24gKGNvbnRleHQ6ICgpID0+IEVsZW1lbnRhcnlFbGVtZW50KTogRWxlbWVudGFyeUVsZW1lbnQge1xuICAgICAgICBjb250ZXh0KCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBFbGVtZW50YXJ5QnVmZmVyIH0gZnJvbSBcIi4vYnVmZmVyXCI7XG5pbXBvcnQgeyBFbGVtZW50YXJ5Q29uZmlnIH0gZnJvbSBcIi4vYXBwXCI7XG5cbmV4cG9ydCBlbnVtIEFuaW1hdGlvblN0eWxlIHtcbiAgICBTdGVwd2lzZSA9IDAsXG4gICAgRGlyZWN0ID0gMVxufVxuXG5leHBvcnQgY2xhc3MgRWxlbWVudGFyeSB7XG4gICAgcHJpdmF0ZSBlbGVtZW50YXJ5Q29uZmlnOiBFbGVtZW50YXJ5Q29uZmlnXG4gICAgcHJpdmF0ZSBnZW5lcmF0aW9uQnVmZmVyOiBFbGVtZW50YXJ5QnVmZmVyO1xuICAgIHByaXZhdGUgYW5pbWF0aW9uU3R5bGU6IEFuaW1hdGlvblN0eWxlO1xuXG4gICAgLyoqIFxuICAgICAqICBUaGlzIGlzIHRoZSBjdXJyZW50IHJ1bGVzZXQsIGluZGljYXRpbmcgaG93IHRoZSBuZXh0IGdlbmVyYXRpb24gc2hvdWxkIGNob29zZSBpdHMgdmFsdWUgYWNjb3JkaW5nIHRvIHRoZSBjdXJyZW50IHN0YXRlXG4gICAgICogIG9mIHRoZSBjZWxsIGFuZCBpdHMgdHdvIGltbWVkaWF0ZSBuZWlnaGJvcnNcbiAgICAqL1xuICAgIHByaXZhdGUgcnVsZXNldDogQXJyYXk8bnVtYmVyPjtcblxuICAgIGJvb3RzdHJhcEFwcGxpY2F0aW9uKGNvbmZpZzogRWxlbWVudGFyeUNvbmZpZywgYW5pbWF0aW9uU3R5bGU6IEFuaW1hdGlvblN0eWxlID0gQW5pbWF0aW9uU3R5bGUuU3RlcHdpc2UpOiBFbGVtZW50YXJ5IHtcbiAgICAgICAgdGhpcy5nZW5lcmF0aW9uQnVmZmVyID0gbmV3IEVsZW1lbnRhcnlCdWZmZXIoY29uZmlnLndpZHRoLCBjb25maWcuZ2VuZXJhdGlvbnMpO1xuICAgICAgICB0aGlzLmFuaW1hdGlvblN0eWxlID0gYW5pbWF0aW9uU3R5bGU7XG4gICAgICAgIHRoaXMucnVsZXNldCA9IG5ldyBBcnJheTxudW1iZXI+KDgpO1xuICAgICAgICB0aGlzLmVsZW1lbnRhcnlDb25maWcgPSBjb25maWc7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFuaW1hdGUgdGhlIHN0ZXAgY29sY3VsYXRpb24sIHJ1biB1bnRpbGwgc3BlY2lmaWVkIGFtb3VudCBvZiBnZW5lcmF0aW9ucyBoYXMgcGFzc2VkLlxuICAgICAqL1xuICAgIGFuaW1hdGUob25TdWNjZXNzOiAoZ2VuZXJhdGlvbnM6IFVpbnQ4QXJyYXksIHllYXI6IG51bWJlcikgPT4gdm9pZCkge1xuICAgICAgICBjb25zdCB0aWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZ3JpZCA9IHRoaXMuc3RlcCh0aGlzLmN1cnJlbnRHZW5lcmF0aW9uKCkpO1xuICAgICAgICAgICAgbGV0IG5leHRHZW5lcmF0aW9uID0gdGhpcy5nZW5lcmF0aW9uQnVmZmVyLmFnZSA8IHRoaXMuZWxlbWVudGFyeUNvbmZpZy5nZW5lcmF0aW9ucyAtIDE7XG4gICAgICAgICAgICBpZiAobmV4dEdlbmVyYXRpb24pIHsgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aWNrKTsgfVxuICAgICAgICAgICAgaWYgKHRoaXMuYW5pbWF0aW9uU3R5bGUgPT09IEFuaW1hdGlvblN0eWxlLlN0ZXB3aXNlKSB7XG4gICAgICAgICAgICAgICAgb25TdWNjZXNzKGdyaWQsIHRoaXMuZ2VuZXJhdGlvbkJ1ZmZlci5hZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGljayk7XG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGlvblN0eWxlID09PSBBbmltYXRpb25TdHlsZS5EaXJlY3QpIHtcbiAgICAgICAgICAgIG9uU3VjY2Vzcyh0aGlzLmdlbmVyYXRpb25CdWZmZXIuYnVmZmVyLCB0aGlzLmVsZW1lbnRhcnlDb25maWcuZ2VuZXJhdGlvbnMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIFxuICAgICogUGVyZm9ybSBhIHN0ZXAsIGNhbGN1bGF0ZSBvbmUgZ2VuZXJhdGlvbi5cbiAgICAqIEBwYXJhbSBjdXJyZW50R2VuZXJhdGluZ0dyaWQgIFRoZSByb3cgaW4gdGhlIGdlbmVyYXRpb24gY3VycmVudGx5IGJlZWluZyBnZW5lcmF0ZWRcbiAgICAqL1xuICAgIHN0ZXAoY3VycmVudEdlbmVyYXRpbmdHcmlkOiBVaW50OEFycmF5KTogVWludDhBcnJheSB7XG4gICAgICAgIGNvbnN0IHllYXIgPSB0aGlzLmdlbmVyYXRpb25CdWZmZXIuYWdlICsgMTtcbiAgICAgICAgZm9yIChsZXQgZ3JpZGNlbGwgPSAwOyBncmlkY2VsbCA8IHRoaXMuZWxlbWVudGFyeUNvbmZpZy53aWR0aDsgZ3JpZGNlbGwrKykge1xuICAgICAgICAgICAgY29uc3QgbiA9IHRoaXMubmVpZ2hib3VycyhjdXJyZW50R2VuZXJhdGluZ0dyaWQsIGdyaWRjZWxsKTtcbiAgICAgICAgICAgIGlmICghbiAmJiBuIDwgMCkgeyB0aHJvdyBgSWxsZWdhbCBzdGF0ZTogJHtncmlkY2VsbH1gOyB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMuZ2VuZXJhdGlvbkJ1ZmZlci5zZXQoeWVhciwgZ3JpZGNlbGwsIHRoaXMucnVsZShuKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGN1cnJlbnRHZW5lcmF0aW5nR3JpZDtcbiAgICB9XG5cbiAgICAvKiogXG4gICAgKiBHZXQgdGhlIG5laWdoYm91clJ1bGVzLWluZGV4IGNhbGN1bGF0ZWQgZnJvbSB0aGUgbmVpZ2hib3VycyBvZiB0aGUgY2VsbCBjdXJyZW50bHkgYmVlaW5nIHZpc2lzdGVkLlxuICAgICogQHBhcmFtIGN1cnJlbnRHZW5lcmF0aW5nR3JpZCAgVGhlIHJvdyBpbiB0aGUgZ2VuZXJhdGlvbiBjdXJyZW50bHkgYmVlaW5nIGdlbmVyYXRlZFxuICAgICAqL1xuICAgIG5laWdoYm91cnMoY3VycmVudEdlbmVyYXRpbmdHcmlkOiBVaW50OEFycmF5LCBjZWxsOiBudW1iZXIpIHtcbiAgICAgICAgaWYgKGNlbGwgPCAwIHx8IGNlbGwgPiB0aGlzLmVsZW1lbnRhcnlDb25maWcud2lkdGgpIHsgcmV0dXJuIDA7IH1cblxuICAgICAgICBjb25zdCByID0gY3VycmVudEdlbmVyYXRpbmdHcmlkW2NlbGwgKyAxID49IHRoaXMuZWxlbWVudGFyeUNvbmZpZy53aWR0aCA/IDAgOiBjZWxsICsgMV07XG4gICAgICAgIGNvbnN0IGwgPSBjdXJyZW50R2VuZXJhdGluZ0dyaWRbY2VsbCAtIDEgPD0gMCA/IDAgOiBjZWxsIC0gMV07XG4gICAgICAgIHJldHVybiAweGYgJiAociA8PCAyIHwgY3VycmVudEdlbmVyYXRpbmdHcmlkW2NlbGxdIDw8IDEgfCBsKTtcbiAgICB9XG5cbiAgICBydWxlKGluZGV4OiBudW1iZXIpIHsgcmV0dXJuIHRoaXMucnVsZXNldFt0aGlzLmVsZW1lbnRhcnlDb25maWcubmVpZ2hib3VyUnVsZXNbaW5kZXhdXTsgfVxuICAgIGdlbmVyYXRpb24oeWVhcj86IG51bWJlcikgeyByZXR1cm4gdGhpcy5nZW5lcmF0aW9uQnVmZmVyLmdlbmVyYXRpb24oeWVhcik7IH1cbiAgICBjdXJyZW50R2VuZXJhdGlvbigpIHsgcmV0dXJuIHRoaXMuZ2VuZXJhdGlvbkJ1ZmZlci5jdXJyZW50R2VuZXJhdGlvbigpOyB9XG5cbiAgICBjaGFuZ2VSdWxlc2V0KHJkZWNpbWFsOiBudW1iZXIpIHtcbiAgICAgICAgY29uc3QgZHRvYiA9IChuOiBudW1iZXIpID0+IHsgcmV0dXJuIHJkZWNpbWFsID4+IG4gJiAweDE7IH1cbiAgICAgICAgdGhpcy5ydWxlc2V0ID0gW2R0b2IoNyksIGR0b2IoNiksIGR0b2IoNSksIGR0b2IoNCksIGR0b2IoMyksIGR0b2IoMiksIGR0b2IoMSksIGR0b2IoMCldO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc291cmNlL2FwcC50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==