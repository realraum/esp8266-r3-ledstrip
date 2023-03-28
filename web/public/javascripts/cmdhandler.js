function convertHexToRGB(hex) {
    // hex: #RRGGBB
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    return {r, g, b};
}

function convertRGBToHex(r, g, b) {
    const rHex = r.toString(16);
    const gHex = g.toString(16);
    const bHex = b.toString(16);

    return `#${rHex.length === 1 ? '0' + rHex : rHex}${gHex.length === 1 ? '0' + gHex : gHex}${bHex.length === 1 ? '0' + bHex : bHex}`;
}

class Cmdhandler {
    constructor(sendMethod) {
        this.sendMethod = sendMethod;
        this.stroboHoldInterval = null;
        this.pauseHoldInterval = null;
        this.status = {
            animation: null,
            solidColor: null, // #RRGGBB
        };
    }

    begin() {
        this.requestAnimations();
        this.makeStroboHtml();
        this.makeSolidColorSelectorHTML();
        this.getStatus();
    }

    sendJSON(json) {
        this.sendMethod(JSON.stringify(json));
    }

    parseCommand(event) {
        const {data} = event;
        try {
            const cmd = JSON.parse(data);
            this.handleCommand(cmd);
        } catch (e) {
            console.log(e)
        }
    }

    handleCommand(command) {
        if (command.hasOwnProperty('ping')) {
            return;
        }

        switch (command.c) {
            case 'l':
                this.handleList(command);
                break;
            case 's':
                this.handleStatus(command);
                break;
            default:
                console.log(`Unknown command "${command.c}"`, command);
        }
    }

    handleAnimationChange(event) {
        const {value} = event.target;
        this.sendJSON({c: 'a', a: value});
    }

    handleList(command) {
        const {a} = command;
        const animations = document.getElementById('animations');
        animations.innerHTML = '';
        const form = document.createElement('form');
        const inputGroup = document.createElement('div');
        inputGroup.classList.add('input-group');
        const span = document.createElement('span');
        span.classList.add('input-group-text');
        span.innerHTML = 'Animation';
        const select = document.createElement('select');
        select.classList.add('form-control');
        select.classList.add('needs-animation');
        a.forEach((animation) => {
            const option = document.createElement('option');
            option.value = animation;
            option.innerHTML = animation;
            select.appendChild(option);
        });
        select.onchange = (e) => {
            this.handleAnimationChange(e);
        };
        inputGroup.appendChild(span);
        inputGroup.appendChild(select);
        form.appendChild(inputGroup);
        animations.innerHTML = '';
        animations.appendChild(form);
    }

    handleStatus(command) {
        const {animation, solidColor} = command;
        this.status.animation = animation;
        this.status.solidColor = solidColor;
        console.log(this.status);
        this.updateStatus();
    }

    updateStatus() {
        const {r, g, b} = convertHexToRGB(this.status.solidColor);
        const inputsColorNeededElements = document.querySelectorAll('input.needs-color');
        inputsColorNeededElements.forEach((element) => {
            element.value = element.dataset.color === 'c' ? this.status.solidColor : element.dataset.color === 'r' ? r : element.dataset.color === 'g' ? g : b;
        });

        const selectAnimation = document.querySelector('select.needs-animation');
        selectAnimation.value = this.status.animation;
    }

