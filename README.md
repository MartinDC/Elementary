<p align="center">
    <img src="https://github.com/MartinDC/Elementary/blob/main/sample/rule_99.png" style="margin: 50% auto;">
</p>

[![Google Chrome](https://img.shields.io/badge/Google%20Chrome-4285F4?style=for-the-badge&logo=GoogleChrome&logoColor=white)](#)
[![Firefox](https://img.shields.io/badge/Firefox-FF7139?style=for-the-badge&logo=Firefox-Browser&logoColor=white)](#)
[![Edge](https://img.shields.io/badge/Edge-0078D7?style=for-the-badge&logo=Microsoft-edge&logoColor=white)](#)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](#)

#### Elementary is a viewer for [Elementary cellular automaton](https://en.wikipedia.org/wiki/Elementary_cellular_automaton) focusing on **simplicity** and **maintainability**. Trying to fill a gap of easy to grasp and use solutions.

#### [Run the simulation in your browser](https://martindc.github.io/Elementary/)

# Install
The simplest way to play with the sample is through Github. Download or clone this repository and make sure that you have **npm** installed, then go to the root directory (where the **package.json** lives) and run `npm install`. This should download typescript and all other dependencies that are needed for the application to build. Open `index.html` in any evergreen browser and you should be all setup.

# Usage
The API is **simple** - one line of code and one lines of HTML should render the automaton for you.

```ts
    new ElementaryApp().run();
```

### HTML
Your HTML needs a marker element deciding where you want things to render. 
The important part is that the element **id** is the same as the 'container' specified in your **config**.

As the config is optional to give the default is 'selection-view'.

```html
    <div id="selection-view"></div>
```

### Config
You can **optionally** pass a config to Elementary by using the chainable function **withConfig(elementaryConfig)**. Here you control things like generations and style.

```ts
{
    width: number;        // Grid width (default 1000)
    cellsize: number;     // The size of a single cell (default 5)
    generations: number;  // Amount of generations to simulate (default 1000)
    container: string     // Marker element where Elementary will generate it's view (default '#elementary-container')
    ratio: boolean;       // If true - Calculate cellsize to fill window width (default true)
    cellcolorOff: string; // color for state off - this should be a color valid in CSS (default 'rgb(132, 208, 212)')
    cellcolorOn: string;  // color for state on - this should be a color valid in CSS (default 'rgb(87, 91, 107)')
};
```

# Words from the author
I always been fascinated by the 'alive' nature presented by automatons and as such i wanted to investigate them further. And voila! Elementary was born.

With that said, the project is still in a very early state and much of it is only a thought in my head at this time.
But The image generation does **work**, so feel free to use it as you like.
And if you are just starting out you can probably learn something from it!