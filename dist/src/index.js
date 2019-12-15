"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const api_1 = require("./api");
const config_1 = __importDefault(require("./config"));
const messageHandler_1 = require("./messageHandler");
const realm_1 = require("./models/realm");
const checkBrokenConnections_1 = require("./services/checkBrokenConnections");
const messagesExpire_1 = require("./services/messagesExpire");
const webSocketServer_1 = require("./services/webSocketServer");
const init = ({ app, server, options }) => {
    const config = options;
    const realm = new realm_1.Realm();
    const messageHandler = new messageHandler_1.MessageHandler(realm);
    const api = api_1.Api({ config, realm, messageHandler });
    const messagesExpire = new messagesExpire_1.MessagesExpire({ realm, config, messageHandler });
    const checkBrokenConnections = new checkBrokenConnections_1.CheckBrokenConnections({
        realm,
        config,
        onClose: (client) => {
            app.emit("disconnect", client);
        }
    });
    app.use(options.path, api);
    const wss = new webSocketServer_1.WebSocketServer({
        server,
        realm,
        config
    });
    wss.on("connection", (client) => {
        const messageQueue = realm.getMessageQueueById(client.getId());
        if (messageQueue) {
            let message;
            // tslint:disable
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
function ExpressPeerServer(server, options) {
    const app = express_1.default();
    const newOptions = Object.assign(Object.assign({}, config_1.default), options);
    if (newOptions.proxied) {
        app.set("trust proxy", newOptions.proxied === "false" ? false : !!newOptions.proxied);
    }
    app.on("mount", () => {
        if (!server) {
            throw new Error("Server is not passed to constructor - " +
                "can't start PeerServer");
        }
        init({ app, server, options: newOptions });
    });
    return app;
}
exports.ExpressPeerServer = ExpressPeerServer;
function PeerServer(options = {}, callback) {
    const app = express_1.default();
    const newOptions = Object.assign(Object.assign({}, config_1.default), options);
    let path = newOptions.path;
    const port = newOptions.port;
    if (path[0] !== "/") {
        path = "/" + path;
    }
    if (path[path.length - 1] !== "/") {
        path += "/";
    }
    let server;
    if (newOptions.ssl && newOptions.ssl.key && newOptions.ssl.cert) {
        server = https_1.default.createServer(options.ssl, app);
        // @ts-ignore
        delete newOptions.ssl;
    }
    else {
        server = http_1.default.createServer(app);
    }
    const peerjs = ExpressPeerServer(server, newOptions);
    app.use(peerjs);
    if (callback) {
        server.listen(port, () => callback(server));
    }
    else {
        server.listen(port);
    }
    return peerjs;
}
exports.PeerServer = PeerServer;
