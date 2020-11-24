"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesExpire = void 0;
const enums_1 = require("../../enums");
class MessagesExpire {
    constructor({ realm, config, messageHandler }) {
        this.timeoutId = null;
        this.realm = realm;
        this.config = config;
        this.messageHandler = messageHandler;
    }
    startMessagesExpiration() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        // Clean up outstanding messages
        this.timeoutId = setTimeout(() => {
            this.pruneOutstanding();
            this.timeoutId = null;
            this.startMessagesExpiration();
        }, this.config.cleanup_out_msgs);
    }
    stopMessagesExpiration() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }
    pruneOutstanding() {
        const destinationClientsIds = this.realm.getClientsIdsWithQueue();
        const now = new Date().getTime();
        const maxDiff = this.config.expire_timeout;
        const seen = {};
        for (const destinationClientId of destinationClientsIds) {
            const messageQueue = this.realm.getMessageQueueById(destinationClientId);
            if (!messageQueue)
                continue;
            const lastReadDiff = now - messageQueue.getLastReadAt();
            if (lastReadDiff < maxDiff)
                continue;
            const messages = messageQueue.getMessages();
            for (const message of messages) {
                const seenKey = `${message.src}_${message.dst}`;
                if (!seen[seenKey]) {
                    this.messageHandler.handle(undefined, {
                        type: enums_1.MessageType.EXPIRE,
                        src: message.dst,
                        dst: message.src
                    });
                    seen[seenKey] = true;
                }
            }
            this.realm.clearMessageQueue(destinationClientId);
        }
    }
}
exports.MessagesExpire = MessagesExpire;
