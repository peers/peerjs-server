"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MessageQueue {
    constructor() {
        this.lastReadAt = new Date().getTime();
        this.messages = [];
    }
    getLastReadAt() {
        return this.lastReadAt;
    }
    addMessage(message) {
        this.messages.push(message);
    }
    readMessage() {
        if (this.messages.length > 0) {
            this.lastReadAt = new Date().getTime();
            return this.messages.shift();
        }
        return undefined;
    }
    getMessages() {
        return this.messages;
    }
}
exports.MessageQueue = MessageQueue;
