import { ElementaryConfig } from "./main";

export class Elementary {
    private elementaryconfig: ElementaryConfig
    private generations: Array<Array<number>>;
    private grid: Array<number>;

    bootstrapApplication(config: ElementaryConfig): Elementary {
        this.elementaryconfig = config;

        this.generations = new Array<Array<number>>();
        this.grid = new Array<number>();
        return this;
    }

    /**
     * Animate the step colculation, run untill specified amount of generation years has passed.
    * TODO. Does call requestAnimationFrame, add option to throttle framerate and draw incremental generation changes.
     */
    animate(onSuccess: (generations: Array<Array<number>>) => void) {
        const firstgen = new Array<number>(this.elementaryconfig.generations).fill(0, 0, this.elementaryconfig.width);
        firstgen.fill(1, this.elementaryconfig.width / 2, this.elementaryconfig.width / 2 + 1);
        this.generations.push(firstgen);

        const tick = () => {
            this.grid = this.currentGeneration();
            this.generations.push(this.step());

            let nextGeneration = this.generations.length < this.elementaryconfig.generations;
            if (nextGeneration) { return window.requestAnimationFrame(tick); }
            onSuccess(this.generations);
        };

        window.requestAnimationFrame(tick);
    }

    /** 
    * Perform a step, ie calulcate one generation.
    */
    step(): number[] {
        const nextgrid: number[] = [];
        this.grid.forEach((cell, gridcell) => {
            const n = this.neighbours(gridcell);
            if (!n && n < 0) { throw `Illegal state: ${gridcell}`; }
            nextgrid[gridcell] = this.rule(n);
        });

        return nextgrid;
    }

    /** 
    * Get the neighbourRules-index calculated from the neighbours of the cell currently beeing visisted.
     */
    neighbours(cell: number) {
        if (cell < 0 || cell > this.elementaryconfig.width) { return 0; }

        const r = this.grid[cell + 1 > this.elementaryconfig.width ? 0 : cell + 1];
        const l = this.grid[cell - 1 < 0 ? 0 : cell - 1];
        return 0xf & (r << 2 | this.grid[cell] << 1 | l);
    }
    
    rule(index: number) {
        var nextrule = this.elementaryconfig.neighbourRules[index];
        return this.elementaryconfig.ruleset[(nextrule - 7) % 7 + 7];
    }

    generation(year?: number) {
        return this.generations[year];
    }

    currentGeneration() {
        return this.generations.slice(-1)[0];
    }
}