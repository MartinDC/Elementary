import { ElementaryConfig } from "./main";

export class Display {
    public context: CanvasRenderingContext2D;
    public canvas: HTMLCanvasElement;

    private elementaryconfig: ElementaryConfig;

    public init(config: ElementaryConfig, container?: string, id?: string) {
        if (!container) { container = 'game-view'; }
        if (!id) { id = 'game-canvas'; }

        this.elementaryconfig = config;
        
        const [canvas, context] = this.createHDPICanvasElement(container, id);
        this.context = context;
        this.canvas = canvas;
    }

    public render(generations: Array<Array<number>>) {
        if (!this.elementaryconfig) { throw 'ElemntaryConfig has to be set if the grid should be canvas rendered'; }
        if (!generations) { throw 'Illegal state - Display grid is undefined'; }

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

    private createHDPICanvasElement(container: string, id: string = undefined): [HTMLCanvasElement, CanvasRenderingContext2D] {
        const canvascontainer = document.getElementById(container);
        const canvas = document.createElement('canvas') as HTMLCanvasElement;
        let ctx = canvas.getContext('2d');

        const devicepixelratio = window.devicePixelRatio || 1;
        const crect = canvascontainer.getBoundingClientRect();

        canvas.width = crect.width * devicepixelratio;
        canvas.height = crect.height * devicepixelratio;
        ctx.scale(devicepixelratio, devicepixelratio);
        ctx.translate(0.5, 0.5);

        ctx.imageSmoothingEnabled = false;

        if (id) { canvas.id = id; }
        canvascontainer.appendChild(canvas);
        return [canvas, ctx];
    }
}