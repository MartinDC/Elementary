/**
 *  ElementaryBuffer is the internal data structure that holds the bit-grid making up the automata.
 *  '1' means render and treat as a neighbour, '0' means to ignore
 */

export declare type ElementaryBinaryNumber = 0 | 1;

export class ElementaryBuffer {
    public readonly internalBuffer: Uint8Array = undefined;
    private highestGenerationIndex: number = 0;

    constructor(private readonly width: number, private readonly generations: number) {
        this.internalBuffer = this.internalCreateBuffer(this.generations, this.width);
        if (!this.internalBuffer || this.internalBuffer.buffer.byteLength < this.size) {
            throw `${this.constructor.name} - Failed to create buffer with size ${this.size}`;
        }

        this.internalBuffer.fill(0, 0, this.size); // Seed first generation
        this.internalBuffer.fill(1, this.width / 2, this.width / 2 + 1);
    }

    get age() { return this.highestGenerationIndex; } // Amount of years processed so far 
    get size() { return this.generations * this.width; }
    get buffer() { return this.internalBuffer; }

    public currentGeneration(): Uint8Array { return this.generation(this.highestGenerationIndex); }
    public generation(year: number): Uint8Array { return this.internalBuffer.subarray(this.width * year, this.width * year + this.width); }
    public toggle(year: number, col: number) { this.internalElementSet(year, col, this.internalElementAt(year, col) ? 0 : 1); }
    public set(year: number, col: number, value: number) { this.internalElementSet(year, col, value); }
    public read(year: number, col: number) { return this.internalElementAt(year, col); }

    private internalElementSet(row: number, col: number, flag: number) {
        const binaryNumber = flag as ElementaryBinaryNumber;
        const flatIndex = row * this.generations + col;

        if (flatIndex < 0 || flatIndex > this.size) { throw `${this.constructor.name} - Argument out of bounds ${row}, ${col}`; }
        if (binaryNumber != 1 && binaryNumber != 0) { throw `${this.constructor.name} - Flag is not in a correct form. Should be a bit (0 or 1) `; }

        this.buffer[flatIndex] = flag; // Check if we have reached a higher generation
        if (row > this.highestGenerationIndex) { // TODO move this to elementary.ts for performance
            this.highestGenerationIndex = row;
        }
    }

    private internalElementAt(row: number, col: number) {
        const flatIndex = row * this.generations + col;
        if (flatIndex < 0 || flatIndex > this.size) {
            throw `${this.constructor.name} - Argument out of bounds ${row}, ${col}`;
        }
        return this.buffer[flatIndex];
    }

    private internalCreateBuffer(rows: number, cols: number) {
        try {
            if (!rows || !cols || rows <= 0 || cols <= 0) {
                throw Error(`${this.constructor.name} - Invalid row and col data`);
            }
            const buffer = new ArrayBuffer(rows * cols);
            return new Uint8Array(buffer, 0, rows * cols);
        } catch (e) {
            throw `${this.constructor.name} - ${e}`;
        }
    }
}