import { ElementaryConfig } from "./main";

export class Display {
    public context: CanvasRenderingContext2D;
    public canvas: HTMLCanvasElement;

    private elementaryconfig: ElementaryConfig;

    public init(config: ElementaryConfig, container?: string, id?: string) {
        if (!container) { container = 'game-view'; }
        if (!id) { id = 'game-canvas'; }

        this.elementaryconfig = config;

        const rendercontext = this.createHDPICanvasElement(container, id);
        this.context = rendercontext.context;
        this.canvas = rendercontext.canvas;
    }

    public render(generations: Array<Array<number>>) {
        if (!this.elementaryconfig) { throw 'ElemntaryConfig has to be set if the grid should be canvas rendered'; }
        if (!generations) { throw 'Illegal state - Display grid is undefined'; }

        const ratio = this.elementaryconfig.ratio;
        const gridwidth = this.elementaryconfig.width;
        const configsize = this.elementaryconfig.cellsize;

        let cellw= ratio ? this.canvas.width / gridwidth : configsize;
        let cellh = ratio ? this.canvas.width / gridwidth : configsize;

        this.context.translate(0.5, 0.5);

        generations.forEach((gen, year) => {
            gen.forEach((cell, gridcell) => {
                if (cell) {
                    this.context.fillStyle = this.elementaryconfig.cellcolorOn;
                } else {
                    this.context.fillStyle = this.elementaryconfig.cellcolorOff;
                }

                this.context.fillRect(gridcell * cellw, year * cellh, cellw, cellh);
            });
        });
    }

    private createHDPICanvasElement(container: string, id: string = undefined): { canvas: HTMLCanvasElement, context: CanvasRenderingContext2D } {
        const canvascontainer = document.getElementById(container);
        const canvas = document.createElement('canvas') as HTMLCanvasElement;
        let ctx = canvas.getContext('2d');

        const devicepixelratio = window.devicePixelRatio || 1;
        const crect = canvascontainer.getBoundingClientRect();

        canvas.width = crect.width * devicepixelratio;
        canvas.height = crect.height * devicepixelratio;
        ctx.scale(devicepixelratio, devicepixelratio);
        ctx.imageSmoothingEnabled = false;

        if (id) { canvas.id = id; }
        canvascontainer.appendChild(canvas);
        return { canvas: canvas, context: ctx };
    }
}