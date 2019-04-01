const config = require('../../../config');
const messageHandler = require('../../messageHandler');
const { MessageType } = require('../../enums');
const realm = require('../realm');
const logger = require('../logger');

const pruneOutstanding = () => {
  const destinationClientsIds = realm._messageQueues.keys();

  const now = new Date().getTime();
  const maxDiff = config.get('expire_timeout');

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

    logger.trace(`[MSGSEXPIRE] mq ${destinationClientId} was cleared`);
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
  }, config.get('cleanup_out_msgs'));
};

const stopMessagesExpiration = () => {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
};

module.exports = {
  startMessagesExpiration,
  stopMessagesExpiration
};
