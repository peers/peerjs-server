"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Errors;
(function (Errors) {
    Errors["INVALID_KEY"] = "Invalid key provided";
    Errors["INVALID_TOKEN"] = "Invalid token provided";
    Errors["INVALID_WS_PARAMETERS"] = "No id, token, or key supplied to websocket server";
    Errors["CONNECTION_LIMIT_EXCEED"] = "Server has reached its concurrent user limit";
})(Errors = exports.Errors || (exports.Errors = {}));
var MessageType;
(function (MessageType) {
    MessageType["OPEN"] = "OPEN";
    MessageType["LEAVE"] = "LEAVE";
    MessageType["CANDIDATE"] = "CANDIDATE";
    MessageType["OFFER"] = "OFFER";
    MessageType["ANSWER"] = "ANSWER";
    MessageType["EXPIRE"] = "EXPIRE";
    MessageType["HEARTBEAT"] = "HEARTBEAT";
    MessageType["ID_TAKEN"] = "ID-TAKEN";
    MessageType["ERROR"] = "ERROR";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
