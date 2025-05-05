"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const Games_1 = require("./Games");
const messages_1 = require("../messages");
class GameManager {
    constructor() {
        this.users = [];
        this.pendingUser = null;
        this.games = [];
    }
    addUser(socket) {
        this.users.push(socket);
        this.addHandler(socket);
    }
    removeUser(socket) {
        this.users = this.users.filter(user => user !== socket);
    }
    addHandler(socket) {
        socket.on("message", (message) => {
            const jsonMessage = JSON.parse(message.toString());
            if (jsonMessage.type === messages_1.INIT_GAME) {
                console.log("Init Game message");
                if (this.pendingUser) {
                    // ✅ Case 1: A user is already waiting
                    const newGame = new Games_1.Games(this.pendingUser, socket); // Start a game between pending user and new socket
                    this.games.push(newGame); // Store the game
                    this.pendingUser = null; // Clear the pending slot
                }
                else {
                    // ✅ Case 2: No one is waiting
                    this.pendingUser = socket; // Save this user to wait for the next one
                }
            }
            if (jsonMessage.type === messages_1.MOVE) {
                console.log("INside move");
                const game = this.games.find(game => socket === game.user1 || game.user2);
                console.log(jsonMessage.payload);
                if (game) {
                    game.makeMove(socket, jsonMessage.payload);
                }
            }
        });
    }
}
exports.GameManager = GameManager;
