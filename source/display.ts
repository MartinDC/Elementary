import { ElementaryConfig } from "./app";

export class ElementaryDisplay {
    public context: CanvasRenderingContext2D;
    public canvas: HTMLCanvasElement;

    private elementaryconfig: ElementaryConfig;

    public init(config: ElementaryConfig, container?: string, id?: string) {
        if (!container) { container = 'game-view'; }
        if (!id) { id = 'game-canvas'; }

        const [canvas, context] = this.createHDPICanvasElement(config, container, id);
        this.centerViewIfNeeded(config, context);

        this.elementaryconfig = config;
        this.context = context;
        this.canvas = canvas;
    }

    public render(generations: Uint8Array, year: number) {
        if (!this.elementaryconfig) { throw 'ElemntaryConfig has to be set if the grid should be canvas rendered'; }
        if (!generations) { throw 'Illegal state - Display grid is undefined'; }

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

    private createHDPICanvasElement(config: ElementaryConfig, container: string, id: string = undefined): [HTMLCanvasElement, CanvasRenderingContext2D] {
        const canvascontainer = document.getElementById(container);
        const canvas = document.createElement('canvas') as HTMLCanvasElement;
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

        if (id) { canvas.id = id; }
        canvascontainer.appendChild(canvas);
        return [canvas, ctx];
    }

    private centerViewIfNeeded(config: ElementaryConfig, context: CanvasRenderingContext2D) {
        const panX = config.width < context.canvas.width;
        const panY = config.generations < context.canvas.height;
debugger;
        const translateX = panX ? context.canvas.width / 2 - config.width / 2 : 0;
        const translateY = panY ? context.canvas.height / 2 - config.generations / 2 : 0;
        if (translateX > 0) { context.translate(translateX, 0); }
        if (translateY > 0) { context.translate(0, translateY); }
    }
}