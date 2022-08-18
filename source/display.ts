import { ElementaryConfig } from "./app";

declare type Camera = { x: number, y: number; }

export class ElementaryDisplay {
    private elementaryconfig: ElementaryConfig;
    public offscreenContext: CanvasRenderingContext2D;
    public context: CanvasRenderingContext2D;
    public canvas: HTMLCanvasElement;

    private isMouseDown: boolean = false;
    private lastMouse: Camera = { x: 0, y: 0 };
    private mouse: Camera = { x: 0, y: 0 };

    private cameraSpeed: number = 10.4;
    private camera: Camera = { x: 0, y: 0 }

    public init(config: ElementaryConfig, container?: string, id?: string) {
        if (!container) { container = 'game-view'; }
        if (!id) { id = 'game-canvas'; }

        const [canvas, context, offscreenContext] = this.initHDPICanvasElement(config, container, id);
        this.centerAutomataInView(config, offscreenContext);
        this.registerSystemEvents();

        this.offscreenContext = offscreenContext;
        this.elementaryconfig = config;
        this.context = context;
        this.canvas = canvas;
    }

    public render(generations: Uint8Array, year: number): void {
        if (!this.elementaryconfig) { throw 'ElemntaryConfig has to be set if the grid should be canvas rendered'; }
        if (!generations) { throw 'Illegal state - Display grid is undefined'; }

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

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height); // TODO: Clear does follow translate, so trails will be left?
        this.context.drawImage(this.offscreenContext.canvas, 0, 0);
        this.context.translate(this.camera.x, this.camera.y);
    }

    private initHDPICanvasElement(config: ElementaryConfig, container: string, id: string = undefined): [HTMLCanvasElement, CanvasRenderingContext2D, CanvasRenderingContext2D] {
        const canvascontainer = document.getElementById(container);
        const [_, offscreenContext] = this.createHDPICanvasElement(config, canvascontainer);
        const [canvas, context] = this.createHDPICanvasElement(config, canvascontainer);

        if (id) { canvas.id = id; }
        canvascontainer.appendChild(canvas);
        return [canvas, context, offscreenContext];
    }

    private createHDPICanvasElement(config: ElementaryConfig, container?: HTMLElement): [HTMLCanvasElement, CanvasRenderingContext2D] {
        const canvas = document.createElement('canvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');

        const devicepixelratio = window.devicePixelRatio || 1;
        let { width, height } = container?.getBoundingClientRect();

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

    private centerAutomataInView(config: ElementaryConfig, context: CanvasRenderingContext2D): void {
        if (!config.center) { return; }

        const panVertical = config.generations < context.canvas.height;
        const translateX = context.canvas.width / 2 - config.width / 2;
        const translateY = context.canvas.height / 2 - config.generations / 2;
        context.translate(translateX, panVertical ? translateY : 0);
    }

    private registerSystemEvents(): void {
        const validateBounds = () => {
            const appropriateWidth = this.elementaryconfig.width * this.elementaryconfig.cellsize;
            const appropriateHeight = this.elementaryconfig.generations * this.elementaryconfig.cellsize;

            if (this.camera.x < 0) { this.camera.x = 0; }
            if (this.camera.y < 0) { this.camera.y = 0; }

            if (this.camera.x > appropriateWidth) { this.camera.x = appropriateWidth; }
            if (this.camera.y > appropriateHeight) { this.camera.y = appropriateHeight; }
        };

        document.addEventListener('mousemove', (e) => this.mouse = { x: e.offsetX, y: e.offsetY });
        document.addEventListener('mousedown', (_) => this.isMouseDown = true);
        document.addEventListener('mouseup', (_) => this.isMouseDown = false);

        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() == 'w') { this.camera.y -= this.cameraSpeed; }
            if (e.key.toLowerCase() == 's') { this.camera.y += this.cameraSpeed; }
            if (e.key.toLowerCase() == 'a') { this.camera.x -= this.cameraSpeed; }
            if (e.key.toLowerCase() == 'd') { this.camera.x += this.cameraSpeed; }
        });
    }
}