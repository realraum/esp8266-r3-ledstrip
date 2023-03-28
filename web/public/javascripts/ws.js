class ReconnectingWebSocket {
    constructor(url, protocols) {
        this.statusText = document.getElementById('status-text');
        this.statusText.innerHTML = "Connecting...";

        this.url = url;
        this.protocols = protocols;
        this.reconnectInterval = 1000;
        this.onopen = function (event) { };
        this.onclose = function (event) { };
        this.onmessage = function (event) { };
        this.onerror = function (event) { };
        this.toLog = function (message) { };
        this.connect(false);
        this.lastMessage = 0;

        setInterval(() => {
            if (this.ws.readyState === WebSocket.OPEN && Date.now() - this.lastMessage > 5000) {
                this.reconnect();
            }
        }, 1000);
    }

    connect(reconnectAttempt) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.toLog("WebSocket already connected.");
            return;
        }
        console.log(`Connecting to ${this.url}...`);
        this.statusText.innerHTML = "Connecting...";
        this.ws = new WebSocket(this.url, this.protocols);
        this.ws.onopen = (event) => {
            this.onopen(event);
            this.toLog("WebSocket connected.");
            this.statusText.innerHTML = "Connected";
            if (reconnectAttempt) {
                this.reconnectInterval = 1000;
            }
        };
        this.ws.onclose = (event) => {
            this.onclose(event);
            this.reconnect();
            this.statusText.innerHTML = "Disconnected";
        };
        this.ws.onmessage = (event) => {
            this.onmessage(event);
            this.toLog(`[==>] ${event.data}`);
            this.lastMessage = Date.now();
        };
        this.ws.onerror = (event) => {
            this.onerror(event);
            this.toLog(`WebSocket error. ${JSON.stringify(event)}`);
            this.reconnect();
            this.statusText.innerHTML = "Disconnected";
        };
    }

    reconnect() {
        setTimeout(() => {
            this.reconnectInterval *= 2;
            this.connect(true);
        }, this.reconnectInterval);
    }

    forceReconnect() {
        this.close();
        this.connect(true);
    }

    send(data) {
        this.ws.send(data);
        this.toLog(`[<==] ${data}`);
    }

    close() {
        this.ws.close();
        this.toLog("WebSocket closed.");
    }
}

function getQueryVariable(variable) {
    const query = window.location.search.substring(1);
    const vars = query.split("&");
    for (let i = 0; i < vars.length; i++) {
        const pair = vars[i].split("=");
        if (pair[0] === variable) { return pair[1]; }
    }
    return false;
}

window.addEventListener("load", () => {
    const log = document.getElementById("ws-log");
    log.innerHTML = "";
    const ws = new ReconnectingWebSocket(`ws://${getQueryVariable("connection")}/ws`);
    ws.toLog = (message) => {
        log.innerHTML += `${(new Date()).toISOString()} ${message}\n`;
        log.scrollTop = log.scrollHeight;
    }

    const send = (data) => {
        ws.send(data);
    };

    window.cmdHandler = new Cmdhandler(send);
    ws.onmessage = (event) => { window.cmdHandler.parseCommand(event) };
    ws.onopen = (event) => { window.cmdHandler.begin(); };

    const reconnectButton = document.getElementById("reconnect");
    reconnectButton.addEventListener("click", () => {
        ws.forceReconnect();
    });
});
