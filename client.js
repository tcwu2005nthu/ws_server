// JavaScript source code
const WebSocket = require("ws");
let ws = new WebSocket("ws://localhost:8000");
ws.onopen = () => {
    console.log("opened");
};

ws.onmessage = (m) => {
    console.log(m.data);
};

ws.onclose = () => {
    console.log("closed");
};