const realm = require('../../../services/realm');
const logger = require('../../../services/logger');
const { MessageType } = require('../../../enums');

const handler = (client, message) => {
  const type = message.type;
  const srcId = message.src;
  const dstId = message.dst;

  const destinationClient = realm.getClientById(dstId);

  // User is connected!
  if (destinationClient) {
    try {
      logger.debug(type, 'from', srcId, 'to', dstId);

      if (destinationClient.socket) {
        const data = JSON.stringify(message);

        destinationClient.socket.send(data);
      } else {
        // Neither socket no res available. Peer dead?
        throw new Error('Peer dead');
      }
    } catch (e) {
      logger.error(e);
      // This happens when a peer disconnects without closing connections and
      // the associated WebSocket has not closed.
      // Tell other side to stop trying.
      if (destinationClient.socket) {
        destinationClient.socket.close();
      } else {
        realm.removeClientById(destinationClient.getId());
      }

      handler(client, {
        type: MessageType.LEAVE,
        src: dstId,
        dst: srcId
      });
    }
  } else {
    // Wait for this client to connect/reconnect (XHR) for important
    // messages.
    if (type !== MessageType.LEAVE && type !== MessageType.EXPIRE && dstId) {
      logger.debug(`[transmission] dst client ${dstId} not found, add msg ${type} to queue`);
      realm.addMessageToQueue(dstId, message);
    } else if (type === MessageType.LEAVE && !dstId) {
      logger.debug(`[transmission] remove client ${srcId}`);
      realm.removeClientById(srcId);
    } else {
      // Unavailable destination specified with message LEAVE or EXPIRE
      // Ignore
    }
  }
};

module.exports = handler;
