"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
exports.default = ({ realm, messageHandler }) => {
    const app = express_1.default.Router();
    const handle = (req, res, next) => {
        const { id } = req.params;
        if (!id)
            return next();
        const client = realm.getClientById(id);
        if (!client) {
            throw new Error(`client not found:${id}`);
        }
        const { type, dst, payload } = req.body;
        const message = {
            type,
            src: id,
            dst,
            payload
        };
        messageHandler.handle(client, message);
        res.sendStatus(200);
    };
    app.post("/offer", handle);
    app.post("/candidate", handle);
    app.post("/answer", handle);
    app.post("/leave", handle);
    return app;
};
