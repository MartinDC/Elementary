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
    width: 1000,
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
    constructor() {
        this.isMouseDown = false;
        this.cameraSpeed = 10.4;
        this.lastMouse = { x: 0, y: 0 };
        this.mouse = { x: 0, y: 0 };
        this.camera = { x: 0, y: 0 };
    }
    init(config, container, id) {
        if (!container) {
            container = 'game-view';
        }
        if (!id) {
            id = 'game-canvas';
        }
        const [canvas, context, offscreenContext] = this.initHDPICanvasElement(config, container, id);
        this.centerAutomataInView(config, context);
        this.registerSystemEvents();
        this.offscreenContext = offscreenContext;
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
            this.offscreenContext.fillStyle = cell ? this.elementaryconfig.cellcolorOn : this.elementaryconfig.cellcolorOff;
            this.offscreenContext.fillRect(gridcell * cellw, year * cellh, cellw, cellh);
        });
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.drawImage(this.offscreenContext.canvas, this.camera.x, this.camera.y);
    }
    initHDPICanvasElement(config, container, id = undefined) {
        const canvascontainer = document.getElementById(container);
        const [_, offscreenContext] = this.createHDPICanvasElement(config, canvascontainer);
        const [canvas, context] = this.createHDPICanvasElement(config, canvascontainer);
        if (id) {
            canvas.id = id;
        }
        canvascontainer.appendChild(canvas);
        return [canvas, context, offscreenContext];
    }
    createHDPICanvasElement(config, container) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const devicepixelratio = window.devicePixelRatio || 1;
        let { width, height } = container === null || container === void 0 ? void 0 : container.getBoundingClientRect();
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
        return [canvas, ctx];
    }
    centerAutomataInView(config, context) {
        const panVertical = config.generations < context.canvas.height;
        const translateX = context.canvas.width / 2 - config.width / 2;
        const translateY = context.canvas.height / 2 - config.generations / 2;
        context.translate(translateX, panVertical ? translateY : 0);
    }
    registerSystemEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() == 'w') {
                this.camera.y += this.cameraSpeed;
            }
            if (e.key.toLowerCase() == 's') {
                this.camera.y -= this.cameraSpeed;
            }
            if (e.key.toLowerCase() == 'a') {
                this.camera.x -= this.cameraSpeed;
            }
            if (e.key.toLowerCase() == 'd') {
                this.camera.x += this.cameraSpeed;
            }
        });
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
            window.requestAnimationFrame(tick);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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SUFBSSxDQUFDO0lBQ2hCLENBQUM7Q0FDSjtBQTNFRCxnQ0EyRUM7Ozs7Ozs7Ozs7Ozs7Ozs7O1VDbkZEO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUV0QkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9lbGVtZW50YXJ5Ly4vc291cmNlL2FwcC50cyIsIndlYnBhY2s6Ly9lbGVtZW50YXJ5Ly4vc291cmNlL2J1ZmZlci50cyIsIndlYnBhY2s6Ly9lbGVtZW50YXJ5Ly4vc291cmNlL2Rpc3BsYXkudHMiLCJ3ZWJwYWNrOi8vZWxlbWVudGFyeS8uL3NvdXJjZS9kb20udHMiLCJ3ZWJwYWNrOi8vZWxlbWVudGFyeS8uL3NvdXJjZS9lbGVtZW50YXJ5LnRzIiwid2VicGFjazovL2VsZW1lbnRhcnkvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZWxlbWVudGFyeS93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL2VsZW1lbnRhcnkvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL2VsZW1lbnRhcnkvd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGFzY2lpQ2ZnIGZyb20gXCIuLi9kYXRhL21haW4uanNvblwiO1xuaW1wb3J0IHsgRWxlbWVudGFyeURpc3BsYXkgfSBmcm9tIFwiLi9kaXNwbGF5XCI7XG5pbXBvcnQgeyBFbGVtZW50YXJ5RG9tIH0gZnJvbSBcIi4vZG9tXCI7XG5pbXBvcnQgeyBFbGVtZW50YXJ5IH0gZnJvbSBcIi4vZWxlbWVudGFyeVwiO1xuXG4vKipcbiAqIFdJS0lQRURJQTpcbiAqIFxuICogVGhlIGV2b2x1dGlvbiBvZiBhbiBlbGVtZW50YXJ5IGNlbGx1bGFyIGF1dG9tYXRvbiBjYW4gY29tcGxldGVseSBiZSBkZXNjcmliZWQgYnkgYSB0YWJsZSBzcGVjaWZ5aW5nIHRoZSBzdGF0ZSBhIGdpdmVuIGNlbGwgd2lsbCBoYXZlIGluIHRoZSBuZXh0IGdlbmVyYXRpb24gYmFzZWQgb24gdGhlIHZhbHVlIG9mIHRoZSBjZWxsIHRvIGl0cyBsZWZ0LFxuICogdGhlIHZhbHVlIGZyb20gdGhlIGNlbGwgaXRzZWxmLCBhbmQgdGhlIHZhbHVlIG9mIHRoZSBjZWxsIHRvIGl0cyByaWdodC4gXG4gKiBcbiAqIFNpbmNlIHRoZXJlIGFyZSAyw5cyw5cyPTJeMz04IHBvc3NpYmxlIGJpbmFyeSBzdGF0ZXMgZm9yIHRoZSB0aHJlZSBjZWxscyBuZWlnaGJvcmluZyBhIGdpdmVuIGNlbGwsIHRoZXJlIGFyZSBhIHRvdGFsIG9mIDJeOD0yNTYgZWxlbWVudGFyeSBjZWxsdWxhciBhdXRvbWF0YSwgZWFjaCBvZiB3aGljaCBjYW4gYmUgaW5kZXhlZCB3aXRoIGFuIDgtYml0IGJpbmFyeSBudW1iZXIgKFdvbGZyYW0gMTk4MywgMjAwMilcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgMjU2IGVsZW1lbnRhcnkgY2VsbHVsYXIgYXV0b21hdGEgY2FuIGJlIGRlc2NyaWJlZCBieSBhIDggYml0IG51bWJlci4gXG4gKiBcbiAqIFRoZSBydWxlIGRlZmluaW5nIHRoZSBjZWxsdWxhciBhdXRvbWF0b24gbXVzdCBzcGVjaWZ5IHRoZSByZXN1bHRpbmcgc3RhdGUgZm9yIGVhY2ggb2YgdGhlc2UgcG9zc2liaWxpdGllcyBzbyB0aGVyZSBhcmUgMjU2ID0gMl4yXjMgcG9zc2libGUgZWxlbWVudGFyeSBjZWxsdWxhciBhdXRvbWF0YS4gXG4gKiBTdGVwaGVuIFdvbGZyYW0gcHJvcG9zZWQgYSBzY2hlbWUsIGtub3duIGFzIHRoZSBXb2xmcmFtIGNvZGUsIHRvIGFzc2lnbiBlYWNoIHJ1bGUgYSBudW1iZXIgZnJvbSAwIHRvIDI1NSB3aGljaCBoYXMgYmVjb21lIHN0YW5kYXJkLiBFYWNoIHBvc3NpYmxlIGN1cnJlbnQgY29uZmlndXJhdGlvbiBpcyB3cml0dGVuIGluIG9yZGVyLCAxMTEsIDExMCwgLi4uLCAwMDEsIDAwMCwgXG4gKiBhbmQgdGhlIHJlc3VsdGluZyBzdGF0ZSBmb3IgZWFjaCBvZiB0aGVzZSBjb25maWd1cmF0aW9ucyBpcyB3cml0dGVuIGluIHRoZSBzYW1lIG9yZGVyIGFuZCBpbnRlcnByZXRlZCBhcyB0aGUgYmluYXJ5IHJlcHJlc2VudGF0aW9uIG9mIGFuIGludGVnZXIuIFxuICogXG4gKiBUaGlzIG51bWJlciBpcyB0YWtlbiB0byBiZSB0aGUgcnVsZSBudW1iZXIgb2YgdGhlIGF1dG9tYXRvbi4gRm9yIGV4YW1wbGUsIDExMGQ9MDExMDExMTAyLiBTbyBydWxlIDExMCBpcyBkZWZpbmVkIGJ5IHRoZSB0cmFuc2l0aW9uIHJ1bGU6XG4gKiBcbiAqIDExMVx0MTEwXHQxMDFcdDEwMFx0MDExXHQwMTBcdDAwMVx0MDAwXHRjdXJyZW50IHBhdHRlcm5cdFA9KEwsQyxSKVxuICogIDBcdDFcdDFcdDBcdDFcdDFcdDFcdDBcdG5ldyBzdGF0ZSBmb3IgY2VudGVyIGNlbGxcdE4xMTBkPShDK1IrQypSK0wqQypSKSUyXG4gKi9cblxuZXhwb3J0IGNsYXNzIEVsZW1lbnRhcnlDb25maWcge1xuICAgIHJlYWRvbmx5IG5laWdoYm91clJ1bGVzOiBBcnJheTxudW1iZXI+OyAvLyBUaGlzIGlzIHRoZSA4IHBvc3NpYmxlIHN0YXRlcyBhIGNlbGwgY2FuIHRha2UgZnJvbSBpdHMgdGhyZWUgbmVpZ2hib3Vycywga2VlcCB0aGVtIGluIGEgaW1tdXRhYmxlIGxhZGRlciB0byBiZSB1c2VkIGZvciBydWxlIGluZGV4aW5nIGxhdGVyXG5cbiAgICBjb250YWluZXI6IHN0cmluZzsgICAgICAvLyBNYXJrZXIgZWxlbWVudCB3aGVyZSBFbGVtZW50YXJ5IHdpbGwgZ2VuZXJhdGUgaXQncyB2aWV3IChwcm9tcHQgYW5kIGNhbnZhcylcbiAgICBnZW5lcmF0aW9uczogbnVtYmVyOyAgICAvLyBBbW91bnQgb2YgZ2VuZXJhdGlvbnMgdG8gc2ltdWxhdGVcbiAgICB3aWR0aDogbnVtYmVyOyAgICAgICAgICAvLyBHcmlkIHdpZHRoIFxuXG4gICAgcmF0aW86IGJvb2xlYW47ICAgICAgICAgLy8gSWYgdHJ1ZSAtIENhbGN1bGF0ZSBjZWxsc2l6ZSB0byBmaWxsIHdpbmRvdyB3aWR0aFxuICAgIGNlbGxzaXplOiBudW1iZXI7ICAgICAgIC8vIFRoaXMgaXMgdGhlIHNpemUgb2YgYSBzaW5nbGUgY2VsbFxuICAgIGNlbGxjb2xvck9mZjogc3RyaW5nOyAgIC8vIGNvbG9yIGZvciBzdGF0ZSBvZmYgLSB0aGlzIHNob3VsZCBiZSBhIGNvbG9yIHZhbGlkIGluIENTUyAoZXggJ3JnYigxMzIsIDIwOCwgMjEyKScpXG4gICAgY2VsbGNvbG9yT246IHN0cmluZzsgICAgLy8gY29sb3IgZm9yIHN0YXRlIG9uIC0gdGhpcyBzaG91bGQgYmUgYSBjb2xvciB2YWxpZCBpbiBDU1MgKGV4ICdyZ2IoODcsIDkxLCAxMDcpJylcbn07XG5cbmV4cG9ydCBjb25zdCBlbGVtZW50YXJ5Q29uZmlnOiBFbGVtZW50YXJ5Q29uZmlnID0ge1xuICAgIG5laWdoYm91clJ1bGVzOiBbNywgNiwgNSwgNCwgMywgMiwgMSwgMF0sXG5cbiAgICBnZW5lcmF0aW9uczogMTAwMCxcbiAgICB3aWR0aDogMTAwMCxcbiAgICBjZWxsc2l6ZTogMSxcblxuICAgIHJhdGlvOiBmYWxzZSxcbiAgICBjb250YWluZXI6ICcjZWxlbWVudGFyeS1jb250YWluZXInLFxuICAgIGNlbGxjb2xvck9mZjogJyM4NGQwZDQnLFxuICAgIGNlbGxjb2xvck9uOiAnIzM3NGI1YicsXG59O1xuXG5kZWNsYXJlIHR5cGUgQVNDSUlTcGxhc2hJdGVtID0geyBlbmRpbmc6IHN0cmluZzsgY29sb3I6IHN0cmluZzsgYXJ0OiBzdHJpbmc7IH07XG5kZWNsYXJlIHR5cGUgQVNDSUlEYXRhID0gUGFydGlhbDx7IGVudHJ5QXNjaWk6IEFTQ0lJU3BsYXNoSXRlbSB9PlxuXG5jbGFzcyBTaW1wbGVBU0NJSVNwbGFzaGVyIHtcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGFzY2lpOiBBU0NJSVNwbGFzaEl0ZW0pIHsgcmV0dXJuIHRoaXM7IH1cbiAgICBzcGxhc2goKSB7IGNvbnNvbGUuaW5mbyh0aGlzLmFzY2lpLmFydCwgdGhpcy5hc2NpaS5jb2xvciwgdGhpcy5hc2NpaS5lbmRpbmcpOyB9XG59XG5cbi8vIFRPRE86IFJhbmRvbSBzZWVkcywgVUkgYW5kIHBpeGVsIHBlcmZlY3QgcmVuZGVyaW5nIHdpdGggc2Nyb2xsXG5cbmV4cG9ydCBjbGFzcyBFbGVtZW50YXJ5QXBwIHtcbiAgICBwcml2YXRlIGVsZW1lbnRhcnlEb206IEVsZW1lbnRhcnlEb20gPSBuZXcgRWxlbWVudGFyeURvbSgpO1xuICAgIHByaXZhdGUgZGlzcGxheTogRWxlbWVudGFyeURpc3BsYXkgPSBuZXcgRWxlbWVudGFyeURpc3BsYXkoKTtcbiAgICBwcml2YXRlIGNvbmZpZzogRWxlbWVudGFyeUNvbmZpZyA9IGVsZW1lbnRhcnlDb25maWc7XG5cbiAgICAvKiogXG4gICAgICogVGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIHN1cHBseSBhIHVzZXIgY29uZmlnLiBcbiAgICAgKiBJZiBubyBjb25maWcgaXMgc3BlY2lmaWVkIHRoZSBkZWZhdWx0IHdpbGwgYmUgdXNlZCBcbiAgICAgKiAqL1xuICAgIHdpdGhDb25maWcoY29uZmlnOiBFbGVtZW50YXJ5Q29uZmlnKSB7XG4gICAgICAgIGlmICghY29uZmlnICYmICFlbGVtZW50YXJ5Q29uZmlnKSB7XG4gICAgICAgICAgICB0aHJvdyBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9IC0gQSBkZWZhdWx0IG9yIHVzZXIgY29uZmlnIG11c3QgYmUgcHJlc2VudGA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb25maWcgPSBjb25maWcgfHwgZWxlbWVudGFyeUNvbmZpZztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8qKiBcbiAgICAgKiBEaXNwbGF5IGEgJ01PVEQnIHN0eWxlIG1lc3NhZ2UgaW4gdGhlIGJyb3dzZXIgY29uc29sZS4gXG4gICAgICogVGhlIGFydCBpcyBkZWZpbmVkIGluIGRhdGEvbWFpbi5qc29uLiBcbiAgICAgKiAqL1xuICAgIHdpdGhTcGxhc2goYXNjaWk6IEFTQ0lJU3BsYXNoSXRlbSkge1xuICAgICAgICBpZiAoIWFzY2lpIHx8ICFhc2NpaS5hcnQpIHtcbiAgICAgICAgICAgIHRocm93IGAke3RoaXMuY29uc3RydWN0b3IubmFtZX0gLSBDb3VsZCBub3QgZmluZCBzcGxhc2ggIGRhdGFgO1xuICAgICAgICB9XG4gICAgICAgIG5ldyBTaW1wbGVBU0NJSVNwbGFzaGVyKGFzY2lpKS5zcGxhc2goKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcnVuKCkge1xuICAgICAgICBjb25zdCBkZWZhdWx0Q29uZmlnID0gdGhpcy5jb25maWcgfHwgZWxlbWVudGFyeUNvbmZpZztcbiAgICAgICAgY29uc3QgZWxlbWVudGFyeSA9IG5ldyBFbGVtZW50YXJ5KCkuYm9vdHN0cmFwQXBwbGljYXRpb24oZGVmYXVsdENvbmZpZyk7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50YXJ5RG9tLnJlbmRlclNlbGVjdGlvblByb21wdHMoKHJ1bGUpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheS5pbml0KGRlZmF1bHRDb25maWcpO1xuICAgICAgICAgICAgZWxlbWVudGFyeS5jaGFuZ2VSdWxlc2V0KHJ1bGUpLmFuaW1hdGUoKGdlbmVyYXRpb25zLCB5ZWFyKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5LnJlbmRlcihnZW5lcmF0aW9ucywgeWVhcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG4vLyBBUEkgLSBob3cgdG8gcnVuIGV4YW1wbGVcbm5ldyBFbGVtZW50YXJ5QXBwKCkud2l0aFNwbGFzaCgoPEFTQ0lJRGF0YT5hc2NpaUNmZykuZW50cnlBc2NpaSlcbiAgICAud2l0aENvbmZpZyhlbGVtZW50YXJ5Q29uZmlnKS5ydW4oKTsiLCIvKipcclxuICogIEVsZW1lbnRhcnlCdWZmZXIgaXMgdGhlIGludGVybmFsIGRhdGEgc3RydWN0dXJlIHRoYXQgaG9sZHMgdGhlIGJpdC1ncmlkIG1ha2luZyB1cCB0aGUgYXV0b21hdGEuXHJcbiAqICAnMScgbWVhbnMgcmVuZGVyIGFuZCB0cmVhdCBhcyBhIG5laWdoYm91ciwgJzAnIG1lYW5zIHRvIGlnbm9yZVxyXG4gKi9cclxuXHJcbmV4cG9ydCBkZWNsYXJlIHR5cGUgRWxlbWVudGFyeUJpbmFyeU51bWJlciA9IDAgfCAxO1xyXG5cclxuZXhwb3J0IGNsYXNzIEVsZW1lbnRhcnlCdWZmZXIge1xyXG4gICAgcHVibGljIHJlYWRvbmx5IGludGVybmFsQnVmZmVyOiBVaW50OEFycmF5ID0gdW5kZWZpbmVkO1xyXG4gICAgcHJpdmF0ZSBoaWdoZXN0R2VuZXJhdGlvbkluZGV4OiBudW1iZXIgPSAwO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgd2lkdGg6IG51bWJlciwgcHJpdmF0ZSByZWFkb25seSBnZW5lcmF0aW9uczogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5pbnRlcm5hbEJ1ZmZlciA9IHRoaXMuaW50ZXJuYWxDcmVhdGVCdWZmZXIodGhpcy5nZW5lcmF0aW9ucywgdGhpcy53aWR0aCk7XHJcbiAgICAgICAgaWYgKCF0aGlzLmludGVybmFsQnVmZmVyIHx8IHRoaXMuaW50ZXJuYWxCdWZmZXIuYnVmZmVyLmJ5dGVMZW5ndGggPCB0aGlzLnNpemUpIHtcclxuICAgICAgICAgICAgdGhyb3cgYCR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfSAtIEZhaWxlZCB0byBjcmVhdGUgYnVmZmVyIHdpdGggc2l6ZSAke3RoaXMuc2l6ZX1gO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5pbnRlcm5hbEJ1ZmZlci5maWxsKDAsIDAsIHRoaXMuc2l6ZSk7IC8vIFNlZWQgZmlyc3QgZ2VuZXJhdGlvblxyXG4gICAgICAgIHRoaXMuaW50ZXJuYWxCdWZmZXIuZmlsbCgxLCB0aGlzLndpZHRoIC8gMiwgdGhpcy53aWR0aCAvIDIgKyAxKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgYWdlKCkgeyByZXR1cm4gdGhpcy5oaWdoZXN0R2VuZXJhdGlvbkluZGV4OyB9IC8vIEFtb3VudCBvZiB5ZWFycyBwcm9jZXNzZWQgc28gZmFyIFxyXG4gICAgZ2V0IHNpemUoKSB7IHJldHVybiB0aGlzLmdlbmVyYXRpb25zICogdGhpcy53aWR0aDsgfVxyXG4gICAgZ2V0IGJ1ZmZlcigpIHsgcmV0dXJuIHRoaXMuaW50ZXJuYWxCdWZmZXI7IH1cclxuXHJcbiAgICBwdWJsaWMgY3VycmVudEdlbmVyYXRpb24oKTogVWludDhBcnJheSB7IHJldHVybiB0aGlzLmdlbmVyYXRpb24odGhpcy5oaWdoZXN0R2VuZXJhdGlvbkluZGV4KTsgfVxyXG4gICAgcHVibGljIGdlbmVyYXRpb24oeWVhcjogbnVtYmVyKTogVWludDhBcnJheSB7IHJldHVybiB0aGlzLmludGVybmFsQnVmZmVyLnN1YmFycmF5KHRoaXMud2lkdGggKiB5ZWFyLCB0aGlzLndpZHRoICogeWVhciArIHRoaXMud2lkdGgpOyB9XHJcbiAgICBwdWJsaWMgdG9nZ2xlKHllYXI6IG51bWJlciwgY29sOiBudW1iZXIpIHsgdGhpcy5pbnRlcm5hbEVsZW1lbnRTZXQoeWVhciwgY29sLCB0aGlzLmludGVybmFsRWxlbWVudEF0KHllYXIsIGNvbCkgPyAwIDogMSk7IH1cclxuICAgIHB1YmxpYyBzZXQoeWVhcjogbnVtYmVyLCBjb2w6IG51bWJlciwgdmFsdWU6IG51bWJlcikgeyB0aGlzLmludGVybmFsRWxlbWVudFNldCh5ZWFyLCBjb2wsIHZhbHVlKTsgfVxyXG4gICAgcHVibGljIHJlYWQoeWVhcjogbnVtYmVyLCBjb2w6IG51bWJlcikgeyByZXR1cm4gdGhpcy5pbnRlcm5hbEVsZW1lbnRBdCh5ZWFyLCBjb2wpOyB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbnRlcm5hbEVsZW1lbnRTZXQocm93OiBudW1iZXIsIGNvbDogbnVtYmVyLCBmbGFnOiBudW1iZXIpIHtcclxuICAgICAgICBjb25zdCBiaW5hcnlOdW1iZXIgPSBmbGFnIGFzIEVsZW1lbnRhcnlCaW5hcnlOdW1iZXI7XHJcbiAgICAgICAgY29uc3QgZmxhdEluZGV4ID0gcm93ICogdGhpcy53aWR0aCArIGNvbDtcclxuXHJcbiAgICAgICAgaWYgKGZsYXRJbmRleCA8IDAgfHwgZmxhdEluZGV4ID4gdGhpcy5zaXplKSB7IHRocm93IGAke3RoaXMuY29uc3RydWN0b3IubmFtZX0gLSBBcmd1bWVudCBvdXQgb2YgYm91bmRzICR7cm93fSwgJHtjb2x9YDsgfVxyXG4gICAgICAgIGlmIChiaW5hcnlOdW1iZXIgIT0gMSAmJiBiaW5hcnlOdW1iZXIgIT0gMCkgeyB0aHJvdyBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9IC0gRmxhZyBpcyBub3QgaW4gYSBjb3JyZWN0IGZvcm0uIFNob3VsZCBiZSBhIGJpdCAoMCBvciAxKSBgOyB9XHJcblxyXG4gICAgICAgIHRoaXMuYnVmZmVyW2ZsYXRJbmRleF0gPSBmbGFnOyAvLyBDaGVjayBpZiB3ZSBoYXZlIHJlYWNoZWQgYSBoaWdoZXIgZ2VuZXJhdGlvblxyXG4gICAgICAgIGlmIChyb3cgPiB0aGlzLmhpZ2hlc3RHZW5lcmF0aW9uSW5kZXgpIHsgLy8gVE9ETyBtb3ZlIHRoaXMgdG8gZWxlbWVudGFyeS50cyBmb3IgcGVyZm9ybWFuY2VcclxuICAgICAgICAgICAgdGhpcy5oaWdoZXN0R2VuZXJhdGlvbkluZGV4ID0gcm93O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGludGVybmFsRWxlbWVudEF0KHJvdzogbnVtYmVyLCBjb2w6IG51bWJlcikge1xyXG4gICAgICAgIGNvbnN0IGZsYXRJbmRleCA9IHJvdyAqIHRoaXMud2lkdGggKyBjb2w7XHJcbiAgICAgICAgaWYgKGZsYXRJbmRleCA8IDAgfHwgZmxhdEluZGV4ID4gdGhpcy5zaXplKSB7XHJcbiAgICAgICAgICAgIHRocm93IGAke3RoaXMuY29uc3RydWN0b3IubmFtZX0gLSBBcmd1bWVudCBvdXQgb2YgYm91bmRzICR7cm93fSwgJHtjb2x9YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYnVmZmVyW2ZsYXRJbmRleF07XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbnRlcm5hbENyZWF0ZUJ1ZmZlcihyb3dzOiBudW1iZXIsIGNvbHM6IG51bWJlcikge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmICghcm93cyB8fCAhY29scyB8fCByb3dzIDw9IDAgfHwgY29scyA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBFcnJvcihgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9IC0gSW52YWxpZCByb3cgYW5kIGNvbCBkYXRhYCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKHJvd3MgKiBjb2xzKTtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGJ1ZmZlciwgMCwgcm93cyAqIGNvbHMpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgdGhyb3cgYCR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfSAtICR7ZX1gO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImltcG9ydCB7IEVsZW1lbnRhcnlDb25maWcgfSBmcm9tIFwiLi9hcHBcIjtcblxuZGVjbGFyZSB0eXBlIENhbWVyYSA9IHsgeDogbnVtYmVyLCB5OiBudW1iZXI7IH1cblxuZXhwb3J0IGNsYXNzIEVsZW1lbnRhcnlEaXNwbGF5IHtcbiAgICBwcml2YXRlIGVsZW1lbnRhcnljb25maWc6IEVsZW1lbnRhcnlDb25maWc7XG4gICAgcHVibGljIG9mZnNjcmVlbkNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcbiAgICBwdWJsaWMgY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuICAgIHB1YmxpYyBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50O1xuXG4gICAgcHJpdmF0ZSBpc01vdXNlRG93biA9IGZhbHNlO1xuICAgIHByaXZhdGUgY2FtZXJhU3BlZWQ6IG51bWJlciA9IDEwLjQ7XG4gICAgcHJpdmF0ZSBsYXN0TW91c2U6IENhbWVyYSA9IHsgeDogMCwgeTogMCB9XG4gICAgcHJpdmF0ZSBtb3VzZTogQ2FtZXJhID0geyB4OiAwLCB5OiAwIH1cbiAgICBwcml2YXRlIGNhbWVyYTogQ2FtZXJhID0geyB4OiAwLCB5OiAwIH1cblxuICAgIHB1YmxpYyBpbml0KGNvbmZpZzogRWxlbWVudGFyeUNvbmZpZywgY29udGFpbmVyPzogc3RyaW5nLCBpZD86IHN0cmluZykge1xuICAgICAgICBpZiAoIWNvbnRhaW5lcikgeyBjb250YWluZXIgPSAnZ2FtZS12aWV3JzsgfVxuICAgICAgICBpZiAoIWlkKSB7IGlkID0gJ2dhbWUtY2FudmFzJzsgfVxuXG4gICAgICAgIGNvbnN0IFtjYW52YXMsIGNvbnRleHQsIG9mZnNjcmVlbkNvbnRleHRdID0gdGhpcy5pbml0SERQSUNhbnZhc0VsZW1lbnQoY29uZmlnLCBjb250YWluZXIsIGlkKTtcbiAgICAgICAgdGhpcy5jZW50ZXJBdXRvbWF0YUluVmlldyhjb25maWcsIGNvbnRleHQpO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyU3lzdGVtRXZlbnRzKCk7XG5cbiAgICAgICAgdGhpcy5vZmZzY3JlZW5Db250ZXh0ID0gb2Zmc2NyZWVuQ29udGV4dDtcbiAgICAgICAgdGhpcy5lbGVtZW50YXJ5Y29uZmlnID0gY29uZmlnO1xuICAgICAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICAgICAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVuZGVyKGdlbmVyYXRpb25zOiBVaW50OEFycmF5LCB5ZWFyOiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLmVsZW1lbnRhcnljb25maWcpIHsgdGhyb3cgJ0VsZW1udGFyeUNvbmZpZyBoYXMgdG8gYmUgc2V0IGlmIHRoZSBncmlkIHNob3VsZCBiZSBjYW52YXMgcmVuZGVyZWQnOyB9XG4gICAgICAgIGlmICghZ2VuZXJhdGlvbnMpIHsgdGhyb3cgJ0lsbGVnYWwgc3RhdGUgLSBEaXNwbGF5IGdyaWQgaXMgdW5kZWZpbmVkJzsgfVxuXG4gICAgICAgIGNvbnN0IGNvbmZpZ3NpemUgPSB0aGlzLmVsZW1lbnRhcnljb25maWcuY2VsbHNpemU7XG4gICAgICAgIGNvbnN0IGdyaWRoZWlnaHQgPSB0aGlzLmVsZW1lbnRhcnljb25maWcuZ2VuZXJhdGlvbnM7XG4gICAgICAgIGNvbnN0IGdyaWR3aWR0aCA9IHRoaXMuZWxlbWVudGFyeWNvbmZpZy53aWR0aDtcbiAgICAgICAgY29uc3QgcmF0aW8gPSB0aGlzLmVsZW1lbnRhcnljb25maWcucmF0aW87XG5cbiAgICAgICAgbGV0IGNlbGx3ID0gcmF0aW8gPyB0aGlzLmNhbnZhcy53aWR0aCAqIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIC8gZ3JpZHdpZHRoIDogY29uZmlnc2l6ZTtcbiAgICAgICAgbGV0IGNlbGxoID0gcmF0aW8gPyB0aGlzLmNhbnZhcy5oZWlnaHQgKiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyAvIGdyaWRoZWlnaHQgOiBjb25maWdzaXplO1xuXG4gICAgICAgIGdlbmVyYXRpb25zLmZvckVhY2goKGNlbGwsIGdyaWRjZWxsKSA9PiB7XG4gICAgICAgICAgICB0aGlzLm9mZnNjcmVlbkNvbnRleHQuZmlsbFN0eWxlID0gY2VsbCA/IHRoaXMuZWxlbWVudGFyeWNvbmZpZy5jZWxsY29sb3JPbiA6IHRoaXMuZWxlbWVudGFyeWNvbmZpZy5jZWxsY29sb3JPZmY7XG4gICAgICAgICAgICB0aGlzLm9mZnNjcmVlbkNvbnRleHQuZmlsbFJlY3QoZ3JpZGNlbGwgKiBjZWxsdywgeWVhciAqIGNlbGxoLCBjZWxsdywgY2VsbGgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xuICAgICAgICB0aGlzLmNvbnRleHQuZHJhd0ltYWdlKHRoaXMub2Zmc2NyZWVuQ29udGV4dC5jYW52YXMsIHRoaXMuY2FtZXJhLngsIHRoaXMuY2FtZXJhLnkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgaW5pdEhEUElDYW52YXNFbGVtZW50KGNvbmZpZzogRWxlbWVudGFyeUNvbmZpZywgY29udGFpbmVyOiBzdHJpbmcsIGlkOiBzdHJpbmcgPSB1bmRlZmluZWQpOiBbSFRNTENhbnZhc0VsZW1lbnQsIENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEXSB7XG4gICAgICAgIGNvbnN0IGNhbnZhc2NvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGNvbnRhaW5lcik7XG4gICAgICAgIGNvbnN0IFtfLCBvZmZzY3JlZW5Db250ZXh0XSA9IHRoaXMuY3JlYXRlSERQSUNhbnZhc0VsZW1lbnQoY29uZmlnLCBjYW52YXNjb250YWluZXIpO1xuICAgICAgICBjb25zdCBbY2FudmFzLCBjb250ZXh0XSA9IHRoaXMuY3JlYXRlSERQSUNhbnZhc0VsZW1lbnQoY29uZmlnLCBjYW52YXNjb250YWluZXIpO1xuXG4gICAgICAgIGlmIChpZCkgeyBjYW52YXMuaWQgPSBpZDsgfVxuICAgICAgICBjYW52YXNjb250YWluZXIuYXBwZW5kQ2hpbGQoY2FudmFzKTtcbiAgICAgICAgcmV0dXJuIFtjYW52YXMsIGNvbnRleHQsIG9mZnNjcmVlbkNvbnRleHRdO1xuICAgIH1cblxuICAgIHByaXZhdGUgY3JlYXRlSERQSUNhbnZhc0VsZW1lbnQoY29uZmlnOiBFbGVtZW50YXJ5Q29uZmlnLCBjb250YWluZXI/OiBIVE1MRWxlbWVudCk6IFtIVE1MQ2FudmFzRWxlbWVudCwgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEXSB7XG4gICAgICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpIGFzIEhUTUxDYW52YXNFbGVtZW50O1xuICAgICAgICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICBjb25zdCBkZXZpY2VwaXhlbHJhdGlvID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMTtcbiAgICAgICAgbGV0IHsgd2lkdGgsIGhlaWdodCB9ID0gY29udGFpbmVyPy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgICBpZiAoIXdpZHRoIHx8ICFoZWlnaHQpIHtcbiAgICAgICAgICAgIHdpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgICAgICAgICBoZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICAgIH1cblxuICAgICAgICBjYW52YXMud2lkdGggPSB3aWR0aCAqIGRldmljZXBpeGVscmF0aW87XG4gICAgICAgIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQgKiBkZXZpY2VwaXhlbHJhdGlvO1xuICAgICAgICBjYW52YXMuc3R5bGUud2lkdGggPSBgJHt3aWR0aCAqIGRldmljZXBpeGVscmF0aW99cHhgO1xuICAgICAgICBjYW52YXMuc3R5bGUuaGVpZ2h0ID0gYCR7aGVpZ2h0ICogZGV2aWNlcGl4ZWxyYXRpb31weGA7XG5cbiAgICAgICAgY3R4LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IGZhbHNlO1xuICAgICAgICBjYW52YXMuc3R5bGUuaW1hZ2VSZW5kZXJpbmcgPSAncGl4ZWxhdGVkJztcbiAgICAgICAgY2FudmFzLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGNvbmZpZy5jZWxsY29sb3JPZmY7XG4gICAgICAgIHJldHVybiBbY2FudmFzLCBjdHhdO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2VudGVyQXV0b21hdGFJblZpZXcoY29uZmlnOiBFbGVtZW50YXJ5Q29uZmlnLCBjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgcGFuVmVydGljYWwgPSBjb25maWcuZ2VuZXJhdGlvbnMgPCBjb250ZXh0LmNhbnZhcy5oZWlnaHQ7XG4gICAgICAgIGNvbnN0IHRyYW5zbGF0ZVggPSBjb250ZXh0LmNhbnZhcy53aWR0aCAvIDIgLSBjb25maWcud2lkdGggLyAyO1xuICAgICAgICBjb25zdCB0cmFuc2xhdGVZID0gY29udGV4dC5jYW52YXMuaGVpZ2h0IC8gMiAtIGNvbmZpZy5nZW5lcmF0aW9ucyAvIDI7XG4gICAgICAgIGNvbnRleHQudHJhbnNsYXRlKHRyYW5zbGF0ZVgsIHBhblZlcnRpY2FsID8gdHJhbnNsYXRlWSA6IDApO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVnaXN0ZXJTeXN0ZW1FdmVudHMoKTogdm9pZCB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGUua2V5LnRvTG93ZXJDYXNlKCkgPT0gJ3cnKSB7IHRoaXMuY2FtZXJhLnkgKz0gdGhpcy5jYW1lcmFTcGVlZDsgfVxuICAgICAgICAgICAgaWYgKGUua2V5LnRvTG93ZXJDYXNlKCkgPT0gJ3MnKSB7IHRoaXMuY2FtZXJhLnkgLT0gdGhpcy5jYW1lcmFTcGVlZDsgfVxuICAgICAgICAgICAgaWYgKGUua2V5LnRvTG93ZXJDYXNlKCkgPT0gJ2EnKSB7IHRoaXMuY2FtZXJhLnggLT0gdGhpcy5jYW1lcmFTcGVlZDsgfVxuICAgICAgICAgICAgaWYgKGUua2V5LnRvTG93ZXJDYXNlKCkgPT0gJ2QnKSB7IHRoaXMuY2FtZXJhLnggKz0gdGhpcy5jYW1lcmFTcGVlZDsgfVxuICAgICAgICB9KTtcbiAgICB9XG59IiwiZGVjbGFyZSB0eXBlIEVsZW1lbnRhcnlFbGVtZW50ID0ge1xuICAgIGNvbnRleHQ6IERvY3VtZW50RnJhZ21lbnQgfCBIVE1MRWxlbWVudCxcbiAgICBlbGVtZW50OiBIVE1MRWxlbWVudCxcblxuICAgIGJ5SWQ6IChzZWxlY3Rvcjogc3RyaW5nKSA9PiBFbGVtZW50YXJ5RWxlbWVudCxcbiAgICBieUNsYXNzOiAoc2VsZWN0b3I6IHN0cmluZykgPT4gRWxlbWVudGFyeUVsZW1lbnQsXG4gICAgd2l0aDogKGNvbnRleHQ6IERvY3VtZW50RnJhZ21lbnQgfCBIVE1MRWxlbWVudCkgPT4gRWxlbWVudGFyeUVsZW1lbnQsXG5cbiAgICBjc3M6ICguLi50b2tlbnM6IHN0cmluZ1tdKSA9PiBFbGVtZW50YXJ5RWxlbWVudCxcbiAgICBhdHRyOiAoYXR0cnM6IGFueSkgPT4gRWxlbWVudGFyeUVsZW1lbnQsXG4gICAgdGV4dDogKHRleHQ6IHN0cmluZykgPT4gRWxlbWVudGFyeUVsZW1lbnQsXG4gICAgbWFrZTogKHRhZzogc3RyaW5nKSA9PiBFbGVtZW50YXJ5RWxlbWVudCxcbiAgICBfc2VsZjogKGNvbnRleHQ6ICgpID0+IGFueSkgPT4gRWxlbWVudGFyeUVsZW1lbnQsXG59XG5cbmV4cG9ydCBjbGFzcyBFbGVtZW50YXJ5RG9tIHtcbiAgICByZW5kZXJTZWxlY3Rpb25Qcm9tcHRzKHNlbGVjdGlvbjogKHY6IG51bWJlcikgPT4gdm9pZCkge1xuICAgICAgICBjb25zdCBzZWxlY3Rpb25Db250YWluZXIgPSBlbGVtZW50YXJ5RWxlbWVudEZhY3Rvcnkud2l0aChkb2N1bWVudCkuYnlJZCgnc2VsZWN0aW9uLXZpZXcnKS5lbGVtZW50O1xuICAgICAgICBjb25zdCBnYW1lQ29udGFpbmVyID0gZWxlbWVudGFyeUVsZW1lbnRGYWN0b3J5LndpdGgoZG9jdW1lbnQpLmJ5SWQoJ2dhbWUtdmlldycpLmVsZW1lbnQ7XG4gICAgICAgIGlmICghc2VsZWN0aW9uQ29udGFpbmVyKSB7IHRocm93ICdGYWlsZWQgdG8gbG9hZCBzZWxlY3Rpb24gc2VsZWN0aW9uQ29udGFpbmVyIC0gdGhpcyBpcyBhIGZhdGFsIGVycm9yJzsgfVxuXG4gICAgICAgIGNvbnN0IGZyYWdtZW50Um9vdCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICAgICAgY29uc3QgW2NvbnRhaW5lciwgaW5wdXQsIHN1Ym1pdCwgbm90aWZpZXJdID0gdGhpcy5idWlsZEVsZW1lbnRzKGZyYWdtZW50Um9vdCk7XG5cbiAgICAgICAgaWYgKHNlbGVjdGlvbikge1xuICAgICAgICAgICAgc3VibWl0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJ1bGUgPSBwYXJzZUludCgoaW5wdXQgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWUpO1xuICAgICAgICAgICAgICAgIGlmIChydWxlID49IDAgJiYgcnVsZSA8IE1hdGgucG93KDIsIDgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGdhbWVDb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnZGlzcGxheS1ub25lJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdkaXNwbGF5LW5vbmUnKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGVjdGlvbihydWxlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBFbHNlIHdlIGhhdmUgYSBlcnJvciwgc28gZGlzcGxheSBub3RpZmllclxuICAgICAgICAgICAgICAgIG5vdGlmaWVyLmNsYXNzTGlzdC50b2dnbGUoJ2Rpc3BsYXktbm9uZScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgc2VsZWN0aW9uQ29udGFpbmVyLmFwcGVuZChmcmFnbWVudFJvb3QpO1xuICAgIH1cblxuICAgIGJ1aWxkRWxlbWVudHMoY29udGV4dDogRG9jdW1lbnRGcmFnbWVudCkgOiBIVE1MRWxlbWVudFtdIHtcbiAgICAgICAgY29uc3QgcnVsZUlucHV0Q29udGFpbmVyID0gZWxlbWVudGFyeUVsZW1lbnRGYWN0b3J5LndpdGgoY29udGV4dCkubWFrZSgnZGl2JykuY3NzKCdydWxlLWNhcmQnLCAncHQtbm9ybWFsJykuZWxlbWVudDtcbiAgICAgICAgY29uc3QgaW5wdXRQcm9tcHQgPSBlbGVtZW50YXJ5RWxlbWVudEZhY3Rvcnkud2l0aChydWxlSW5wdXRDb250YWluZXIpLm1ha2UoJ2lucHV0JykuYXR0cih7ICd0eXBlJzogJ3RleHQnIH0pLmNzcygncnVsZS1pbnB1dCcpLmVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IHN1Ym1pdEJ1dHRvbiA9IGVsZW1lbnRhcnlFbGVtZW50RmFjdG9yeS53aXRoKHJ1bGVJbnB1dENvbnRhaW5lcikubWFrZSgnYnV0dG9uJykuYXR0cih7ICd0eXBlJzogJ2J1dHRvbicgfSkuY3NzKCdydWxlLWJ0bicpLnRleHQoJ0dvIScpLmVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IG5vdGlmaWVyID0gZWxlbWVudGFyeUVsZW1lbnRGYWN0b3J5LndpdGgocnVsZUlucHV0Q29udGFpbmVyKS5tYWtlKCdzbWFsbCcpLmNzcygncnVsZS1ub3RpZmljYXRpb24nLCAnZC1ibG9jaycsICdkaXNwbGF5LW5vbmUnKS50ZXh0KCdQbGVhc2UgaW5wdXQgYSB2YWx1ZSBiZXR3ZWVuIDAgYW5kIDI1NScpLmVsZW1lbnQ7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgcnVsZUlucHV0Q29udGFpbmVyLCBpbnB1dFByb21wdCwgc3VibWl0QnV0dG9uLCBub3RpZmllclxuICAgICAgICBdO1xuICAgIH1cbn1cblxuY29uc3QgZWxlbWVudGFyeUVsZW1lbnRGYWN0b3J5OiBFbGVtZW50YXJ5RWxlbWVudCA9IHtcbiAgICBjb250ZXh0OiB1bmRlZmluZWQsXG4gICAgZWxlbWVudDogdW5kZWZpbmVkLFxuXG4gICAgYnlDbGFzczogZnVuY3Rpb24gKHNlbGVjdG9yOiBzdHJpbmcpOiBFbGVtZW50YXJ5RWxlbWVudCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZWxmKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudCA9IHRoaXMuY29udGV4dC5xdWVyeVNlbGVjdG9yKGAuJHtzZWxlY3Rvcn1gKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBieUlkOiBmdW5jdGlvbiAoc2VsZWN0b3I6IHN0cmluZyk6IEVsZW1lbnRhcnlFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbGYoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50ID0gdGhpcy5jb250ZXh0LnF1ZXJ5U2VsZWN0b3IoYCMke3NlbGVjdG9yfWApO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIG1ha2U6IGZ1bmN0aW9uICh0YWc6IHN0cmluZyk6IEVsZW1lbnRhcnlFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbGYoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50ID0gdGhpcy5jb250ZXh0LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnKSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgdGV4dDogZnVuY3Rpb24gKHRleHQ6IHN0cmluZyk6IEVsZW1lbnRhcnlFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbGYoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmlubmVyVGV4dCA9IHRleHQ7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgY3NzOiBmdW5jdGlvbiAoLi4udG9rZW5zOiBzdHJpbmdbXSk6IEVsZW1lbnRhcnlFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbGYoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoLi4udG9rZW5zKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBhdHRyOiBmdW5jdGlvbiAoYXR0cnM6IGFueSk6IEVsZW1lbnRhcnlFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbGYoKCkgPT4ge1xuICAgICAgICAgICAgZm9yICh2YXIgdG9rZW4gaW4gYXR0cnMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKHRva2VuLCBhdHRyc1t0b2tlbl0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIHdpdGg6IGZ1bmN0aW9uIChjb250ZXh0OiBEb2N1bWVudEZyYWdtZW50IHwgSFRNTEVsZW1lbnQpOiBFbGVtZW50YXJ5RWxlbWVudCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZWxmKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudCA9IGNvbnRleHQuZ2V0Um9vdE5vZGUoKSBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBfc2VsZjogZnVuY3Rpb24gKGNvbnRleHQ6ICgpID0+IEVsZW1lbnRhcnlFbGVtZW50KTogRWxlbWVudGFyeUVsZW1lbnQge1xuICAgICAgICBjb250ZXh0KCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBFbGVtZW50YXJ5QnVmZmVyIH0gZnJvbSBcIi4vYnVmZmVyXCI7XG5pbXBvcnQgeyBFbGVtZW50YXJ5Q29uZmlnIH0gZnJvbSBcIi4vYXBwXCI7XG5cbmV4cG9ydCBlbnVtIEFuaW1hdGlvblN0eWxlIHtcbiAgICBTdGVwd2lzZSA9IDAsXG4gICAgRGlyZWN0ID0gMVxufVxuXG5leHBvcnQgY2xhc3MgRWxlbWVudGFyeSB7XG4gICAgcHJpdmF0ZSBlbGVtZW50YXJ5Q29uZmlnOiBFbGVtZW50YXJ5Q29uZmlnXG4gICAgcHJpdmF0ZSBnZW5lcmF0aW9uQnVmZmVyOiBFbGVtZW50YXJ5QnVmZmVyO1xuICAgIHByaXZhdGUgYW5pbWF0aW9uU3R5bGU6IEFuaW1hdGlvblN0eWxlO1xuXG4gICAgLyoqIFxuICAgICAqICBUaGlzIGlzIHRoZSBjdXJyZW50IHJ1bGVzZXQsIGluZGljYXRpbmcgaG93IHRoZSBuZXh0IGdlbmVyYXRpb24gc2hvdWxkIGNob29zZSBpdHMgdmFsdWUgYWNjb3JkaW5nIHRvIHRoZSBjdXJyZW50IHN0YXRlXG4gICAgICogIG9mIHRoZSBjZWxsIGFuZCBpdHMgdHdvIGltbWVkaWF0ZSBuZWlnaGJvcnNcbiAgICAqL1xuICAgIHByaXZhdGUgcnVsZXNldDogQXJyYXk8bnVtYmVyPjtcblxuICAgIGJvb3RzdHJhcEFwcGxpY2F0aW9uKGNvbmZpZzogRWxlbWVudGFyeUNvbmZpZywgYW5pbWF0aW9uU3R5bGU6IEFuaW1hdGlvblN0eWxlID0gQW5pbWF0aW9uU3R5bGUuU3RlcHdpc2UpOiBFbGVtZW50YXJ5IHtcbiAgICAgICAgdGhpcy5nZW5lcmF0aW9uQnVmZmVyID0gbmV3IEVsZW1lbnRhcnlCdWZmZXIoY29uZmlnLndpZHRoLCBjb25maWcuZ2VuZXJhdGlvbnMpO1xuICAgICAgICB0aGlzLmFuaW1hdGlvblN0eWxlID0gYW5pbWF0aW9uU3R5bGU7XG4gICAgICAgIHRoaXMucnVsZXNldCA9IG5ldyBBcnJheTxudW1iZXI+KDgpO1xuICAgICAgICB0aGlzLmVsZW1lbnRhcnlDb25maWcgPSBjb25maWc7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFuaW1hdGUgdGhlIHN0ZXAgY29sY3VsYXRpb24sIHJ1biB1bnRpbGwgc3BlY2lmaWVkIGFtb3VudCBvZiBnZW5lcmF0aW9ucyBoYXMgcGFzc2VkLlxuICAgICAqL1xuICAgIGFuaW1hdGUob25TdWNjZXNzOiAoZ2VuZXJhdGlvbnM6IFVpbnQ4QXJyYXksIHllYXI6IG51bWJlcikgPT4gdm9pZCkge1xuICAgICAgICBjb25zdCB0aWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZ3JpZCA9IHRoaXMuc3RlcCh0aGlzLmN1cnJlbnRHZW5lcmF0aW9uKCkpO1xuICAgICAgICAgICAgLy8gbGV0IG5leHRHZW5lcmF0aW9uID0gdGhpcy5nZW5lcmF0aW9uQnVmZmVyLmFnZSA8IHRoaXMuZWxlbWVudGFyeUNvbmZpZy5nZW5lcmF0aW9ucyAtIDE7XG4gICAgICAgICAgICAvLyBpZiAobmV4dEdlbmVyYXRpb24pIHsgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aWNrKTsgfVxuICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aWNrKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmFuaW1hdGlvblN0eWxlID09PSBBbmltYXRpb25TdHlsZS5TdGVwd2lzZSkge1xuICAgICAgICAgICAgICAgIG9uU3VjY2VzcyhncmlkLCB0aGlzLmdlbmVyYXRpb25CdWZmZXIuYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRpY2spO1xuICAgICAgICBpZiAodGhpcy5hbmltYXRpb25TdHlsZSA9PT0gQW5pbWF0aW9uU3R5bGUuRGlyZWN0KSB7XG4gICAgICAgICAgICBvblN1Y2Nlc3ModGhpcy5nZW5lcmF0aW9uQnVmZmVyLmJ1ZmZlciwgdGhpcy5lbGVtZW50YXJ5Q29uZmlnLmdlbmVyYXRpb25zKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBcbiAgICAqIFBlcmZvcm0gYSBzdGVwLCBjYWxjdWxhdGUgb25lIGdlbmVyYXRpb24uXG4gICAgKiBAcGFyYW0gY3VycmVudEdlbmVyYXRpbmdHcmlkICBUaGUgcm93IGluIHRoZSBnZW5lcmF0aW9uIGN1cnJlbnRseSBiZWVpbmcgZ2VuZXJhdGVkXG4gICAgKi9cbiAgICBzdGVwKGN1cnJlbnRHZW5lcmF0aW5nR3JpZDogVWludDhBcnJheSk6IFVpbnQ4QXJyYXkge1xuICAgICAgICBjb25zdCB5ZWFyID0gdGhpcy5nZW5lcmF0aW9uQnVmZmVyLmFnZSArIDE7XG4gICAgICAgIGZvciAobGV0IGdyaWRjZWxsID0gMDsgZ3JpZGNlbGwgPCB0aGlzLmVsZW1lbnRhcnlDb25maWcud2lkdGg7IGdyaWRjZWxsKyspIHtcbiAgICAgICAgICAgIGNvbnN0IG4gPSB0aGlzLm5laWdoYm91cnMoY3VycmVudEdlbmVyYXRpbmdHcmlkLCBncmlkY2VsbCk7XG4gICAgICAgICAgICBpZiAoIW4gJiYgbiA8IDApIHsgdGhyb3cgYElsbGVnYWwgc3RhdGU6ICR7Z3JpZGNlbGx9YDsgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmdlbmVyYXRpb25CdWZmZXIuc2V0KHllYXIsIGdyaWRjZWxsLCB0aGlzLnJ1bGUobikpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjdXJyZW50R2VuZXJhdGluZ0dyaWQ7XG4gICAgfVxuXG4gICAgLyoqIFxuICAgICogR2V0IHRoZSBuZWlnaGJvdXJSdWxlcy1pbmRleCBjYWxjdWxhdGVkIGZyb20gdGhlIG5laWdoYm91cnMgb2YgdGhlIGNlbGwgY3VycmVudGx5IGJlZWluZyB2aXNpc3RlZC5cbiAgICAqIEBwYXJhbSBjdXJyZW50R2VuZXJhdGluZ0dyaWQgIFRoZSByb3cgaW4gdGhlIGdlbmVyYXRpb24gY3VycmVudGx5IGJlZWluZyBnZW5lcmF0ZWRcbiAgICAgKi9cbiAgICBuZWlnaGJvdXJzKGN1cnJlbnRHZW5lcmF0aW5nR3JpZDogVWludDhBcnJheSwgY2VsbDogbnVtYmVyKSB7XG4gICAgICAgIGlmIChjZWxsIDwgMCB8fCBjZWxsID4gdGhpcy5lbGVtZW50YXJ5Q29uZmlnLndpZHRoKSB7IHJldHVybiAwOyB9XG5cbiAgICAgICAgY29uc3QgciA9IGN1cnJlbnRHZW5lcmF0aW5nR3JpZFtjZWxsICsgMSA+PSB0aGlzLmVsZW1lbnRhcnlDb25maWcud2lkdGggPyAwIDogY2VsbCArIDFdO1xuICAgICAgICBjb25zdCBsID0gY3VycmVudEdlbmVyYXRpbmdHcmlkW2NlbGwgLSAxIDw9IDAgPyAwIDogY2VsbCAtIDFdO1xuICAgICAgICByZXR1cm4gMHhmICYgKHIgPDwgMiB8IGN1cnJlbnRHZW5lcmF0aW5nR3JpZFtjZWxsXSA8PCAxIHwgbCk7XG4gICAgfVxuXG4gICAgcnVsZShpbmRleDogbnVtYmVyKSB7IHJldHVybiB0aGlzLnJ1bGVzZXRbdGhpcy5lbGVtZW50YXJ5Q29uZmlnLm5laWdoYm91clJ1bGVzW2luZGV4XV07IH1cbiAgICBnZW5lcmF0aW9uKHllYXI/OiBudW1iZXIpIHsgcmV0dXJuIHRoaXMuZ2VuZXJhdGlvbkJ1ZmZlci5nZW5lcmF0aW9uKHllYXIpOyB9XG4gICAgY3VycmVudEdlbmVyYXRpb24oKSB7IHJldHVybiB0aGlzLmdlbmVyYXRpb25CdWZmZXIuY3VycmVudEdlbmVyYXRpb24oKTsgfVxuXG4gICAgY2hhbmdlUnVsZXNldChyZGVjaW1hbDogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IGR0b2IgPSAobjogbnVtYmVyKSA9PiB7IHJldHVybiByZGVjaW1hbCA+PiBuICYgMHgxOyB9XG4gICAgICAgIHRoaXMucnVsZXNldCA9IFtkdG9iKDcpLCBkdG9iKDYpLCBkdG9iKDUpLCBkdG9iKDQpLCBkdG9iKDMpLCBkdG9iKDIpLCBkdG9iKDEpLCBkdG9iKDApXTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxufSIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NvdXJjZS9hcHAudHNcIik7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=