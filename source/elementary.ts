import { ElementaryBuffer } from "./buffer";
import { ElementaryConfig } from "./app";

export enum AnimationStyle {
    Stepwise = 0,
    Direct = 1
}

export class Elementary {
    private elementaryConfig: ElementaryConfig
    private generationBuffer: ElementaryBuffer;
    private animationStyle: AnimationStyle;

    /** 
     *  This is the current ruleset, indicating how the next generation should choose its value according to the current state
     *  of the cell and its two immediate neighbors
    */
    private ruleset: Array<number>;

    bootstrapApplication(config: ElementaryConfig, animationStyle: AnimationStyle = AnimationStyle.Stepwise): Elementary {
        this.generationBuffer = new ElementaryBuffer(config.width, config.generations);
        this.animationStyle = animationStyle;
        this.ruleset = new Array<number>(8);
        this.elementaryConfig = config;
        return this;
    }

    /**
     * Animate the step colculation, run untill specified amount of generations has passed.
     */
    animate(onSuccess: (generations: Uint8Array, year: number) => void) {
        const start = window.performance.now();
        const simplePerformanceMonitor = {
            frameTime: 0, lastTime: 0
        };

        const tick = (delta: DOMHighResTimeStamp) => {
            const grid = this.step(this.currentGeneration());
            const nextGeneration = this.generationBuffer.age < this.elementaryConfig.generations - 1;
            if (this.elementaryConfig.camera || nextGeneration) { window.requestAnimationFrame(tick); }
            if (this.animationStyle === AnimationStyle.Stepwise) {
                onSuccess(grid, this.generationBuffer.age);
            }
            monitorStatistics(delta);
        };

        const monitorStatistics = (delta: DOMHighResTimeStamp) => {
            const elapsed = delta - start;
            simplePerformanceMonitor.frameTime += elapsed - simplePerformanceMonitor.lastTime;
            if (simplePerformanceMonitor.frameTime > 1000) {
                console.log(`[Frame] : ${simplePerformanceMonitor.frameTime}`);
                console.log(`[Generations] : ${this.generationBuffer.age}/${this.elementaryConfig.generations}`);
                simplePerformanceMonitor.frameTime = 0;
            }
            simplePerformanceMonitor.lastTime = elapsed;
        }
        
        window.requestAnimationFrame(tick);
        if (this.animationStyle === AnimationStyle.Direct) {
            onSuccess(this.generationBuffer.buffer, this.elementaryConfig.generations);
        }
    }

    /** 
    * Perform a step, calculate one generation.
    * @param currentGeneratingGrid  The row in the generation currently beeing generated
    */
    step(currentGeneratingGrid: Uint8Array): Uint8Array {
        const year = this.generationBuffer.age + 1;
        for (let gridcell = 0; gridcell < this.elementaryConfig.width; gridcell++) {
            const n = this.neighbours(currentGeneratingGrid, gridcell);
            if (!n && n < 0) { throw `Illegal state: ${gridcell}`; }

            this.generationBuffer.set(year, gridcell, this.rule(n));
        }
        return currentGeneratingGrid;
    }

    /** 
    * Get the neighbourRules-index calculated from the neighbours of the cell currently beeing visisted.
    * @param currentGeneratingGrid  The row in the generation currently beeing generated
     */
    neighbours(currentGeneratingGrid: Uint8Array, cell: number) {
        if (cell < 0 || cell > this.elementaryConfig.width) { return 0; }

        const r = currentGeneratingGrid[cell + 1 >= this.elementaryConfig.width ? 0 : cell + 1];
        const l = currentGeneratingGrid[cell - 1 <= 0 ? 0 : cell - 1];
        return 0xf & (r << 2 | currentGeneratingGrid[cell] << 1 | l);
    }

    rule(index: number) { return this.ruleset[this.elementaryConfig.neighbourRules[index]]; }
    simulationCompleted() { return this.generationBuffer.age >= this.elementaryConfig.generations - 1; }
    generation(year?: number) { return this.generationBuffer.generation(year); }
    currentGeneration() { return this.generationBuffer.currentGeneration(); }

    changeRuleset(rdecimal: number) {
        const dtob = (n: number) => { return rdecimal >> n & 0x1; }
        this.ruleset = [dtob(7), dtob(6), dtob(5), dtob(4), dtob(3), dtob(2), dtob(1), dtob(0)];
        return this;
    }
}