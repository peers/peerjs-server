"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HandlersRegistry {
    constructor() {
        this.handlers = new Map();
    }
    registerHandler(messageType, handler) {
        if (this.handlers.has(messageType))
            return;
        this.handlers.set(messageType, handler);
    }
    handle(client, message) {
        const { type } = message;
        const handler = this.handlers.get(type);
        if (!handler)
            return false;
        return handler(client, message);
    }
}
exports.HandlersRegistry = HandlersRegistry;
