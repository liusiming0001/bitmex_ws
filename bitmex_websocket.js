var WebSocket = require("ws")
var EventEmitter = require('events').EventEmitter

var ws = null
var listener = new EventEmitter();
var reconnectLock = false;
var reconnectNum = 0;

function connect(url) {
    ws = new WebSocket(url);

    ws.onopen = function (evt) {
        console.log("ws is connected");
        reconectNum = 0;
        pingTask()
        listener.emit("connect", true)
        reconnectLock = false;
    };

    ws.onerror = function (err) {
        console.log("ws is error");
        reconnect()
        console.log(err);
        reconnectLock = false;
    }

    ws.onmessage = function (msg) {
        msgHandler(msg.data);
    };

    ws.onclose = function (evt) {
        console.log("ws is closed");
        reconnect()
        console.log(evt);
        reconnectLock = false;
    };
}

function reconnect() {
    if (reconnectLock) return
    reconnectLock = true
    reconnectNum++
    console.log("ws is reconnecting,reconnect count " + reconnectNum)
    setTimeout(function () {
        connect();
    }, 2000);
}

function subscribe(channel, filter) {
    if (!ws) return
    filter = filter ? ":" + filter : ""
    let sub = channel + filter
    ws.send(JSON.stringify({
        "op": "subscribe",
        "args": [sub]
    }))
}

function msgHandler(msg) {
    if (msg != "pong") {
        tableHandler(JSON.parse(msg))
    }
}

function tableHandler(msg) {
    listener.emit(msg.table, msg)
}

function pingTask() {
    setInterval(function () {
        if (!ws) return
        ws.send("ping")
    }, 5 * 1000)
}

module.exports = {
    ws,
    listener,
    connect,
    subscribe
}