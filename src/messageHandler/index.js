const { MessageType } = require('../enums');

class MessageHandlers {
  constructor() {
    this.handlers = {};
  }

  registerHandler(messageType, handler) {
    this.handlers[messageType] = handler;
  }

  handle(client, message) {
    const { type } = message;

    const handler = this.handlers[type];

    if (!handler) {
      return;
    }

    handler(client, message);
  }
}
module.exports = ({ realm }) => {
  const transmissionHandler = require('./handlers/transmission')({ realm });
  const heartbeatHandler = require('./handlers/heartbeat');

  const messageHandlers = new MessageHandlers();

  const handleTransmission = (client, message) => {
    transmissionHandler(client, {
      type: message.type,
      src: message.src,
      dst: message.dst,
      payload: message.payload
    });
  };

  const handleHeartbeat = (client) => heartbeatHandler(client);

  messageHandlers.registerHandler(MessageType.HEARTBEAT, handleHeartbeat);
  messageHandlers.registerHandler(MessageType.OFFER, handleTransmission);
  messageHandlers.registerHandler(MessageType.ANSWER, handleTransmission);
  messageHandlers.registerHandler(MessageType.CANDIDATE, handleTransmission);
  messageHandlers.registerHandler(MessageType.LEAVE, handleTransmission);
  messageHandlers.registerHandler(MessageType.EXPIRE, handleTransmission);

  return (client, message) => messageHandlers.handle(client, message);
};
