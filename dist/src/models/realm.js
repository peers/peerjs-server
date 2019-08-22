"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        if (!client) {
            return false;
        }
        this.clients.delete(id);
        return true;
    }
    getMessageQueueById(id) {
        return this.messageQueues.get(id);
    }
    addMessageToQueue(id, message) {
        if (!this.getMessageQueueById(id)) {
            this.messageQueues.set(id, new messageQueue_1.MessageQueue());
        }
        this.getMessageQueueById(id).addMessage(message);
    }
    clearMessageQueue(id) {
        this.messageQueues.delete(id);
    }
    generateClientId() {
        const randomId = () => (Math.random().toString(36) + "0000000000000000000").substr(2, 16);
        let clientId = randomId();
        while (this.getClientById(clientId)) {
            clientId = randomId();
        }
        return clientId;
    }
}
exports.Realm = Realm;
