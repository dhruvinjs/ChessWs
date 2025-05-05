"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const GameManager_1 = require("./Classes/GameManager");
const server = new ws_1.WebSocketServer({ port: 8008 });
const gameManager = new GameManager_1.GameManager();
let allSockets = [];
server.on('connection', (socket) => {
    socket.send("Helo connection");
    gameManager.addUser(socket);
    server.on('disconnect', (socket) => gameManager.removeUser(socket));
});
