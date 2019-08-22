"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enums_1 = require("../../../enums");
function default_1({ realm }) {
    const handle = (client, message) => {
        const type = message.type;
        const srcId = message.src;
        const dstId = message.dst;
        const destinationClient = realm.getClientById(dstId);
        // User is connected!
        if (destinationClient) {
            try {
                if (destinationClient.getSocket()) {
                    const data = JSON.stringify(message);
                    destinationClient.getSocket().send(data);
                }
                else {
                    // Neither socket no res available. Peer dead?
                    throw new Error("Peer dead");
                }
            }
            catch (e) {
                // This happens when a peer disconnects without closing connections and
                // the associated WebSocket has not closed.
                // Tell other side to stop trying.
                if (destinationClient.getSocket()) {
                    destinationClient.getSocket().close();
                }
                else {
                    realm.removeClientById(destinationClient.getId());
                }
                handle(client, {
                    type: enums_1.MessageType.LEAVE,
                    src: dstId,
                    dst: srcId
                });
            }
        }
        else {
            // Wait for this client to connect/reconnect (XHR) for important
            // messages.
            if (type !== enums_1.MessageType.LEAVE && type !== enums_1.MessageType.EXPIRE && dstId) {
                realm.addMessageToQueue(dstId, message);
            }
            else if (type === enums_1.MessageType.LEAVE && !dstId) {
                realm.removeClientById(srcId);
            }
            else {
                // Unavailable destination specified with message LEAVE or EXPIRE
                // Ignore
            }
        }
        return true;
    };
    return handle;
}
exports.default = default_1;
