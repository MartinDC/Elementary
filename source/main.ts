import { Display } from "./display";
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
    ruleset: Array<number>;   // This is the current ruleset, indicating how the next generation should choose its value according to the current state of the cell and its two immediate neighbors

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
    ruleset: [0, 0, 0, 1, 1, 1, 1, 0], // Rule 30

    generations: 200,
    cellsize: 5,
    width: 200,
    
    ratio: true,
    container: '#elementary-container',
    cellcolorOff: 'rgb(132, 208, 212)',
    cellcolorOn: 'rgb(87, 91, 107)',
};

export class ElementaryMain {
    private elementaryDom: ElementaryDom = new ElementaryDom();
    private display: Display = new Display();

    runSimulation(config?: ElementaryConfig) {
        const defaultConfig = config || elementaryConfig;
        const elementary = new Elementary().bootstrapApplication(defaultConfig);

        this.elementaryDom.renderSelectionPrompts((rule) => {
            this.display.init(defaultConfig);
            elementary.changeRuleset(rule).animate((generations) => {
                this.display.render(generations);
            });
        });
    }
}

new ElementaryMain().runSimulation();