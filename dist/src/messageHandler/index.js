"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enums_1 = require("../enums");
const handlers_1 = require("./handlers");
const messageHandlers_1 = require("./messageHandlers");
class MessageHandler {
    constructor(realm) {
        this.messageHandlers = new messageHandlers_1.MessageHandlers();
        const transmissionHandler = handlers_1.TransmissionHandler({ realm });
        const heartbeatHandler = handlers_1.HeartbeatHandler;
        const handleTransmission = (client, message) => {
            return transmissionHandler(client, {
                type: message.type,
                src: message.src,
                dst: message.dst,
                payload: message.payload
            });
        };
        const handleHeartbeat = (client, message) => heartbeatHandler(client, message);
        this.messageHandlers.registerHandler(enums_1.MessageType.HEARTBEAT, handleHeartbeat);
        this.messageHandlers.registerHandler(enums_1.MessageType.OFFER, handleTransmission);
        this.messageHandlers.registerHandler(enums_1.MessageType.ANSWER, handleTransmission);
        this.messageHandlers.registerHandler(enums_1.MessageType.CANDIDATE, handleTransmission);
        this.messageHandlers.registerHandler(enums_1.MessageType.LEAVE, handleTransmission);
        this.messageHandlers.registerHandler(enums_1.MessageType.EXPIRE, handleTransmission);
    }
    handle(client, message) {
        return this.messageHandlers.handle(client, message);
    }
}
exports.MessageHandler = MessageHandler;
