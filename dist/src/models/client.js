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
        var _a;
        (_a = this.socket) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(data));
    }
}
exports.Client = Client;
