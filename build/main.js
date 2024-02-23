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
    camera: true,
    center: true,
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
        this.lastMouse = { x: 0, y: 0 };
        this.mouse = { x: 0, y: 0 };
        this.cameraSpeed = 10.4;
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
        this.centerAutomataInView(config, offscreenContext);
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
        this.context.drawImage(this.offscreenContext.canvas, 0, 0);
        this.context.translate(this.camera.x, this.camera.y);
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
        if (!config.center) {
            return;
        }
        const panVertical = config.generations < context.canvas.height;
        const translateX = context.canvas.width / 2 - config.width / 2 * config.cellsize;
        const translateY = context.canvas.height / 2 - config.generations / 2;
        context.translate(translateX, panVertical ? translateY - 0.5 : 0);
    }
    registerSystemEvents() {
        const validateBounds = () => {
            const appropriateWidth = this.elementaryconfig.width * this.elementaryconfig.cellsize;
            const appropriateHeight = this.elementaryconfig.generations * this.elementaryconfig.cellsize;
            if (this.camera.x < 0) {
                this.camera.x = 0;
            }
            if (this.camera.y < 0) {
                this.camera.y = 0;
            }
            if (this.camera.x > appropriateWidth) {
                this.camera.x = appropriateWidth;
            }
            if (this.camera.y > appropriateHeight) {
                this.camera.y = appropriateHeight;
            }
        };
        document.addEventListener('mousemove', (e) => this.mouse = { x: e.offsetX, y: e.offsetY });
        document.addEventListener('mousedown', (_) => this.isMouseDown = true);
        document.addEventListener('mouseup', (_) => this.isMouseDown = false);
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() == 'w') {
                this.camera.y -= this.cameraSpeed;
            }
            if (e.key.toLowerCase() == 's') {
                this.camera.y += this.cameraSpeed;
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
        const start = window.performance.now();
        const simplePerformanceMonitor = {
            frameTime: 0, lastTime: 0
        };
        const tick = (delta) => {
            const grid = this.step(this.currentGeneration());
            const nextGeneration = this.generationBuffer.age < this.elementaryConfig.generations - 1;
            if (this.elementaryConfig.camera || nextGeneration) {
                window.requestAnimationFrame(tick);
            }
            if (this.animationStyle === AnimationStyle.Stepwise) {
                onSuccess(grid, this.generationBuffer.age);
            }
            monitorStatistics(delta);
        };
        const monitorStatistics = (delta) => {
            const elapsed = delta - start;
            simplePerformanceMonitor.frameTime += elapsed - simplePerformanceMonitor.lastTime;
            if (simplePerformanceMonitor.frameTime > 1000) {
                console.log(`[Frame] : ${simplePerformanceMonitor.frameTime}`);
                console.log(`[Generations] : ${this.generationBuffer.age}/${this.elementaryConfig.generations}`);
                simplePerformanceMonitor.frameTime = 0;
            }
            simplePerformanceMonitor.lastTime = elapsed;
        };
        window.requestAnimationFrame(tick);
        if (this.animationStyle === AnimationStyle.Direct) {
            onSuccess(this.generationBuffer.buffer, this.elementaryConfig.generations);
        }
    }
    step(currentGeneratingGrid) {
        const year = this.generationBuffer.age + 1;
        for (let gridcell = 1; gridcell < this.elementaryConfig.width - 1; gridcell++) {
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
            throw 'Out of cell range for neighbours() call';
        }
        const r = currentGeneratingGrid[cell + 1 >= this.elementaryConfig.width ? currentGeneratingGrid.at(0) : cell + 1];
        const l = currentGeneratingGrid[cell - 1 <= 0 ? currentGeneratingGrid.at(-1) : cell - 1];
        return 0xf & (r << 2 | currentGeneratingGrid[cell] << 1 | l);
    }
    rule(index) { return this.ruleset[this.elementaryConfig.neighbourRules[index]]; }
    simulationCompleted() { return this.generationBuffer.age >= this.elementaryConfig.generations - 1; }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LENBQUM7UUFFRixRQUFRLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQzNGLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDdkUsUUFBUSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsQ0FBQztRQUV0RSxRQUFRLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUU7WUFDdkMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxJQUFJLEdBQUcsRUFBRTtnQkFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDO2FBQUU7WUFDdEUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxJQUFJLEdBQUcsRUFBRTtnQkFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDO2FBQUU7WUFDdEUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxJQUFJLEdBQUcsRUFBRTtnQkFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDO2FBQUU7WUFDdEUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxJQUFJLEdBQUcsRUFBRTtnQkFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDO2FBQUU7UUFDMUUsQ0FBQyxDQUFD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QUFnQjtRQUMxQixNQUFNLElBQUksR0FBRyxDQUFDLENBQVMsRUFBRSxFQUFFLEdBQUcsT0FBTyxRQUFRLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDM0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4RixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0NBQ0o7QUFoR0QsZ0NBZ0dDOzs7Ozs7Ozs7Ozs7Ozs7OztVQ3hHRDtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7O1VFdEJBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZWxlbWVudGFyeS8uL3NvdXJjZS9hcHAudHMiLCJ3ZWJwYWNrOi8vZWxlbWVudGFyeS8uL3NvdXJjZS9idWZmZXIudHMiLCJ3ZWJwYWNrOi8vZWxlbWVudGFyeS8uL3NvdXJjZS9kaXNwbGF5LnRzIiwid2VicGFjazovL2VsZW1lbnRhcnkvLi9zb3VyY2UvZG9tLnRzIiwid2VicGFjazovL2VsZW1lbnRhcnkvLi9zb3VyY2UvZWxlbWVudGFyeS50cyIsIndlYnBhY2s6Ly9lbGVtZW50YXJ5L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2VsZW1lbnRhcnkvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9lbGVtZW50YXJ5L3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly9lbGVtZW50YXJ5L3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBhc2NpaUNmZyBmcm9tIFwiLi4vZGF0YS9tYWluLmpzb25cIjtcbmltcG9ydCB7IEVsZW1lbnRhcnlEaXNwbGF5IH0gZnJvbSBcIi4vZGlzcGxheVwiO1xuaW1wb3J0IHsgRWxlbWVudGFyeURvbSB9IGZyb20gXCIuL2RvbVwiO1xuaW1wb3J0IHsgRWxlbWVudGFyeSB9IGZyb20gXCIuL2VsZW1lbnRhcnlcIjtcblxuLyoqXG4gKiBXSUtJUEVESUE6XG4gKiBcbiAqIFRoZSBldm9sdXRpb24gb2YgYW4gZWxlbWVudGFyeSBjZWxsdWxhciBhdXRvbWF0b24gY2FuIGNvbXBsZXRlbHkgYmUgZGVzY3JpYmVkIGJ5IGEgdGFibGUgc3BlY2lmeWluZyB0aGUgc3RhdGUgYSBnaXZlbiBjZWxsIHdpbGwgaGF2ZSBpbiB0aGUgbmV4dCBnZW5lcmF0aW9uIGJhc2VkIG9uIHRoZSB2YWx1ZSBvZiB0aGUgY2VsbCB0byBpdHMgbGVmdCxcbiAqIHRoZSB2YWx1ZSBmcm9tIHRoZSBjZWxsIGl0c2VsZiwgYW5kIHRoZSB2YWx1ZSBvZiB0aGUgY2VsbCB0byBpdHMgcmlnaHQuIFxuICogXG4gKiBTaW5jZSB0aGVyZSBhcmUgMsOXMsOXMj0yXjM9OCBwb3NzaWJsZSBiaW5hcnkgc3RhdGVzIGZvciB0aGUgdGhyZWUgY2VsbHMgbmVpZ2hib3JpbmcgYSBnaXZlbiBjZWxsLCB0aGVyZSBhcmUgYSB0b3RhbCBvZiAyXjg9MjU2IGVsZW1lbnRhcnkgY2VsbHVsYXIgYXV0b21hdGEsIGVhY2ggb2Ygd2hpY2ggY2FuIGJlIGluZGV4ZWQgd2l0aCBhbiA4LWJpdCBiaW5hcnkgbnVtYmVyIChXb2xmcmFtIDE5ODMsIDIwMDIpXG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIDI1NiBlbGVtZW50YXJ5IGNlbGx1bGFyIGF1dG9tYXRhIGNhbiBiZSBkZXNjcmliZWQgYnkgYSA4IGJpdCBudW1iZXIuIFxuICogXG4gKiBUaGUgcnVsZSBkZWZpbmluZyB0aGUgY2VsbHVsYXIgYXV0b21hdG9uIG11c3Qgc3BlY2lmeSB0aGUgcmVzdWx0aW5nIHN0YXRlIGZvciBlYWNoIG9mIHRoZXNlIHBvc3NpYmlsaXRpZXMgc28gdGhlcmUgYXJlIDI1NiA9IDJeMl4zIHBvc3NpYmxlIGVsZW1lbnRhcnkgY2VsbHVsYXIgYXV0b21hdGEuIFxuICogU3RlcGhlbiBXb2xmcmFtIHByb3Bvc2VkIGEgc2NoZW1lLCBrbm93biBhcyB0aGUgV29sZnJhbSBjb2RlLCB0byBhc3NpZ24gZWFjaCBydWxlIGEgbnVtYmVyIGZyb20gMCB0byAyNTUgd2hpY2ggaGFzIGJlY29tZSBzdGFuZGFyZC4gRWFjaCBwb3NzaWJsZSBjdXJyZW50IGNvbmZpZ3VyYXRpb24gaXMgd3JpdHRlbiBpbiBvcmRlciwgMTExLCAxMTAsIC4uLiwgMDAxLCAwMDAsIFxuICogYW5kIHRoZSByZXN1bHRpbmcgc3RhdGUgZm9yIGVhY2ggb2YgdGhlc2UgY29uZmlndXJhdGlvbnMgaXMgd3JpdHRlbiBpbiB0aGUgc2FtZSBvcmRlciBhbmQgaW50ZXJwcmV0ZWQgYXMgdGhlIGJpbmFyeSByZXByZXNlbnRhdGlvbiBvZiBhbiBpbnRlZ2VyLiBcbiAqIFxuICogVGhpcyBudW1iZXIgaXMgdGFrZW4gdG8gYmUgdGhlIHJ1bGUgbnVtYmVyIG9mIHRoZSBhdXRvbWF0b24uIEZvciBleGFtcGxlLCAxMTBkPTAxMTAxMTEwMi4gU28gcnVsZSAxMTAgaXMgZGVmaW5lZCBieSB0aGUgdHJhbnNpdGlvbiBydWxlOlxuICogXG4gKiAxMTFcdDExMFx0MTAxXHQxMDBcdDAxMVx0MDEwXHQwMDFcdDAwMFx0Y3VycmVudCBwYXR0ZXJuXHRQPShMLEMsUilcbiAqICAwXHQxXHQxXHQwXHQxXHQxXHQxXHQwXHRuZXcgc3RhdGUgZm9yIGNlbnRlciBjZWxsXHROMTEwZD0oQytSK0MqUitMKkMqUiklMlxuICovXG5cbmV4cG9ydCBjbGFzcyBFbGVtZW50YXJ5Q29uZmlnIHtcbiAgICByZWFkb25seSBuZWlnaGJvdXJSdWxlczogQXJyYXk8bnVtYmVyPjsgLy8gVGhpcyBpcyB0aGUgOCBwb3NzaWJsZSBzdGF0ZXMgYSBjZWxsIGNhbiB0YWtlIGZyb20gaXRzIHRocmVlIG5laWdoYm91cnMsIGtlZXAgdGhlbSBpbiBhIGltbXV0YWJsZSBsYWRkZXIgdG8gYmUgdXNlZCBmb3IgcnVsZSBpbmRleGluZyBsYXRlclxuXG4gICAgY29udGFpbmVyOiBzdHJpbmc7ICAgICAgLy8gTWFya2VyIGVsZW1lbnQgd2hlcmUgRWxlbWVudGFyeSB3aWxsIGdlbmVyYXRlIGl0J3MgdmlldyAocHJvbXB0IGFuZCBjYW52YXMpXG4gICAgZ2VuZXJhdGlvbnM6IG51bWJlcjsgICAgLy8gQW1vdW50IG9mIGdlbmVyYXRpb25zIHRvIHNpbXVsYXRlXG4gICAgd2lkdGg6IG51bWJlcjsgICAgICAgICAgLy8gR3JpZCB3aWR0aCBcbiAgICBcbiAgICBjZW50ZXI6IGJvb2xlYW47ICAgICAgICAvLyBJZiB0cnVlIC0gQ2VudGVyIHRoZSBhdXRvbWF0YSBpbiB0aGUgd2luZG93XG4gICAgcmF0aW86IGJvb2xlYW47ICAgICAgICAgLy8gSWYgdHJ1ZSAtIENhbGN1bGF0ZSBjZWxsc2l6ZSB0byBmaWxsIHdpbmRvdyB3aWR0aFxuICAgIGNhbWVyYTogYm9vbGVhbjsgICAgICAgIC8vIElmIHRydWUgLSBBbGxvd3MgdGhlIHZpZXcgdG8gYmUgcGFubmVkIGZyZWVseSB3aXRoIGtleWJvYXJkIG9yIG1vdXNlXG5cbiAgICBjZWxsc2l6ZTogbnVtYmVyOyAgICAgICAvLyBUaGlzIGlzIHRoZSBzaXplIG9mIGEgc2luZ2xlIGNlbGxcbiAgICBjZWxsY29sb3JPZmY6IHN0cmluZzsgICAvLyBjb2xvciBmb3Igc3RhdGUgb2ZmIC0gdGhpcyBzaG91bGQgYmUgYSBjb2xvciB2YWxpZCBpbiBDU1MgKGV4ICdyZ2IoMTMyLCAyMDgsIDIxMiknKVxuICAgIGNlbGxjb2xvck9uOiBzdHJpbmc7ICAgIC8vIGNvbG9yIGZvciBzdGF0ZSBvbiAtIHRoaXMgc2hvdWxkIGJlIGEgY29sb3IgdmFsaWQgaW4gQ1NTIChleCAncmdiKDg3LCA5MSwgMTA3KScpXG59O1xuXG5leHBvcnQgY29uc3QgZWxlbWVudGFyeUNvbmZpZzogRWxlbWVudGFyeUNvbmZpZyA9IHtcbiAgICBuZWlnaGJvdXJSdWxlczogWzcsIDYsIDUsIDQsIDMsIDIsIDEsIDBdLFxuXG4gICAgZ2VuZXJhdGlvbnM6IDEwMDAsXG4gICAgd2lkdGg6IDEwMDAsXG4gICAgY2VsbHNpemU6IDEsXG4gICAgXG4gICAgY2FtZXJhOiB0cnVlLFxuICAgIGNlbnRlcjogdHJ1ZSxcbiAgICByYXRpbzogZmFsc2UsXG5cbiAgICBjb250YWluZXI6ICcjZWxlbWVudGFyeS1jb250YWluZXInLFxuICAgIGNlbGxjb2xvck9mZjogJyM4NGQwZDQnLFxuICAgIGNlbGxjb2xvck9uOiAnIzM3NGI1YicsXG59O1xuXG5kZWNsYXJlIHR5cGUgQVNDSUlTcGxhc2hJdGVtID0geyBlbmRpbmc6IHN0cmluZzsgY29sb3I6IHN0cmluZzsgYXJ0OiBzdHJpbmc7IH07XG5kZWNsYXJlIHR5cGUgQVNDSUlEYXRhID0gUGFydGlhbDx7IGVudHJ5QXNjaWk6IEFTQ0lJU3BsYXNoSXRlbSB9PlxuXG5jbGFzcyBTaW1wbGVBU0NJSVNwbGFzaGVyIHtcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGFzY2lpOiBBU0NJSVNwbGFzaEl0ZW0pIHsgcmV0dXJuIHRoaXM7IH1cbiAgICBzcGxhc2goKSB7IGNvbnNvbGUuaW5mbyh0aGlzLmFzY2lpLmFydCwgdGhpcy5hc2NpaS5jb2xvciwgdGhpcy5hc2NpaS5lbmRpbmcpOyB9XG59XG5cbi8vIFRPRE86IFJhbmRvbSBzZWVkcywgVUkgYW5kIHBpeGVsIHBlcmZlY3QgcmVuZGVyaW5nIHdpdGggc2Nyb2xsXG5cbmV4cG9ydCBjbGFzcyBFbGVtZW50YXJ5QXBwIHtcbiAgICBwcml2YXRlIGVsZW1lbnRhcnlEb206IEVsZW1lbnRhcnlEb20gPSBuZXcgRWxlbWVudGFyeURvbSgpO1xuICAgIHByaXZhdGUgZGlzcGxheTogRWxlbWVudGFyeURpc3BsYXkgPSBuZXcgRWxlbWVudGFyeURpc3BsYXkoKTtcbiAgICBwcml2YXRlIGNvbmZpZzogRWxlbWVudGFyeUNvbmZpZyA9IGVsZW1lbnRhcnlDb25maWc7XG5cbiAgICAvKiogXG4gICAgICogVGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIHN1cHBseSBhIHVzZXIgY29uZmlnLiBcbiAgICAgKiBJZiBubyBjb25maWcgaXMgc3BlY2lmaWVkIHRoZSBkZWZhdWx0IHdpbGwgYmUgdXNlZCBcbiAgICAgKiAqL1xuICAgIHdpdGhDb25maWcoY29uZmlnOiBFbGVtZW50YXJ5Q29uZmlnKSB7XG4gICAgICAgIGlmICghY29uZmlnICYmICFlbGVtZW50YXJ5Q29uZmlnKSB7XG4gICAgICAgICAgICB0aHJvdyBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9IC0gQSBkZWZhdWx0IG9yIHVzZXIgY29uZmlnIG11c3QgYmUgcHJlc2VudGA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb25maWcgPSBjb25maWcgfHwgZWxlbWVudGFyeUNvbmZpZztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIC8qKiBcbiAgICAgKiBEaXNwbGF5IGEgJ01PVEQnIHN0eWxlIG1lc3NhZ2UgaW4gdGhlIGJyb3dzZXIgY29uc29sZS4gXG4gICAgICogVGhlIGFydCBpcyBkZWZpbmVkIGluIGRhdGEvbWFpbi5qc29uLiBcbiAgICAgKiAqL1xuICAgIHdpdGhTcGxhc2goYXNjaWk6IEFTQ0lJU3BsYXNoSXRlbSkge1xuICAgICAgICBpZiAoIWFzY2lpIHx8ICFhc2NpaS5hcnQpIHtcbiAgICAgICAgICAgIHRocm93IGAke3RoaXMuY29uc3RydWN0b3IubmFtZX0gLSBDb3VsZCBub3QgZmluZCBzcGxhc2ggIGRhdGFgO1xuICAgICAgICB9XG4gICAgICAgIG5ldyBTaW1wbGVBU0NJSVNwbGFzaGVyKGFzY2lpKS5zcGxhc2goKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcnVuKCkge1xuICAgICAgICBjb25zdCBkZWZhdWx0Q29uZmlnID0gdGhpcy5jb25maWcgfHwgZWxlbWVudGFyeUNvbmZpZztcbiAgICAgICAgY29uc3QgZWxlbWVudGFyeSA9IG5ldyBFbGVtZW50YXJ5KCkuYm9vdHN0cmFwQXBwbGljYXRpb24oZGVmYXVsdENvbmZpZyk7XG5cbiAgICAgICAgdGhpcy5lbGVtZW50YXJ5RG9tLnJlbmRlclNlbGVjdGlvblByb21wdHMoKHJ1bGUpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheS5pbml0KGRlZmF1bHRDb25maWcpO1xuICAgICAgICAgICAgZWxlbWVudGFyeS5jaGFuZ2VSdWxlc2V0KHJ1bGUpLmFuaW1hdGUoKGdlbmVyYXRpb25zLCB5ZWFyKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5LnJlbmRlcihnZW5lcmF0aW9ucywgeWVhcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG4vLyBBUEkgLSBob3cgdG8gcnVuIGV4YW1wbGVcbm5ldyBFbGVtZW50YXJ5QXBwKCkud2l0aFNwbGFzaCgoPEFTQ0lJRGF0YT5hc2NpaUNmZykuZW50cnlBc2NpaSlcbiAgICAud2l0aENvbmZpZyhlbGVtZW50YXJ5Q29uZmlnKS5ydW4oKTsiLCIvKipcclxuICogIEVsZW1lbnRhcnlCdWZmZXIgaXMgdGhlIGludGVybmFsIGRhdGEgc3RydWN0dXJlIHRoYXQgaG9sZHMgdGhlIGJpdC1ncmlkIG1ha2luZyB1cCB0aGUgYXV0b21hdGEuXHJcbiAqICAnMScgbWVhbnMgcmVuZGVyIGFuZCB0cmVhdCBhcyBhIG5laWdoYm91ciwgJzAnIG1lYW5zIHRvIGlnbm9yZVxyXG4gKi9cclxuXHJcbmV4cG9ydCBkZWNsYXJlIHR5cGUgRWxlbWVudGFyeUJpbmFyeU51bWJlciA9IDAgfCAxO1xyXG5cclxuZXhwb3J0IGNsYXNzIEVsZW1lbnRhcnlCdWZmZXIge1xyXG4gICAgcHVibGljIHJlYWRvbmx5IGludGVybmFsQnVmZmVyOiBVaW50OEFycmF5ID0gdW5kZWZpbmVkO1xyXG4gICAgcHJpdmF0ZSBoaWdoZXN0R2VuZXJhdGlvbkluZGV4OiBudW1iZXIgPSAwO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgd2lkdGg6IG51bWJlciwgcHJpdmF0ZSByZWFkb25seSBnZW5lcmF0aW9uczogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5pbnRlcm5hbEJ1ZmZlciA9IHRoaXMuaW50ZXJuYWxDcmVhdGVCdWZmZXIodGhpcy5nZW5lcmF0aW9ucywgdGhpcy53aWR0aCk7XHJcbiAgICAgICAgaWYgKCF0aGlzLmludGVybmFsQnVmZmVyIHx8IHRoaXMuaW50ZXJuYWxCdWZmZXIuYnVmZmVyLmJ5dGVMZW5ndGggPCB0aGlzLnNpemUpIHtcclxuICAgICAgICAgICAgdGhyb3cgYCR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfSAtIEZhaWxlZCB0byBjcmVhdGUgYnVmZmVyIHdpdGggc2l6ZSAke3RoaXMuc2l6ZX1gO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5pbnRlcm5hbEJ1ZmZlci5maWxsKDAsIDAsIHRoaXMuc2l6ZSk7IC8vIFNlZWQgZmlyc3QgZ2VuZXJhdGlvblxyXG4gICAgICAgIHRoaXMuaW50ZXJuYWxCdWZmZXIuZmlsbCgxLCB0aGlzLndpZHRoIC8gMiwgdGhpcy53aWR0aCAvIDIgKyAxKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgYWdlKCkgeyByZXR1cm4gdGhpcy5oaWdoZXN0R2VuZXJhdGlvbkluZGV4OyB9IC8vIEFtb3VudCBvZiB5ZWFycyBwcm9jZXNzZWQgc28gZmFyIFxyXG4gICAgZ2V0IHNpemUoKSB7IHJldHVybiB0aGlzLmdlbmVyYXRpb25zICogdGhpcy53aWR0aDsgfVxyXG4gICAgZ2V0IGJ1ZmZlcigpIHsgcmV0dXJuIHRoaXMuaW50ZXJuYWxCdWZmZXI7IH1cclxuXHJcbiAgICBwdWJsaWMgY3VycmVudEdlbmVyYXRpb24oKTogVWludDhBcnJheSB7IHJldHVybiB0aGlzLmdlbmVyYXRpb24odGhpcy5oaWdoZXN0R2VuZXJhdGlvbkluZGV4KTsgfVxyXG4gICAgcHVibGljIGdlbmVyYXRpb24oeWVhcjogbnVtYmVyKTogVWludDhBcnJheSB7IHJldHVybiB0aGlzLmludGVybmFsQnVmZmVyLnN1YmFycmF5KHRoaXMud2lkdGggKiB5ZWFyLCB0aGlzLndpZHRoICogeWVhciArIHRoaXMud2lkdGgpOyB9XHJcbiAgICBwdWJsaWMgdG9nZ2xlKHllYXI6IG51bWJlciwgY29sOiBudW1iZXIpIHsgdGhpcy5pbnRlcm5hbEVsZW1lbnRTZXQoeWVhciwgY29sLCB0aGlzLmludGVybmFsRWxlbWVudEF0KHllYXIsIGNvbCkgPyAwIDogMSk7IH1cclxuICAgIHB1YmxpYyBzZXQoeWVhcjogbnVtYmVyLCBjb2w6IG51bWJlciwgdmFsdWU6IG51bWJlcikgeyB0aGlzLmludGVybmFsRWxlbWVudFNldCh5ZWFyLCBjb2wsIHZhbHVlKTsgfVxyXG4gICAgcHVibGljIHJlYWQoeWVhcjogbnVtYmVyLCBjb2w6IG51bWJlcikgeyByZXR1cm4gdGhpcy5pbnRlcm5hbEVsZW1lbnRBdCh5ZWFyLCBjb2wpOyB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbnRlcm5hbEVsZW1lbnRTZXQocm93OiBudW1iZXIsIGNvbDogbnVtYmVyLCBmbGFnOiBudW1iZXIpIHtcclxuICAgICAgICBjb25zdCBiaW5hcnlOdW1iZXIgPSBmbGFnIGFzIEVsZW1lbnRhcnlCaW5hcnlOdW1iZXI7XHJcbiAgICAgICAgY29uc3QgZmxhdEluZGV4ID0gcm93ICogdGhpcy53aWR0aCArIGNvbDtcclxuXHJcbiAgICAgICAgaWYgKGZsYXRJbmRleCA8IDAgfHwgZmxhdEluZGV4ID4gdGhpcy5zaXplKSB7IHRocm93IGAke3RoaXMuY29uc3RydWN0b3IubmFtZX0gLSBBcmd1bWVudCBvdXQgb2YgYm91bmRzICR7cm93fSwgJHtjb2x9YDsgfVxyXG4gICAgICAgIGlmIChiaW5hcnlOdW1iZXIgIT0gMSAmJiBiaW5hcnlOdW1iZXIgIT0gMCkgeyB0aHJvdyBgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9IC0gRmxhZyBpcyBub3QgaW4gYSBjb3JyZWN0IGZvcm0uIFNob3VsZCBiZSBhIGJpdCAoMCBvciAxKSBgOyB9XHJcblxyXG4gICAgICAgIHRoaXMuYnVmZmVyW2ZsYXRJbmRleF0gPSBmbGFnO1xyXG4gICAgICAgIGlmIChyb3cgPiB0aGlzLmhpZ2hlc3RHZW5lcmF0aW9uSW5kZXgpIHtcclxuICAgICAgICAgICAgdGhpcy5oaWdoZXN0R2VuZXJhdGlvbkluZGV4ID0gcm93O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGludGVybmFsRWxlbWVudEF0KHJvdzogbnVtYmVyLCBjb2w6IG51bWJlcikge1xyXG4gICAgICAgIGNvbnN0IGZsYXRJbmRleCA9IHJvdyAqIHRoaXMud2lkdGggKyBjb2w7XHJcbiAgICAgICAgaWYgKGZsYXRJbmRleCA8IDAgfHwgZmxhdEluZGV4ID4gdGhpcy5zaXplKSB7XHJcbiAgICAgICAgICAgIHRocm93IGAke3RoaXMuY29uc3RydWN0b3IubmFtZX0gLSBBcmd1bWVudCBvdXQgb2YgYm91bmRzICR7cm93fSwgJHtjb2x9YDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYnVmZmVyW2ZsYXRJbmRleF07XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbnRlcm5hbENyZWF0ZUJ1ZmZlcihyb3dzOiBudW1iZXIsIGNvbHM6IG51bWJlcikge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmICghcm93cyB8fCAhY29scyB8fCByb3dzIDw9IDAgfHwgY29scyA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBFcnJvcihgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9IC0gSW52YWxpZCByb3cgYW5kIGNvbCBkYXRhYCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKHJvd3MgKiBjb2xzKTtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGJ1ZmZlciwgMCwgcm93cyAqIGNvbHMpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgdGhyb3cgYCR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfSAtICR7ZX1gO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsImltcG9ydCB7IEVsZW1lbnRhcnlDb25maWcgfSBmcm9tIFwiLi9hcHBcIjtcblxuZGVjbGFyZSB0eXBlIENhbWVyYSA9IHsgeDogbnVtYmVyLCB5OiBudW1iZXI7IH1cblxuZXhwb3J0IGNsYXNzIEVsZW1lbnRhcnlEaXNwbGF5IHtcbiAgICBwcml2YXRlIGVsZW1lbnRhcnljb25maWc6IEVsZW1lbnRhcnlDb25maWc7XG4gICAgcHVibGljIG9mZnNjcmVlbkNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcbiAgICBwdWJsaWMgY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xuICAgIHB1YmxpYyBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50O1xuXG4gICAgcHJpdmF0ZSBpc01vdXNlRG93bjogYm9vbGVhbiA9IGZhbHNlO1xuICAgIHByaXZhdGUgbGFzdE1vdXNlOiBDYW1lcmEgPSB7IHg6IDAsIHk6IDAgfTtcbiAgICBwcml2YXRlIG1vdXNlOiBDYW1lcmEgPSB7IHg6IDAsIHk6IDAgfTtcblxuICAgIHByaXZhdGUgY2FtZXJhU3BlZWQ6IG51bWJlciA9IDEwLjQ7XG4gICAgcHJpdmF0ZSBjYW1lcmE6IENhbWVyYSA9IHsgeDogMCwgeTogMCB9XG5cbiAgICBwdWJsaWMgaW5pdChjb25maWc6IEVsZW1lbnRhcnlDb25maWcsIGNvbnRhaW5lcj86IHN0cmluZywgaWQ/OiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKCFjb250YWluZXIpIHsgY29udGFpbmVyID0gJ2dhbWUtdmlldyc7IH1cbiAgICAgICAgaWYgKCFpZCkgeyBpZCA9ICdnYW1lLWNhbnZhcyc7IH1cblxuICAgICAgICBjb25zdCBbY2FudmFzLCBjb250ZXh0LCBvZmZzY3JlZW5Db250ZXh0XSA9IHRoaXMuaW5pdEhEUElDYW52YXNFbGVtZW50KGNvbmZpZywgY29udGFpbmVyLCBpZCk7XG4gICAgICAgIHRoaXMuY2VudGVyQXV0b21hdGFJblZpZXcoY29uZmlnLCBvZmZzY3JlZW5Db250ZXh0KTtcbiAgICAgICAgdGhpcy5yZWdpc3RlclN5c3RlbUV2ZW50cygpO1xuXG4gICAgICAgIHRoaXMub2Zmc2NyZWVuQ29udGV4dCA9IG9mZnNjcmVlbkNvbnRleHQ7XG4gICAgICAgIHRoaXMuZWxlbWVudGFyeWNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgICAgICAgdGhpcy5jYW52YXMgPSBjYW52YXM7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbmRlcihnZW5lcmF0aW9uczogVWludDhBcnJheSwgeWVhcjogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5lbGVtZW50YXJ5Y29uZmlnKSB7IHRocm93ICdFbGVtbnRhcnlDb25maWcgaGFzIHRvIGJlIHNldCBpZiB0aGUgZ3JpZCBzaG91bGQgYmUgY2FudmFzIHJlbmRlcmVkJzsgfVxuICAgICAgICBpZiAoIWdlbmVyYXRpb25zKSB7IHRocm93ICdJbGxlZ2FsIHN0YXRlIC0gRGlzcGxheSBncmlkIGlzIHVuZGVmaW5lZCc7IH1cblxuICAgICAgICBjb25zdCBjb25maWdzaXplID0gdGhpcy5lbGVtZW50YXJ5Y29uZmlnLmNlbGxzaXplO1xuICAgICAgICBjb25zdCBncmlkaGVpZ2h0ID0gdGhpcy5lbGVtZW50YXJ5Y29uZmlnLmdlbmVyYXRpb25zO1xuICAgICAgICBjb25zdCBncmlkd2lkdGggPSB0aGlzLmVsZW1lbnRhcnljb25maWcud2lkdGg7XG4gICAgICAgIGNvbnN0IHJhdGlvID0gdGhpcy5lbGVtZW50YXJ5Y29uZmlnLnJhdGlvO1xuXG4gICAgICAgIGxldCBjZWxsdyA9IHJhdGlvID8gdGhpcy5jYW52YXMud2lkdGggKiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyAvIGdyaWR3aWR0aCA6IGNvbmZpZ3NpemU7XG4gICAgICAgIGxldCBjZWxsaCA9IHJhdGlvID8gdGhpcy5jYW52YXMuaGVpZ2h0ICogd2luZG93LmRldmljZVBpeGVsUmF0aW8gLyBncmlkaGVpZ2h0IDogY29uZmlnc2l6ZTtcblxuICAgICAgICBnZW5lcmF0aW9ucy5mb3JFYWNoKChjZWxsLCBncmlkY2VsbCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5vZmZzY3JlZW5Db250ZXh0LmZpbGxTdHlsZSA9IGNlbGwgPyB0aGlzLmVsZW1lbnRhcnljb25maWcuY2VsbGNvbG9yT24gOiB0aGlzLmVsZW1lbnRhcnljb25maWcuY2VsbGNvbG9yT2ZmO1xuICAgICAgICAgICAgdGhpcy5vZmZzY3JlZW5Db250ZXh0LmZpbGxSZWN0KGdyaWRjZWxsICogY2VsbHcsIHllYXIgKiBjZWxsaCwgY2VsbHcsIGNlbGxoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5jb250ZXh0LmNsZWFyUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgdGhpcy5jb250ZXh0LmRyYXdJbWFnZSh0aGlzLm9mZnNjcmVlbkNvbnRleHQuY2FudmFzLCAwLCAwKTtcbiAgICAgICAgdGhpcy5jb250ZXh0LnRyYW5zbGF0ZSh0aGlzLmNhbWVyYS54LCB0aGlzLmNhbWVyYS55KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGluaXRIRFBJQ2FudmFzRWxlbWVudChjb25maWc6IEVsZW1lbnRhcnlDb25maWcsIGNvbnRhaW5lcjogc3RyaW5nLCBpZDogc3RyaW5nID0gdW5kZWZpbmVkKTogW0hUTUxDYW52YXNFbGVtZW50LCBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRF0ge1xuICAgICAgICBjb25zdCBjYW52YXNjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChjb250YWluZXIpO1xuICAgICAgICBjb25zdCBbXywgb2Zmc2NyZWVuQ29udGV4dF0gPSB0aGlzLmNyZWF0ZUhEUElDYW52YXNFbGVtZW50KGNvbmZpZywgY2FudmFzY29udGFpbmVyKTtcbiAgICAgICAgY29uc3QgW2NhbnZhcywgY29udGV4dF0gPSB0aGlzLmNyZWF0ZUhEUElDYW52YXNFbGVtZW50KGNvbmZpZywgY2FudmFzY29udGFpbmVyKTtcblxuICAgICAgICBpZiAoaWQpIHsgY2FudmFzLmlkID0gaWQ7IH1cbiAgICAgICAgY2FudmFzY29udGFpbmVyLmFwcGVuZENoaWxkKGNhbnZhcyk7XG4gICAgICAgIHJldHVybiBbY2FudmFzLCBjb250ZXh0LCBvZmZzY3JlZW5Db250ZXh0XTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZUhEUElDYW52YXNFbGVtZW50KGNvbmZpZzogRWxlbWVudGFyeUNvbmZpZywgY29udGFpbmVyPzogSFRNTEVsZW1lbnQpOiBbSFRNTENhbnZhc0VsZW1lbnQsIENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRF0ge1xuICAgICAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKSBhcyBIVE1MQ2FudmFzRWxlbWVudDtcbiAgICAgICAgY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAgICAgY29uc3QgZGV2aWNlcGl4ZWxyYXRpbyA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDE7XG4gICAgICAgIGxldCB7IHdpZHRoLCBoZWlnaHQgfSA9IGNvbnRhaW5lcj8uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgaWYgKCF3aWR0aCB8fCAhaGVpZ2h0KSB7XG4gICAgICAgICAgICB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgICAgICAgICAgaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICAgICAgICB9XG5cbiAgICAgICAgY2FudmFzLndpZHRoID0gd2lkdGggKiBkZXZpY2VwaXhlbHJhdGlvO1xuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0ICogZGV2aWNlcGl4ZWxyYXRpbztcbiAgICAgICAgY2FudmFzLnN0eWxlLndpZHRoID0gYCR7d2lkdGggKiBkZXZpY2VwaXhlbHJhdGlvfXB4YDtcbiAgICAgICAgY2FudmFzLnN0eWxlLmhlaWdodCA9IGAke2hlaWdodCAqIGRldmljZXBpeGVscmF0aW99cHhgO1xuXG4gICAgICAgIGN0eC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgY2FudmFzLnN0eWxlLmltYWdlUmVuZGVyaW5nID0gJ3BpeGVsYXRlZCc7XG4gICAgICAgIGNhbnZhcy5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBjb25maWcuY2VsbGNvbG9yT2ZmO1xuICAgICAgICByZXR1cm4gW2NhbnZhcywgY3R4XTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNlbnRlckF1dG9tYXRhSW5WaWV3KGNvbmZpZzogRWxlbWVudGFyeUNvbmZpZywgY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKTogdm9pZCB7XG4gICAgICAgIGlmICghY29uZmlnLmNlbnRlcikgeyByZXR1cm47IH1cblxuICAgICAgICBjb25zdCBwYW5WZXJ0aWNhbCA9IGNvbmZpZy5nZW5lcmF0aW9ucyA8IGNvbnRleHQuY2FudmFzLmhlaWdodDtcbiAgICAgICAgY29uc3QgdHJhbnNsYXRlWCA9IGNvbnRleHQuY2FudmFzLndpZHRoIC8gMiAtIGNvbmZpZy53aWR0aCAvIDIgKiBjb25maWcuY2VsbHNpemU7XG4gICAgICAgIGNvbnN0IHRyYW5zbGF0ZVkgPSBjb250ZXh0LmNhbnZhcy5oZWlnaHQgLyAyIC0gY29uZmlnLmdlbmVyYXRpb25zIC8gMjtcbiAgICAgICAgY29udGV4dC50cmFuc2xhdGUodHJhbnNsYXRlWCwgcGFuVmVydGljYWwgPyB0cmFuc2xhdGVZIC0wLjUgOiAwKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlZ2lzdGVyU3lzdGVtRXZlbnRzKCk6IHZvaWQge1xuICAgICAgICBjb25zdCB2YWxpZGF0ZUJvdW5kcyA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFwcHJvcHJpYXRlV2lkdGggPSB0aGlzLmVsZW1lbnRhcnljb25maWcud2lkdGggKiB0aGlzLmVsZW1lbnRhcnljb25maWcuY2VsbHNpemU7XG4gICAgICAgICAgICBjb25zdCBhcHByb3ByaWF0ZUhlaWdodCA9IHRoaXMuZWxlbWVudGFyeWNvbmZpZy5nZW5lcmF0aW9ucyAqIHRoaXMuZWxlbWVudGFyeWNvbmZpZy5jZWxsc2l6ZTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuY2FtZXJhLnggPCAwKSB7IHRoaXMuY2FtZXJhLnggPSAwOyB9XG4gICAgICAgICAgICBpZiAodGhpcy5jYW1lcmEueSA8IDApIHsgdGhpcy5jYW1lcmEueSA9IDA7IH1cblxuICAgICAgICAgICAgaWYgKHRoaXMuY2FtZXJhLnggPiBhcHByb3ByaWF0ZVdpZHRoKSB7IHRoaXMuY2FtZXJhLnggPSBhcHByb3ByaWF0ZVdpZHRoOyB9XG4gICAgICAgICAgICBpZiAodGhpcy5jYW1lcmEueSA+IGFwcHJvcHJpYXRlSGVpZ2h0KSB7IHRoaXMuY2FtZXJhLnkgPSBhcHByb3ByaWF0ZUhlaWdodDsgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIChlKSA9PiB0aGlzLm1vdXNlID0geyB4OiBlLm9mZnNldFgsIHk6IGUub2Zmc2V0WSB9KTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgKF8pID0+IHRoaXMuaXNNb3VzZURvd24gPSB0cnVlKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIChfKSA9PiB0aGlzLmlzTW91c2VEb3duID0gZmFsc2UpO1xuXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGUua2V5LnRvTG93ZXJDYXNlKCkgPT0gJ3cnKSB7IHRoaXMuY2FtZXJhLnkgLT0gdGhpcy5jYW1lcmFTcGVlZDsgfVxuICAgICAgICAgICAgaWYgKGUua2V5LnRvTG93ZXJDYXNlKCkgPT0gJ3MnKSB7IHRoaXMuY2FtZXJhLnkgKz0gdGhpcy5jYW1lcmFTcGVlZDsgfVxuICAgICAgICAgICAgaWYgKGUua2V5LnRvTG93ZXJDYXNlKCkgPT0gJ2EnKSB7IHRoaXMuY2FtZXJhLnggLT0gdGhpcy5jYW1lcmFTcGVlZDsgfVxuICAgICAgICAgICAgaWYgKGUua2V5LnRvTG93ZXJDYXNlKCkgPT0gJ2QnKSB7IHRoaXMuY2FtZXJhLnggKz0gdGhpcy5jYW1lcmFTcGVlZDsgfVxuICAgICAgICB9KTtcbiAgICB9XG59IiwiZGVjbGFyZSB0eXBlIEVsZW1lbnRhcnlFbGVtZW50ID0ge1xuICAgIGNvbnRleHQ6IERvY3VtZW50RnJhZ21lbnQgfCBIVE1MRWxlbWVudCxcbiAgICBlbGVtZW50OiBIVE1MRWxlbWVudCxcblxuICAgIGJ5SWQ6IChzZWxlY3Rvcjogc3RyaW5nKSA9PiBFbGVtZW50YXJ5RWxlbWVudCxcbiAgICBieUNsYXNzOiAoc2VsZWN0b3I6IHN0cmluZykgPT4gRWxlbWVudGFyeUVsZW1lbnQsXG4gICAgd2l0aDogKGNvbnRleHQ6IERvY3VtZW50RnJhZ21lbnQgfCBIVE1MRWxlbWVudCkgPT4gRWxlbWVudGFyeUVsZW1lbnQsXG5cbiAgICBjc3M6ICguLi50b2tlbnM6IHN0cmluZ1tdKSA9PiBFbGVtZW50YXJ5RWxlbWVudCxcbiAgICBhdHRyOiAoYXR0cnM6IGFueSkgPT4gRWxlbWVudGFyeUVsZW1lbnQsXG4gICAgdGV4dDogKHRleHQ6IHN0cmluZykgPT4gRWxlbWVudGFyeUVsZW1lbnQsXG4gICAgbWFrZTogKHRhZzogc3RyaW5nKSA9PiBFbGVtZW50YXJ5RWxlbWVudCxcbiAgICBfc2VsZjogKGNvbnRleHQ6ICgpID0+IGFueSkgPT4gRWxlbWVudGFyeUVsZW1lbnQsXG59XG5cbmV4cG9ydCBjbGFzcyBFbGVtZW50YXJ5RG9tIHtcbiAgICByZW5kZXJTZWxlY3Rpb25Qcm9tcHRzKHNlbGVjdGlvbjogKHY6IG51bWJlcikgPT4gdm9pZCkge1xuICAgICAgICBjb25zdCBzZWxlY3Rpb25Db250YWluZXIgPSBlbGVtZW50YXJ5RWxlbWVudEZhY3Rvcnkud2l0aChkb2N1bWVudCkuYnlJZCgnc2VsZWN0aW9uLXZpZXcnKS5lbGVtZW50O1xuICAgICAgICBjb25zdCBnYW1lQ29udGFpbmVyID0gZWxlbWVudGFyeUVsZW1lbnRGYWN0b3J5LndpdGgoZG9jdW1lbnQpLmJ5SWQoJ2dhbWUtdmlldycpLmVsZW1lbnQ7XG4gICAgICAgIGlmICghc2VsZWN0aW9uQ29udGFpbmVyKSB7IHRocm93ICdGYWlsZWQgdG8gbG9hZCBzZWxlY3Rpb24gc2VsZWN0aW9uQ29udGFpbmVyIC0gdGhpcyBpcyBhIGZhdGFsIGVycm9yJzsgfVxuXG4gICAgICAgIGNvbnN0IGZyYWdtZW50Um9vdCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICAgICAgY29uc3QgW2NvbnRhaW5lciwgaW5wdXQsIHN1Ym1pdCwgbm90aWZpZXJdID0gdGhpcy5idWlsZEVsZW1lbnRzKGZyYWdtZW50Um9vdCk7XG5cbiAgICAgICAgaWYgKHNlbGVjdGlvbikge1xuICAgICAgICAgICAgc3VibWl0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJ1bGUgPSBwYXJzZUludCgoaW5wdXQgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWUpO1xuICAgICAgICAgICAgICAgIGlmIChydWxlID49IDAgJiYgcnVsZSA8IE1hdGgucG93KDIsIDgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGdhbWVDb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZSgnZGlzcGxheS1ub25lJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdkaXNwbGF5LW5vbmUnKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGVjdGlvbihydWxlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBFbHNlIHdlIGhhdmUgYSBlcnJvciwgc28gZGlzcGxheSBub3RpZmllclxuICAgICAgICAgICAgICAgIG5vdGlmaWVyLmNsYXNzTGlzdC50b2dnbGUoJ2Rpc3BsYXktbm9uZScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgc2VsZWN0aW9uQ29udGFpbmVyLmFwcGVuZChmcmFnbWVudFJvb3QpO1xuICAgIH1cblxuICAgIGJ1aWxkRWxlbWVudHMoY29udGV4dDogRG9jdW1lbnRGcmFnbWVudCkgOiBIVE1MRWxlbWVudFtdIHtcbiAgICAgICAgY29uc3QgcnVsZUlucHV0Q29udGFpbmVyID0gZWxlbWVudGFyeUVsZW1lbnRGYWN0b3J5LndpdGgoY29udGV4dCkubWFrZSgnZGl2JykuY3NzKCdydWxlLWNhcmQnLCAncHQtbm9ybWFsJykuZWxlbWVudDtcbiAgICAgICAgY29uc3QgaW5wdXRQcm9tcHQgPSBlbGVtZW50YXJ5RWxlbWVudEZhY3Rvcnkud2l0aChydWxlSW5wdXRDb250YWluZXIpLm1ha2UoJ2lucHV0JykuYXR0cih7ICd0eXBlJzogJ3RleHQnIH0pLmNzcygncnVsZS1pbnB1dCcpLmVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IHN1Ym1pdEJ1dHRvbiA9IGVsZW1lbnRhcnlFbGVtZW50RmFjdG9yeS53aXRoKHJ1bGVJbnB1dENvbnRhaW5lcikubWFrZSgnYnV0dG9uJykuYXR0cih7ICd0eXBlJzogJ2J1dHRvbicgfSkuY3NzKCdydWxlLWJ0bicpLnRleHQoJ0dvIScpLmVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IG5vdGlmaWVyID0gZWxlbWVudGFyeUVsZW1lbnRGYWN0b3J5LndpdGgocnVsZUlucHV0Q29udGFpbmVyKS5tYWtlKCdzbWFsbCcpLmNzcygncnVsZS1ub3RpZmljYXRpb24nLCAnZC1ibG9jaycsICdkaXNwbGF5LW5vbmUnKS50ZXh0KCdQbGVhc2UgaW5wdXQgYSB2YWx1ZSBiZXR3ZWVuIDAgYW5kIDI1NScpLmVsZW1lbnQ7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgcnVsZUlucHV0Q29udGFpbmVyLCBpbnB1dFByb21wdCwgc3VibWl0QnV0dG9uLCBub3RpZmllclxuICAgICAgICBdO1xuICAgIH1cbn1cblxuY29uc3QgZWxlbWVudGFyeUVsZW1lbnRGYWN0b3J5OiBFbGVtZW50YXJ5RWxlbWVudCA9IHtcbiAgICBjb250ZXh0OiB1bmRlZmluZWQsXG4gICAgZWxlbWVudDogdW5kZWZpbmVkLFxuXG4gICAgYnlDbGFzczogZnVuY3Rpb24gKHNlbGVjdG9yOiBzdHJpbmcpOiBFbGVtZW50YXJ5RWxlbWVudCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZWxmKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudCA9IHRoaXMuY29udGV4dC5xdWVyeVNlbGVjdG9yKGAuJHtzZWxlY3Rvcn1gKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBieUlkOiBmdW5jdGlvbiAoc2VsZWN0b3I6IHN0cmluZyk6IEVsZW1lbnRhcnlFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbGYoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50ID0gdGhpcy5jb250ZXh0LnF1ZXJ5U2VsZWN0b3IoYCMke3NlbGVjdG9yfWApO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIG1ha2U6IGZ1bmN0aW9uICh0YWc6IHN0cmluZyk6IEVsZW1lbnRhcnlFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbGYoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50ID0gdGhpcy5jb250ZXh0LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnKSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgdGV4dDogZnVuY3Rpb24gKHRleHQ6IHN0cmluZyk6IEVsZW1lbnRhcnlFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbGYoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmlubmVyVGV4dCA9IHRleHQ7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgY3NzOiBmdW5jdGlvbiAoLi4udG9rZW5zOiBzdHJpbmdbXSk6IEVsZW1lbnRhcnlFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbGYoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoLi4udG9rZW5zKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBhdHRyOiBmdW5jdGlvbiAoYXR0cnM6IGFueSk6IEVsZW1lbnRhcnlFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbGYoKCkgPT4ge1xuICAgICAgICAgICAgZm9yICh2YXIgdG9rZW4gaW4gYXR0cnMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKHRva2VuLCBhdHRyc1t0b2tlbl0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIHdpdGg6IGZ1bmN0aW9uIChjb250ZXh0OiBEb2N1bWVudEZyYWdtZW50IHwgSFRNTEVsZW1lbnQpOiBFbGVtZW50YXJ5RWxlbWVudCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZWxmKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudCA9IGNvbnRleHQuZ2V0Um9vdE5vZGUoKSBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBfc2VsZjogZnVuY3Rpb24gKGNvbnRleHQ6ICgpID0+IEVsZW1lbnRhcnlFbGVtZW50KTogRWxlbWVudGFyeUVsZW1lbnQge1xuICAgICAgICBjb250ZXh0KCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn0iLCJpbXBvcnQgeyBFbGVtZW50YXJ5QnVmZmVyIH0gZnJvbSBcIi4vYnVmZmVyXCI7XG5pbXBvcnQgeyBFbGVtZW50YXJ5Q29uZmlnIH0gZnJvbSBcIi4vYXBwXCI7XG5cbmV4cG9ydCBlbnVtIEFuaW1hdGlvblN0eWxlIHtcbiAgICBTdGVwd2lzZSA9IDAsXG4gICAgRGlyZWN0ID0gMVxufVxuXG5leHBvcnQgY2xhc3MgRWxlbWVudGFyeSB7XG4gICAgcHJpdmF0ZSBlbGVtZW50YXJ5Q29uZmlnOiBFbGVtZW50YXJ5Q29uZmlnXG4gICAgcHJpdmF0ZSBnZW5lcmF0aW9uQnVmZmVyOiBFbGVtZW50YXJ5QnVmZmVyO1xuICAgIHByaXZhdGUgYW5pbWF0aW9uU3R5bGU6IEFuaW1hdGlvblN0eWxlO1xuXG4gICAgLyoqIFxuICAgICAqICBUaGlzIGlzIHRoZSBjdXJyZW50IHJ1bGVzZXQsIGluZGljYXRpbmcgaG93IHRoZSBuZXh0IGdlbmVyYXRpb24gc2hvdWxkIGNob29zZSBpdHMgdmFsdWUgYWNjb3JkaW5nIHRvIHRoZSBjdXJyZW50IHN0YXRlXG4gICAgICogIG9mIHRoZSBjZWxsIGFuZCBpdHMgdHdvIGltbWVkaWF0ZSBuZWlnaGJvcnNcbiAgICAqL1xuICAgIHByaXZhdGUgcnVsZXNldDogQXJyYXk8bnVtYmVyPjtcblxuICAgIGJvb3RzdHJhcEFwcGxpY2F0aW9uKGNvbmZpZzogRWxlbWVudGFyeUNvbmZpZywgYW5pbWF0aW9uU3R5bGU6IEFuaW1hdGlvblN0eWxlID0gQW5pbWF0aW9uU3R5bGUuU3RlcHdpc2UpOiBFbGVtZW50YXJ5IHtcbiAgICAgICAgdGhpcy5nZW5lcmF0aW9uQnVmZmVyID0gbmV3IEVsZW1lbnRhcnlCdWZmZXIoY29uZmlnLndpZHRoLCBjb25maWcuZ2VuZXJhdGlvbnMpO1xuICAgICAgICB0aGlzLmFuaW1hdGlvblN0eWxlID0gYW5pbWF0aW9uU3R5bGU7XG4gICAgICAgIHRoaXMucnVsZXNldCA9IG5ldyBBcnJheTxudW1iZXI+KDgpO1xuICAgICAgICB0aGlzLmVsZW1lbnRhcnlDb25maWcgPSBjb25maWc7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFuaW1hdGUgdGhlIHN0ZXAgY29sY3VsYXRpb24sIHJ1biB1bnRpbGwgc3BlY2lmaWVkIGFtb3VudCBvZiBnZW5lcmF0aW9ucyBoYXMgcGFzc2VkLlxuICAgICAqL1xuICAgIGFuaW1hdGUob25TdWNjZXNzOiAoZ2VuZXJhdGlvbnM6IFVpbnQ4QXJyYXksIHllYXI6IG51bWJlcikgPT4gdm9pZCkge1xuICAgICAgICBjb25zdCBzdGFydCA9IHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgY29uc3Qgc2ltcGxlUGVyZm9ybWFuY2VNb25pdG9yID0ge1xuICAgICAgICAgICAgZnJhbWVUaW1lOiAwLCBsYXN0VGltZTogMFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFRPRE8gc2VwYXJhdGUgbG9naWMgYW5kIHJlbmRlciB0aWNrcywgc28gdGhhdCB3ZSBjYW4gY29udGludWUgdG8gcGFuIGFmdGVyIHNpbXVsYXRpb25cbiAgICAgICAgY29uc3QgdGljayA9IChkZWx0YTogRE9NSGlnaFJlc1RpbWVTdGFtcCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZ3JpZCA9IHRoaXMuc3RlcCh0aGlzLmN1cnJlbnRHZW5lcmF0aW9uKCkpO1xuICAgICAgICAgICAgY29uc3QgbmV4dEdlbmVyYXRpb24gPSB0aGlzLmdlbmVyYXRpb25CdWZmZXIuYWdlIDwgdGhpcy5lbGVtZW50YXJ5Q29uZmlnLmdlbmVyYXRpb25zIC0gMTtcbiAgICAgICAgICAgIGlmICh0aGlzLmVsZW1lbnRhcnlDb25maWcuY2FtZXJhIHx8IG5leHRHZW5lcmF0aW9uKSB7IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGljayk7IH1cbiAgICAgICAgICAgIGlmICh0aGlzLmFuaW1hdGlvblN0eWxlID09PSBBbmltYXRpb25TdHlsZS5TdGVwd2lzZSkge1xuICAgICAgICAgICAgICAgIG9uU3VjY2VzcyhncmlkLCB0aGlzLmdlbmVyYXRpb25CdWZmZXIuYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1vbml0b3JTdGF0aXN0aWNzKGRlbHRhKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBtb25pdG9yU3RhdGlzdGljcyA9IChkZWx0YTogRE9NSGlnaFJlc1RpbWVTdGFtcCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZWxhcHNlZCA9IGRlbHRhIC0gc3RhcnQ7XG4gICAgICAgICAgICBzaW1wbGVQZXJmb3JtYW5jZU1vbml0b3IuZnJhbWVUaW1lICs9IGVsYXBzZWQgLSBzaW1wbGVQZXJmb3JtYW5jZU1vbml0b3IubGFzdFRpbWU7XG4gICAgICAgICAgICBpZiAoc2ltcGxlUGVyZm9ybWFuY2VNb25pdG9yLmZyYW1lVGltZSA+IDEwMDApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW0ZyYW1lXSA6ICR7c2ltcGxlUGVyZm9ybWFuY2VNb25pdG9yLmZyYW1lVGltZX1gKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW0dlbmVyYXRpb25zXSA6ICR7dGhpcy5nZW5lcmF0aW9uQnVmZmVyLmFnZX0vJHt0aGlzLmVsZW1lbnRhcnlDb25maWcuZ2VuZXJhdGlvbnN9YCk7XG4gICAgICAgICAgICAgICAgc2ltcGxlUGVyZm9ybWFuY2VNb25pdG9yLmZyYW1lVGltZSA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzaW1wbGVQZXJmb3JtYW5jZU1vbml0b3IubGFzdFRpbWUgPSBlbGFwc2VkO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRpY2spO1xuICAgICAgICBpZiAodGhpcy5hbmltYXRpb25TdHlsZSA9PT0gQW5pbWF0aW9uU3R5bGUuRGlyZWN0KSB7XG4gICAgICAgICAgICBvblN1Y2Nlc3ModGhpcy5nZW5lcmF0aW9uQnVmZmVyLmJ1ZmZlciwgdGhpcy5lbGVtZW50YXJ5Q29uZmlnLmdlbmVyYXRpb25zKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBcbiAgICAqIFBlcmZvcm0gYSBzdGVwLCBjYWxjdWxhdGUgb25lIGdlbmVyYXRpb24uXG4gICAgKiBAcGFyYW0gY3VycmVudEdlbmVyYXRpbmdHcmlkICBUaGUgcm93IGluIHRoZSBnZW5lcmF0aW9uIGN1cnJlbnRseSBiZWVpbmcgZ2VuZXJhdGVkXG4gICAgKi9cbiAgICBzdGVwKGN1cnJlbnRHZW5lcmF0aW5nR3JpZDogVWludDhBcnJheSk6IFVpbnQ4QXJyYXkge1xuICAgICAgICBjb25zdCB5ZWFyID0gdGhpcy5nZW5lcmF0aW9uQnVmZmVyLmFnZSArIDE7XG4gICAgICAgIGZvciAobGV0IGdyaWRjZWxsID0gMTsgZ3JpZGNlbGwgPCB0aGlzLmVsZW1lbnRhcnlDb25maWcud2lkdGggLTE7IGdyaWRjZWxsKyspIHtcbiAgICAgICAgICAgIGNvbnN0IG4gPSB0aGlzLm5laWdoYm91cnMoY3VycmVudEdlbmVyYXRpbmdHcmlkLCBncmlkY2VsbCk7XG4gICAgICAgICAgICBpZiAoIW4gJiYgbiA8IDApIHsgdGhyb3cgYElsbGVnYWwgc3RhdGU6ICR7Z3JpZGNlbGx9YDsgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmdlbmVyYXRpb25CdWZmZXIuc2V0KHllYXIsIGdyaWRjZWxsLCB0aGlzLnJ1bGUobikpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjdXJyZW50R2VuZXJhdGluZ0dyaWQ7XG4gICAgfVxuXG4gICAgLyoqIFxuICAgICogR2V0IHRoZSBuZWlnaGJvdXJSdWxlcy1pbmRleCBjYWxjdWxhdGVkIGZyb20gdGhlIG5laWdoYm91cnMgb2YgdGhlIGNlbGwgY3VycmVudGx5IGJlZWluZyB2aXNpc3RlZC5cbiAgICAqIEBwYXJhbSBjdXJyZW50R2VuZXJhdGluZ0dyaWQgIFRoZSByb3cgaW4gdGhlIGdlbmVyYXRpb24gY3VycmVudGx5IGJlZWluZyBnZW5lcmF0ZWRcbiAgICAgKi9cbiAgICBuZWlnaGJvdXJzKGN1cnJlbnRHZW5lcmF0aW5nR3JpZDogVWludDhBcnJheSwgY2VsbDogbnVtYmVyKSB7XG4gICAgICAgIGlmIChjZWxsIDwgMCB8fCBjZWxsID4gdGhpcy5lbGVtZW50YXJ5Q29uZmlnLndpZHRoKSB7IFxuICAgICAgICAgICAgdGhyb3cgJ091dCBvZiBjZWxsIHJhbmdlIGZvciBuZWlnaGJvdXJzKCkgY2FsbCc7XG4gICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgciA9IGN1cnJlbnRHZW5lcmF0aW5nR3JpZFtjZWxsICsgMSA+PSB0aGlzLmVsZW1lbnRhcnlDb25maWcud2lkdGggPyBjdXJyZW50R2VuZXJhdGluZ0dyaWQuYXQoMCkgOiBjZWxsICsgMV07XG4gICAgICAgIGNvbnN0IGwgPSBjdXJyZW50R2VuZXJhdGluZ0dyaWRbY2VsbCAtIDEgPD0gMCA/IGN1cnJlbnRHZW5lcmF0aW5nR3JpZC5hdCgtMSkgOiBjZWxsIC0gMV07XG4gICAgICAgIHJldHVybiAweGYgJiAociA8PCAyIHwgY3VycmVudEdlbmVyYXRpbmdHcmlkW2NlbGxdIDw8IDEgfCBsKTtcbiAgICB9XG5cblxuICAgIHJ1bGUoaW5kZXg6IG51bWJlcikgeyByZXR1cm4gdGhpcy5ydWxlc2V0W3RoaXMuZWxlbWVudGFyeUNvbmZpZy5uZWlnaGJvdXJSdWxlc1tpbmRleF1dOyB9XG4gICAgc2ltdWxhdGlvbkNvbXBsZXRlZCgpIHsgcmV0dXJuIHRoaXMuZ2VuZXJhdGlvbkJ1ZmZlci5hZ2UgPj0gdGhpcy5lbGVtZW50YXJ5Q29uZmlnLmdlbmVyYXRpb25zIC0gMTsgfVxuICAgIGdlbmVyYXRpb24oeWVhcj86IG51bWJlcikgeyByZXR1cm4gdGhpcy5nZW5lcmF0aW9uQnVmZmVyLmdlbmVyYXRpb24oeWVhcik7IH1cbiAgICBjdXJyZW50R2VuZXJhdGlvbigpIHsgcmV0dXJuIHRoaXMuZ2VuZXJhdGlvbkJ1ZmZlci5jdXJyZW50R2VuZXJhdGlvbigpOyB9XG5cbiAgICBjaGFuZ2VSdWxlc2V0KHJkZWNpbWFsOiBudW1iZXIpIHtcbiAgICAgICAgY29uc3QgZHRvYiA9IChuOiBudW1iZXIpID0+IHsgcmV0dXJuIHJkZWNpbWFsID4+IG4gJiAweDE7IH1cbiAgICAgICAgdGhpcy5ydWxlc2V0ID0gW2R0b2IoNyksIGR0b2IoNiksIGR0b2IoNSksIGR0b2IoNCksIGR0b2IoMyksIGR0b2IoMiksIGR0b2IoMSksIGR0b2IoMCldO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc291cmNlL2FwcC50c1wiKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==