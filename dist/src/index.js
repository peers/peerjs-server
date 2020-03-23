"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const config_1 = __importDefault(require("./config"));
const instance_1 = require("./instance");
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
        instance_1.createInstance({ app, server, options: newOptions });
    });
    return app;
}
exports.ExpressPeerServer = ExpressPeerServer;
function PeerServer(options = {}, callback) {
    const app = express_1.default();
    const newOptions = Object.assign(Object.assign({}, config_1.default), options);
    const port = newOptions.port;
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
    server.listen(port, () => callback === null || callback === void 0 ? void 0 : callback(server));
    return peerjs;
}
exports.PeerServer = PeerServer;
