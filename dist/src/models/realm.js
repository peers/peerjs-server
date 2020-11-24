"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Realm = void 0;
const v4_1 = __importDefault(require("uuid/v4"));
const messageQueue_1 = require("./messageQueue");
class Realm {
    constructor() {
        this.clients = new Map();
        this.messageQueues = new Map();
    }
    getClientsIds() {
        return [...this.clients.keys()];
    }
    getClientById(clientId) {
        return this.clients.get(clientId);
    }
    getClientsIdsWithQueue() {
        return [...this.messageQueues.keys()];
    }
    setClient(client, id) {
        this.clients.set(id, client);
    }
    removeClientById(id) {
        const client = this.getClientById(id);
        if (!client)
            return false;
        this.clients.delete(id);
        return true;
    }
    getMessageQueueById(id) {
        return this.messageQueues.get(id);
    }
    addMessageToQueue(id, message) {
        var _a;
        if (!this.getMessageQueueById(id)) {
            this.messageQueues.set(id, new messageQueue_1.MessageQueue());
        }
        (_a = this.getMessageQueueById(id)) === null || _a === void 0 ? void 0 : _a.addMessage(message);
    }
    clearMessageQueue(id) {
        this.messageQueues.delete(id);
    }
    generateClientId(generateClientId) {
        const generateId = generateClientId ? generateClientId : v4_1.default;
        let clientId = generateId();
        while (this.getClientById(clientId)) {
            clientId = generateId();
        }
        return clientId;
    }
}
exports.Realm = Realm;
