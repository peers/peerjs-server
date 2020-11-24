"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Api = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const app_json_1 = __importDefault(require("../../app.json"));
const auth_1 = require("./middleware/auth");
const calls_1 = __importDefault(require("./v1/calls"));
const public_1 = __importDefault(require("./v1/public"));
const Api = ({ config, realm, messageHandler }) => {
    const authMiddleware = new auth_1.AuthMiddleware(config, realm);
    const app = express_1.default.Router();
    const jsonParser = body_parser_1.default.json();
    app.use(cors_1.default());
    app.get("/", (_, res) => {
        res.send(app_json_1.default);
    });
    app.use("/:key", public_1.default({ config, realm }));
    app.use("/:key/:id/:token", authMiddleware.handle, jsonParser, calls_1.default({ realm, messageHandler }));
    return app;
};
exports.Api = Api;
