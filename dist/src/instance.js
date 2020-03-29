"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const realm_1 = require("./models/realm");
const checkBrokenConnections_1 = require("./services/checkBrokenConnections");
const messagesExpire_1 = require("./services/messagesExpire");
const webSocketServer_1 = require("./services/webSocketServer");
const messageHandler_1 = require("./messageHandler");
const api_1 = require("./api");
exports.createInstance = ({ app, server, options }) => {
    const config = options;
    const realm = new realm_1.Realm();
    const messageHandler = new messageHandler_1.MessageHandler(realm);
    const api = api_1.Api({ config, realm, messageHandler });
    const messagesExpire = new messagesExpire_1.MessagesExpire({ realm, config, messageHandler });
    const checkBrokenConnections = new checkBrokenConnections_1.CheckBrokenConnections({
        realm,
        config,
        onClose: client => {
            app.emit("disconnect", client);
        }
    });
    app.use(options.path, api);
    //use mountpath for WS server
    const customConfig = Object.assign(Object.assign({}, config), { path: path_1.default.posix.join(app.path(), options.path, '/') });
    const wss = new webSocketServer_1.WebSocketServer({
        server,
        realm,
        config: customConfig
    });
    wss.on("connection", (client) => {
        const messageQueue = realm.getMessageQueueById(client.getId());
        if (messageQueue) {
            let message;
            while (message = messageQueue.readMessage()) {
                messageHandler.handle(client, message);
            }
            realm.clearMessageQueue(client.getId());
        }
        app.emit("connection", client);
    });
    wss.on("message", (client, message) => {
        app.emit("message", client, message);
        messageHandler.handle(client, message);
    });
    wss.on("close", (client) => {
        app.emit("disconnect", client);
    });
    wss.on("error", (error) => {
        app.emit("error", error);
    });
    messagesExpire.startMessagesExpiration();
    checkBrokenConnections.start();
};
