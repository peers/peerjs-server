const logger = require('../services/logger');
const MessageType = require('../enums');
const transmissionHandler = require('./handlers/transmission');

const handlers = {};

const registerHandler = (messageType, handler) => {
  handlers[messageType] = handler;
};

module.exports = (client, message) => {
  const { type } = message;

  const handler = handlers[type];

  if (!handler) {
    return logger.error('Message unrecognized');
  }

  handler(client, message);
};

const handleTransmission = (client, message) => {
  transmissionHandler(client, {
    type: message.type,
    src: client.getId(),
    dst: message.dst,
    payload: message.payload
  });
};

const handleHeartbeat = (client, message) => {

};

registerHandler(MessageType.HEARTBEAT, handleHeartbeat);
registerHandler(MessageType.OFFER, handleTransmission);
registerHandler(MessageType.ANSWER, handleTransmission);
registerHandler(MessageType.CANDIDATE, handleTransmission);
registerHandler(MessageType.LEAVE, handleTransmission);
