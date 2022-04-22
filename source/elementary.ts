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
     * Animate the step colculation, run untill specified amount of generations has passed.
     */
    animate(onSuccess: (generations: Array<Array<number>>) => void) {
        const firstgen = new Array<number>(this.elementaryconfig.generations).fill(0, 0, this.elementaryconfig.width);
        firstgen.fill(1, this.elementaryconfig.width / 2, this.elementaryconfig.width / 2 + 1);
        this.generations.push(firstgen);

        const tick = () => {
            this.grid = this.currentGeneration();
            this.generations.push(this.step());

            let nextGeneration = this.generations.length < this.elementaryconfig.generations;
            if (nextGeneration) { window.requestAnimationFrame(tick); }
            onSuccess(this.generations.slice(-1));
        };

        window.requestAnimationFrame(tick);
    }

    /** 
    * Perform a step, calculate one generation.
    */
    step(): number[] {
        const nextgrid: number[] = [];
        this.grid.forEach((_, gridcell) => {
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

        const r = this.grid[cell + 1 >= this.elementaryconfig.width ? 0 : cell + 1];
        const l = this.grid[cell - 1 <= 0 ? 0 : cell - 1];
        return 0xf & (r << 2 | this.grid[cell] << 1 | l);
    }

    rule(index: number) { return this.elementaryconfig.ruleset[this.elementaryconfig.neighbourRules[index]]; }
    currentGeneration() { return this.generations.slice(-1)[0]; }
    generation(year?: number) { return this.generations[year]; }

    changeRuleset(rdecimal: number) {
        const dtob = (n: number) => { return rdecimal >> n & 0x1; }
        this.elementaryconfig.ruleset = [dtob(7), dtob(6), dtob(5), dtob(4), dtob(3), dtob(2), dtob(1), dtob(0)];
        return this;
    }
}