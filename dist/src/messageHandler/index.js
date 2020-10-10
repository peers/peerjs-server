"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enums_1 = require("../enums");
const handlers_1 = require("./handlers");
const handlersRegistry_1 = require("./handlersRegistry");
class MessageHandler {
    constructor(realm, handlersRegistry = new handlersRegistry_1.HandlersRegistry()) {
        this.handlersRegistry = handlersRegistry;
        const transmissionHandler = handlers_1.TransmissionHandler({ realm });
        const heartbeatHandler = handlers_1.HeartbeatHandler;
        const handleTransmission = (client, { type, src, dst, payload }) => {
            return transmissionHandler(client, {
                type,
                src,
                dst,
                payload,
            });
        };
        const handleHeartbeat = (client, message) => heartbeatHandler(client, message);
        this.handlersRegistry.registerHandler(enums_1.MessageType.HEARTBEAT, handleHeartbeat);
        this.handlersRegistry.registerHandler(enums_1.MessageType.OFFER, handleTransmission);
        this.handlersRegistry.registerHandler(enums_1.MessageType.ANSWER, handleTransmission);
        this.handlersRegistry.registerHandler(enums_1.MessageType.CANDIDATE, handleTransmission);
        this.handlersRegistry.registerHandler(enums_1.MessageType.LEAVE, handleTransmission);
        this.handlersRegistry.registerHandler(enums_1.MessageType.EXPIRE, handleTransmission);
    }
    handle(client, message) {
        return this.handlersRegistry.handle(client, message);
    }
}
exports.MessageHandler = MessageHandler;