    makeStroboHtml() {
        const container = document.getElementById('strobo');
        const form = document.createElement('form');
        const inputGroup = document.createElement('div');
        inputGroup.classList.add('input-group');
        const span = document.createElement('span');
        span.classList.add('input-group-text');
        span.innerHTML = 'Strobo';
        const input = document.createElement('input');
        input.type = 'number';
        input.value = 100;
        input.classList.add('form-control');
        const button = document.createElement('button');
        button.classList.add('btn', 'btn-primary');
        button.innerHTML = 'Strobo!!';
        button.onclick = (e) => {
            e.preventDefault();
            this.sendStrobo(parseInt(input.value));
        };
        const fancyButton = document.createElement('button');
        fancyButton.classList.add('btn', 'btn-primary');
        fancyButton.innerHTML = 'Fancy Strobo!!';
        fancyButton.onclick = (e) => {
            e.preventDefault();
            this.sendStrobo(parseInt(input.value), true);
        };
        const stroboHoldButton = document.createElement('button');
        stroboHoldButton.classList.add('btn', 'btn-primary');
        stroboHoldButton.innerHTML = 'Strobo Hold';
        stroboHoldButton.onmousedown = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.pressStrobo();
        };
        stroboHoldButton.onmouseup = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.releaseStrobo();
        };
        stroboHoldButton.onmouseleave = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.releaseStrobo();
        };
        stroboHoldButton.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };
        const pauseHoldButton = document.createElement('button');
        pauseHoldButton.classList.add('btn', 'btn-primary');
        pauseHoldButton.innerHTML = 'Pause';
        pauseHoldButton.onmousedown = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.pressPause();
        };
        pauseHoldButton.onmouseup = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.releasePause();
        };
        pauseHoldButton.onmouseleave = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.releasePause();
        };
        pauseHoldButton.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };
        const fancyHoldButton = document.createElement('button');
        fancyHoldButton.classList.add('btn', 'btn-primary');
        fancyHoldButton.innerHTML = 'Fancy Strobo Hold';
        fancyHoldButton.onmousedown = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.pressStrobo(true);
        };
        fancyHoldButton.onmouseup = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.releaseStrobo(true);
        };
        fancyHoldButton.onmouseleave = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.releaseStrobo(true);
        };
        fancyHoldButton.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };
        const pauseStutterButton = document.createElement('button');
        pauseStutterButton.classList.add('btn', 'btn-primary');
        pauseStutterButton.innerHTML = 'Pause Stutter';
        pauseStutterButton.onmousedown = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.pressPauseStutter();
        };
        pauseStutterButton.onmouseup = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.releasePauseStutter();
        };
        pauseStutterButton.onmouseleave = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.releasePauseStutter();
        };
        pauseStutterButton.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };
        inputGroup.appendChild(span);
        inputGroup.appendChild(input);
        inputGroup.appendChild(button);
        inputGroup.appendChild(fancyButton);
        inputGroup.appendChild(stroboHoldButton);
        inputGroup.appendChild(fancyHoldButton);
        inputGroup.appendChild(pauseHoldButton);
        inputGroup.appendChild(pauseStutterButton);
        form.appendChild(inputGroup);
        container.innerHTML = '';
        container.appendChild(form);
    }

    makeSolidColorSelectorHTML() {
        const container = document.getElementById('solid-color');
        const form = document.createElement('form');
        const inputGroup = document.createElement('div');
        inputGroup.classList.add('input-group');
        const span = document.createElement('span');
        span.classList.add('input-group-text');
        span.innerHTML = 'Color';
        const inputR = document.createElement('input');
        inputR.type = 'number';
        inputR.value = 0;
        inputR.classList.add('form-control');
        inputR.classList.add('needs-color');
        inputR.dataset.color = 'r';
        const inputG = document.createElement('input');
        inputG.type = 'number';
        inputG.value = 0;
        inputG.classList.add('form-control');
        inputG.classList.add('needs-color');
        inputG.dataset.color = 'g';
        const inputB = document.createElement('input');
        inputB.type = 'number';
        inputB.value = 0;
        inputB.classList.add('form-control');
        inputB.classList.add('needs-color');
        inputB.dataset.color = 'b';
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.classList.add('form-control');
        colorInput.classList.add('form-control-color');
        colorInput.classList.add('needs-color');
        colorInput.dataset.color = 'c';
        colorInput.onchange = (e) => {
            const {value} = e.target;
            const r = parseInt(value.substr(1, 2), 16);
            const g = parseInt(value.substr(3, 2), 16);
            const b = parseInt(value.substr(5, 2), 16);
            this.solidColor(convertRGBToHex(r, g, b));
        };
        const button = document.createElement('button');
        button.classList.add('btn', 'btn-primary');
        button.innerHTML = 'Solid Color';
        button.onclick = (e) => {
            e.preventDefault();
            this.solidColor(convertRGBToHex(parseInt(inputR.value), parseInt(inputG.value), parseInt(inputB.value)));
        };
        inputGroup.appendChild(span);
        inputGroup.appendChild(inputR);
        inputGroup.appendChild(inputG);
        inputGroup.appendChild(inputB);
        inputGroup.appendChild(colorInput);
        inputGroup.appendChild(button);
        form.appendChild(inputGroup);
        container.innerHTML = '';
        container.appendChild(form);
    }

    requestAnimations() {
        this.sendJSON({c: 'l'});
    }

    sendStrobo(duration, fancy = false) {
        this.sendJSON({c: 's', d: duration, f: fancy});
    }

    solidColor(hex) {
        // set values in html
        const { r, g, b } = convertHexToRGB(hex);
        const inputsColorNeededElements = document.querySelectorAll('input.needs-color');
        inputsColorNeededElements.forEach((element) => {
            const value = element.dataset.color === 'c' ? `#${r}${g}${b}` : element.dataset.color === 'r' ? r : element.dataset.color === 'g' ? g : b;
            console.log(element, value);
            element.value = value;
        });

        this.sendJSON({c: 'c', r, g, b});
    }

    pressStrobo(fancy) {
        const func = () => {
            this.sendStrobo(1000, fancy);
        };
        this.stroboHoldInterval = setInterval(func, 500);
        func();
    }

    releaseStrobo(fancy = false) {
        if (!this.stroboHoldInterval) {
            return;
        }
        clearInterval(this.stroboHoldInterval);
        this.stroboHoldInterval = null;
        this.sendStrobo(0, fancy);
    }

    getStatus() {
        this.sendJSON({c: '_'});
    }

    pressPause() {
        const func = () => {
            this.sendJSON({c: 'p', p: true});
        };
        this.pauseHoldInterval = setInterval(func, 500);
        func();
    }

    releasePause() {
        if (!this.pauseHoldInterval) {
            return;
        }
        clearInterval(this.pauseHoldInterval);
        this.pauseHoldInterval = null;
        this.sendJSON({c: 'p', p: false});
    }

    pressPauseStutter() {
        const func = () => {
            this.sendJSON({c: 'p', p: true});

            setTimeout(() => {
                this.sendJSON({c: 'p', p: false});
            }, 350);
        };

        this.pauseHoldInterval = setInterval(func, 400);
        func();
    }

    releasePauseStutter() {
        if (!this.pauseHoldInterval) {
            return;
        }
        clearInterval(this.pauseHoldInterval);
        this.pauseHoldInterval = null;
        this.sendJSON({c: 'p', p: false});
    }
}
