const { MessageType } = require('../../enums');

module.exports = ({ realm, config, messageHandler }) => {
  const pruneOutstanding = () => {
    const destinationClientsIds = realm._messageQueues.keys();

    const now = new Date().getTime();
    const maxDiff = config.expire_timeout;

    const seen = {};

    for (const destinationClientId of destinationClientsIds) {
      const messageQueue = realm.getMessageQueueById(destinationClientId);
      const lastReadDiff = now - messageQueue.getLastReadAt();

      if (lastReadDiff < maxDiff) continue;

      const messages = messageQueue.getMessages();

      for (const message of messages) {
        if (!seen[message.src]) {
          messageHandler(null, {
            type: MessageType.EXPIRE,
            src: message.dst,
            dst: message.src
          });
          seen[message.src] = true;
        }
      }

      realm.clearMessageQueue(destinationClientId);
    }
  };

  let timeoutId;

  const startMessagesExpiration = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Clean up outstanding messages
    timeoutId = setTimeout(() => {
      pruneOutstanding();

      timeoutId = null;

      startMessagesExpiration();
    }, config.cleanup_out_msgs);
  };

  const stopMessagesExpiration = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return {
    startMessagesExpiration,
    stopMessagesExpiration
  };
};
