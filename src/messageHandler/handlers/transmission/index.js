const { MessageType } = require('../../../enums');

module.exports = ({ realm }) => (client, message) => {
  const type = message.type;
  const srcId = message.src;
  const dstId = message.dst;

  const destinationClient = realm.getClientById(dstId);

  // User is connected!
  if (destinationClient) {
    try {
      if (destinationClient.socket) {
        const data = JSON.stringify(message);

        destinationClient.socket.send(data);
      } else {
        // Neither socket no res available. Peer dead?
        throw new Error('Peer dead');
      }
    } catch (e) {
      // This happens when a peer disconnects without closing connections and
      // the associated WebSocket has not closed.
      // Tell other side to stop trying.
      if (destinationClient.socket) {
        destinationClient.socket.close();
      } else {
        realm.removeClientById(destinationClient.getId());
      }

      module.exports({ realm })(client, {
        type: MessageType.LEAVE,
        src: dstId,
        dst: srcId
      });
    }
  } else {
    // Wait for this client to connect/reconnect (XHR) for important
    // messages.
    if (type !== MessageType.LEAVE && type !== MessageType.EXPIRE && dstId) {
      realm.addMessageToQueue(dstId, message);
    } else if (type === MessageType.LEAVE && !dstId) {
      realm.removeClientById(srcId);
    } else {
      // Unavailable destination specified with message LEAVE or EXPIRE
      // Ignore
    }
  }
};
