import * as asciiCfg from "../data/main.json";
import { ElementaryDisplay } from "./display";
import { ElementaryDom } from "./dom";
import { Elementary } from "./elementary";

/**
 * WIKIPEDIA:
 * 
 * The evolution of an elementary cellular automaton can completely be described by a table specifying the state a given cell will have in the next generation based on the value of the cell to its left,
 * the value from the cell itself, and the value of the cell to its right. 
 * 
 * Since there are 2×2×2=2^3=8 possible binary states for the three cells neighboring a given cell, there are a total of 2^8=256 elementary cellular automata, each of which can be indexed with an 8-bit binary number (Wolfram 1983, 2002)
 * The complete set of 256 elementary cellular automata can be described by a 8 bit number. 
 * 
 * The rule defining the cellular automaton must specify the resulting state for each of these possibilities so there are 256 = 2^2^3 possible elementary cellular automata. 
 * Stephen Wolfram proposed a scheme, known as the Wolfram code, to assign each rule a number from 0 to 255 which has become standard. Each possible current configuration is written in order, 111, 110, ..., 001, 000, 
 * and the resulting state for each of these configurations is written in the same order and interpreted as the binary representation of an integer. 
 * 
 * This number is taken to be the rule number of the automaton. For example, 110d=011011102. So rule 110 is defined by the transition rule:
 * 
 * 111	110	101	100	011	010	001	000	current pattern	P=(L,C,R)
 *  0	1	1	0	1	1	1	0	new state for center cell	N110d=(C+R+C*R+L*C*R)%2
 */

export class ElementaryConfig {
    readonly neighbourRules: Array<number>; // This is the 8 possible states a cell can take from its three neighbours, keep them in a immutable ladder to be used for rule indexing later

    container: string;      // Marker element where Elementary will generate it's view (prompt and canvas)
    generations: number;    // Amount of generations to simulate
    width: number;          // Grid width 

    ratio: boolean;         // If true - Calculate cellsize to fill window width
    cellsize: number;       // This is the size of a single cell
    cellcolorOff: string;   // color for state off - this should be a color valid in CSS (ex 'rgb(132, 208, 212)')
    cellcolorOn: string;    // color for state on - this should be a color valid in CSS (ex 'rgb(87, 91, 107)')
};

export const elementaryConfig: ElementaryConfig = {
    neighbourRules: [7, 6, 5, 4, 3, 2, 1, 0],

    generations: 2000,
    width: 2000,
    cellsize: 1,

    ratio: false,
    container: '#elementary-container',
    cellcolorOff: '#84d0d4',
    cellcolorOn: '#374b5b',
};

declare type ASCIISplashItem = { ending: string; color: string; art: string; };
declare type ASCIIData = Partial<{ entryAscii: ASCIISplashItem }>

class SimpleASCIISplasher {
    constructor(private ascii: ASCIISplashItem) { return this; }
    splash() { console.info(this.ascii.art, this.ascii.color, this.ascii.ending); }
}

// TODO: Random seeds, UI and pixel perfect rendering with scroll

export class ElementaryApp {
    private elementaryDom: ElementaryDom = new ElementaryDom();
    private display: ElementaryDisplay = new ElementaryDisplay();
    private config: ElementaryConfig = elementaryConfig;

    /** 
     * This function is used to supply a user config. 
     * If no config is specified the default will be used 
     * */
    withConfig(config: ElementaryConfig) {
        if (!config && !elementaryConfig) {
            throw `${this.constructor.name} - A default or user config must be present`;
        }
        this.config = config || elementaryConfig;
        return this;
    }
    
    /** 
     * Display a 'MOTD' style message in the browser console. 
     * The art is defined in data/main.json. 
     * */
    withSplash(ascii: ASCIISplashItem) {
        if (!ascii || !ascii.art) {
            throw `${this.constructor.name} - Could not find splash  data`;
        }
        new SimpleASCIISplasher(ascii).splash();
        return this;
    }

    run() {
        const defaultConfig = this.config || elementaryConfig;
        const elementary = new Elementary().bootstrapApplication(defaultConfig);

        this.elementaryDom.renderSelectionPrompts((rule) => {
            this.display.init(defaultConfig);
            elementary.changeRuleset(rule).animate((generations, year) => {
                this.display.render(generations, year);
            });
        });
    }
}

// API - how to run example
new ElementaryApp().withSplash((<ASCIIData>asciiCfg).entryAscii)
    .withConfig(elementaryConfig).run();