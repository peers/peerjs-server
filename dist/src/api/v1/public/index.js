"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
exports.default = ({ config, realm }) => {
    const app = express_1.default.Router();
    // Retrieve guaranteed random ID.
    app.get("/id", (_, res) => {
        res.contentType("html");
        res.send(realm.generateClientId(config.generateClientId));
    });
    // Get a list of all peers for a key, enabled by the `allowDiscovery` flag.
    app.get("/peers", (_, res) => {
        if (config.allow_discovery) {
            const clientsIds = realm.getClientsIds();
            return res.send(clientsIds);
        }
        res.sendStatus(401);
    });
    return app;
};
