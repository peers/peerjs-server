"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const enums_1 = require("../../../enums");
class AuthMiddleware {
    constructor(config, realm) {
        this.config = config;
        this.realm = realm;
        this.handle = (req, res, next) => {
            const { id, token, key } = req.params;
            if (key !== this.config.key) {
                return res.status(401).send(enums_1.Errors.INVALID_KEY);
            }
            if (!id) {
                return res.sendStatus(401);
            }
            const client = this.realm.getClientById(id);
            if (!client) {
                return res.sendStatus(401);
            }
            if (client.getToken() && token !== client.getToken()) {
                return res.status(401).send(enums_1.Errors.INVALID_TOKEN);
            }
            next();
        };
    }
}
exports.AuthMiddleware = AuthMiddleware;
