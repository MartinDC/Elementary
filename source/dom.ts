declare type ElementaryElement = {
    context: DocumentFragment | HTMLElement,
    element: HTMLElement,

    byId: (selector: string) => ElementaryElement,
    byClass: (selector: string) => ElementaryElement,
    with: (context: DocumentFragment | HTMLElement) => ElementaryElement,

    css: (...tokens: string[]) => ElementaryElement,
    attr: (attrs: any) => ElementaryElement,
    text: (text: string) => ElementaryElement,
    make: (tag: string) => ElementaryElement,
    _self: (context: () => any) => ElementaryElement,
}

export class ElementaryDom {
    renderSelectionPrompts(selection: (v: number) => void) {
        const selectionContainer = elementaryElementFactory.with(document).byId('selection-view').element;
        const gameContainer = elementaryElementFactory.with(document).byId('game-view').element;
        if (!selectionContainer) { throw 'Failed to load selection selectionContainer - this is a fatal error'; }

        const fragmentRoot = document.createDocumentFragment();
        const [container, input, submit, notifier] = this.buildElements(fragmentRoot);

        if (selection) {
            submit.addEventListener('click', () => {
                const rule = parseInt((input as HTMLInputElement).value);
                if (rule >= 0 && rule < Math.pow(2, 8)) {
                    gameContainer.classList.remove('display-none');
                    container.classList.add('display-none');
                    return selection(rule);
                }

                // Else we have a error, so display notifier
                notifier.classList.toggle('display-none');
            });
        }
        selectionContainer.append(fragmentRoot);
    }

    buildElements(context: DocumentFragment) : HTMLElement[] {
        const ruleInputContainer = elementaryElementFactory.with(context).make('div').css('rule-card', 'pt-normal').element;
        const inputPrompt = elementaryElementFactory.with(ruleInputContainer).make('input').attr({ 'type': 'text' }).css('rule-input').element;
        const submitButton = elementaryElementFactory.with(ruleInputContainer).make('button').attr({ 'type': 'button' }).css('rule-btn').text('Go!').element;
        const notifier = elementaryElementFactory.with(ruleInputContainer).make('small').css('rule-notification', 'd-block', 'display-none').text('Please input a value between 0 and 255').element;
        
        return [
            ruleInputContainer, inputPrompt, submitButton, notifier
        ];
    }
}

const elementaryElementFactory: ElementaryElement = {
    context: undefined,
    element: undefined,

    byClass: function (selector: string): ElementaryElement {
        return this._self(() => {
            this.element = this.context.querySelector(`.${selector}`);
        });
    },
    byId: function (selector: string): ElementaryElement {
        return this._self(() => {
            this.element = this.context.querySelector(`#${selector}`);
        });
    },
    make: function (tag: string): ElementaryElement {
        return this._self(() => {
            this.element = this.context.appendChild(document.createElement(tag));
        });
    },
    text: function (text: string): ElementaryElement {
        return this._self(() => {
            this.element.innerText = text;
        });
    },
    css: function (...tokens: string[]): ElementaryElement {
        return this._self(() => {
            this.element.classList.add(...tokens);
        });
    },
    attr: function (attrs: any): ElementaryElement {
        return this._self(() => {
            for (var token in attrs) {
                this.element.setAttribute(token, attrs[token]);
            }
        });
    },
    with: function (context: DocumentFragment | HTMLElement): ElementaryElement {
        return this._self(() => {
            this.element = context.getRootNode() as HTMLElement;
            this.context = context;
        });
    },

    _self: function (context: () => ElementaryElement): ElementaryElement {
        context();
        return this;
    }
}