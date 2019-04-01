const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');

const config = require('../config');
const WebSocketServer = require('./services/webSocketServer');
const logger = require('./services/logger');
const api = require('./api');
const messageHandler = require('./messageHandler');
const realm = require('./services/realm');
const { MessageType } = require('./enums');

// parse config
let path = config.get('path');
const port = config.get('port');

if (path[0] !== '/') {
  path = '/' + path;
}

if (path[path.length - 1] !== '/') {
  path += '/';
}

const app = express();

if (config.get('proxied')) {
  app.set('trust proxy', config.get('proxied'));
}

let server;

if (config.get('ssl.key_path') && config.get('ssl.cert_path')) {
  const keyPath = config.get('ssl.key_path');
  const certPath = config.get('ssl.cert_path');

  const opts = {
    key: fs.readFileSync(path.resolve(keyPath)),
    cert: fs.readFileSync(path.resolve(certPath))
  };

  server = https.createServer(opts, app);
} else {
  server = http.createServer(app);
}

app.use(path, api);

const wss = new WebSocketServer(server, app.mountpath);

wss.on('connection', client => {
  const messages = realm.getMessageQueueById(client.getId());

  if (messages) {
    messages.forEach(message => messageHandler(client, message));
    realm.clearMessageQueue(client.getId());
  }

  logger.info(`client ${client.getId()} was connected`);
});

wss.on('message', (client, message) => {
  messageHandler(client, message);
});

wss.on('close', client => {
  logger.info(`client ${client.getId()} was disconnected`);
});

wss.on('error', error => {
  logger.error(error);
});

server.listen(port, () => {
  const host = server.address().address;
  const port = server.address().port;

  logger.info(
    'Started PeerServer on %s, port: %s',
    host, port
  );
});

const pruneOutstanding = () => {
  const destinationClientsIds = realm.messageQueue.keys();

  for (const destinationClientId of destinationClientsIds) {
    const messages = realm.getMessageQueueById(destinationClientId);

    const seen = {};

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
  }

  realm.messageQueue.clear();

  logger.debug(`message queue was cleared`);
};

// Clean up outstanding messages
setInterval(() => {
  pruneOutstanding();
}, config.get('cleanup_out_msgs'));
