class Cmdhandler {
    constructor(sendMethod) {
        this.sendMethod = sendMethod;
    }

    begin() {
        this.requestAnimations();
        this.makeStroboHtml();
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
            default:
                console.log('Unknown command', command);
        }
    }

    handleAnimationChange(event) {
        const {value} = event.target;
        this.sendJSON({c: 'a', a: value});
    }

    handleList(command) {
        const {a} = command;
        const animations = document.getElementById('animations');
        // form select. animations is empty div, also create <form>
        animations.innerHTML = '';
        /*const form = document.createElement('form');
        const select = document.createElement('select');
        select.classList.add('form-control');
        select.onchange = (e) => {
            this.handleAnimationChange(e)
        };
        a.forEach((animation) => {
            const option = document.createElement('option');
            option.value = animation;
            option.innerHTML = animation;
            select.appendChild(option);
        });
        form.appendChild(select);
        animations.appendChild(form);*/

        // use bootstrap with input-group (span + select)
        const form = document.createElement('form');
        const inputGroup = document.createElement('div');
        inputGroup.classList.add('input-group');
        const span = document.createElement('span');
        span.classList.add('input-group-text');
        span.innerHTML = 'Animation';
        const select = document.createElement('select');
        select.classList.add('form-control');
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

    makeStroboHtml() {
        const container = document.getElementById('strobo');
        /*const form = document.createElement('form');
        const input = document.createElement('input');
        input.type = 'number';
        input.value = 100;
        const button = document.createElement('button');
        button.innerHTML = 'Strobo';
        form.onsubmit = (e) => {
            e.preventDefault();
            this.sendStrobo(parseInt(input.value));
        };
        form.appendChild(input);
        form.appendChild(button);
        container.innerHTML = '';
        container.appendChild(form);*/

        // bootstrap
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
        inputGroup.appendChild(span);
        inputGroup.appendChild(input);
        inputGroup.appendChild(button);
        form.appendChild(inputGroup);
        container.innerHTML = '';
        container.appendChild(form);
    }

    requestAnimations() {
        this.sendJSON({c: 'l'});
    }

    sendStrobo(duration) {
        this.sendJSON({c: 's', d: duration});
    }

    solidColor(r, g, b) {
        this.sendJSON({c: 'c', r, g, b});
    }
}
