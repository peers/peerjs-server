"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(client) {
    const nowTime = new Date().getTime();
    client.setLastPing(nowTime);
    return true;
}
exports.default = default_1;
