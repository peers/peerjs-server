module.exports.Errors = {
  INVALID_KEY: 'Invalid key provided',
  INVALID_TOKEN: 'Invalid token provided',
  INVALID_WS_PARAMETERS: 'No id, token, or key supplied to websocket server',
  CONNECTION_LIMIT_EXCEED: 'Server has reached its concurrent user limit'
};

module.exports.MessageType = {
  OPEN: 'OPEN',
  LEAVE: 'LEAVE',
  CANDIDATE: 'CANDIDATE',
  OFFER: 'OFFER',
  ANSWER: 'ANSWER',
  EXPIRE: 'EXPIRE',
  HEARTBEAT: 'HEARTBEAT',
  ID_TAKEN: 'ID-TAKEN',
  ERROR: 'ERROR'
};
