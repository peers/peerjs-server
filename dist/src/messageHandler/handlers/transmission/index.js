"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransmissionHandler = void 0;
const enums_1 = require("../../../enums");
const TransmissionHandler = ({ realm }) => {
    const handle = (client, message) => {
        const type = message.type;
        const srcId = message.src;
        const dstId = message.dst;
        const destinationClient = realm.getClientById(dstId);
        // User is connected!
        if (destinationClient) {
            const socket = destinationClient.getSocket();
            try {
                if (socket) {
                    const data = JSON.stringify(message);
                    socket.send(data);
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
                if (socket) {
                    socket.close();
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
            const ignoredTypes = [enums_1.MessageType.LEAVE, enums_1.MessageType.EXPIRE];
            if (!ignoredTypes.includes(type) && dstId) {
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
};
exports.TransmissionHandler = TransmissionHandler;
