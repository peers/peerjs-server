"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Client {
    constructor({ id, token }) {
        this.socket = null;
        this.lastPing = new Date().getTime();
        this.id = id;
        this.token = token;
    }
    getId() {
        return this.id;
    }
    getToken() {
        return this.token;
    }
    getSocket() {
        return this.socket;
    }
    setSocket(socket) {
        this.socket = socket;
    }
    getLastPing() {
        return this.lastPing;
    }
    setLastPing(lastPing) {
        this.lastPing = lastPing;
    }
    send(data) {
        this.socket.send(JSON.stringify(data));
    }
}
exports.Client = Client;
