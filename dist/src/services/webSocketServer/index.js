"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("events"));
const url_1 = __importDefault(require("url"));
const ws_1 = __importDefault(require("ws"));
const enums_1 = require("../../enums");
const client_1 = require("../../models/client");
const utils_1 = require("../../utils");
const Redis = require("ioredis");
const os = require("os");
const redisHost = process.env.NODE_ENV === "development"
    ? "127.0.0.1"
    : "fmqueue.7piuva.ng.0001.use1.cache.amazonaws.com";
const redisPort = 6379;
// const redisPub = new Redis();
const redisSub = new Redis(redisPort, redisHost);
const redisPub = new Redis(redisPort, redisHost);
const WS_PATH = "peerjs";
class WebSocketServer extends events_1.default {
    constructor({ server, realm, config, }) {
        super();
        this.setMaxListeners(0);
        this.realm = realm;
        this.config = config;
        const path = this.config.path;
        this.path = `${path}${path.endsWith("/") ? "" : "/"}${WS_PATH}`;
        this.socketServer = new ws_1.default.Server({ path: this.path, server });
        this.socketServer.on("connection", (socket, req) => this._onSocketConnection(socket, req));
        this.socketServer.on("error", (error) => this._onSocketError(error));
        redisSub.subscribe("ws_message", (err) => {
            if (!err)
                utils_1.clog("Subscribed to WebSocket Messages");
        });
        redisSub.on("message", (channel, message) => {
            if (channel === "ws_message") {
                const { id = null, host = null, socket_message = null } = JSON.parse(message);
                utils_1.clog(`WS_MESSAGE::: ${message}`);
                if (host == os.hostname()) {
                    utils_1.clog("Same Host -------> Return");
                    return;
                }
                utils_1.clog("Parsing WS_MESSAGE and raising Event");
                const ws_message = JSON.parse(socket_message);
                ws_message.src = id;
                const other_client = this.realm.getClientById(id);
                this.emit("message", other_client, ws_message);
            }
        });
    }
    _onSocketConnection(socket, req) {
        const { query = {} } = url_1.default.parse(req.url, true);
        const { id, token, key } = query;
        if (!id || !token || !key) {
            return this._sendErrorAndClose(socket, enums_1.Errors.INVALID_WS_PARAMETERS);
        }
        if (key !== this.config.key) {
            return this._sendErrorAndClose(socket, enums_1.Errors.INVALID_KEY);
        }
        const client = this.realm.getClientById(id);
        if (client) {
            if (token !== client.getToken()) {
                // ID-taken, invalid token
                socket.send(JSON.stringify({
                    type: enums_1.MessageType.ID_TAKEN,
                    payload: { msg: "ID is taken" },
                }));
                return socket.close();
            }
            return this._configureWS(socket, client);
        }
        this._registerClient({ socket, id, token });
    }
    _onSocketError(error) {
        // handle error
        this.emit("error", error);
    }
    _registerClient({ socket, id, token, }) {
        // Check concurrent limit
        const clientsCount = this.realm.getClientsIds().length;
        if (clientsCount >= this.config.concurrent_limit) {
            return this._sendErrorAndClose(socket, enums_1.Errors.CONNECTION_LIMIT_EXCEED);
        }
        const newClient = new client_1.Client({ id, token });
        this.realm.setClient(newClient, id);
        socket.send(JSON.stringify({ type: enums_1.MessageType.OPEN }));
        this._configureWS(socket, newClient);
    }
    _configureWS(socket, client) {
        client.setSocket(socket);
        // Cleanup after a socket closes.
        socket.on("close", () => {
            if (client.getSocket() === socket) {
                this.realm.removeClientById(client.getId());
                this.emit("close", client);
            }
        });
        // Handle messages from peers.
        socket.on("message", (data) => {
            try {
                const message = JSON.parse(data);
                message.src = client.getId();
                redisPub.publish("ws_message", JSON.stringify({
                    id: client.getId(),
                    host: os.hostname(),
                    socket_message: message,
                }));
                this.emit("message", client, message);
            }
            catch (e) {
                this.emit("error", e);
            }
        });
        this.emit("connection", client);
    }
    _sendErrorAndClose(socket, msg) {
        socket.send(JSON.stringify({
            type: enums_1.MessageType.ERROR,
            payload: { msg },
        }));
        socket.close();
    }
}
exports.WebSocketServer = WebSocketServer;
