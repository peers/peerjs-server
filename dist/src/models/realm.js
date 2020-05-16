"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const v4_1 = __importDefault(require("uuid/v4"));
const messageQueue_1 = require("./messageQueue");
const utils_1 = require("../utils");
const Redis = require("ioredis");
// const redisPub = new Redis();
const redisSub = new Redis();
class Realm {
    constructor() {
        this.clients = new Map();
        this.messageQueues = new Map();
        redisSub.subscribe("clients", (err) => {
            if (!err)
                utils_1.clog("Subscribed to Clients");
        });
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
        console.log("Getting MessageQueue");
        return this.messageQueues.get(id);
    }
    addMessageToQueue(id, message) {
        console.log("Add MessageQueue");
        if (!this.getMessageQueueById(id)) {
            this.messageQueues.set(id, new messageQueue_1.MessageQueue());
        }
        this.getMessageQueueById(id).addMessage(message);
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
        console.log("Generate ID", clientId);
        return clientId;
    }
}
exports.Realm = Realm;
