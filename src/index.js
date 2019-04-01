const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');

const config = require('../config');
const WebSocketServer = require('./services/webSocketServer');
const logger = require('./services/logger');
const realm = require('./services/realm');
const { startMessagesExpiration } = require('./services/messagesExpire');
const api = require('./api');
const messageHandler = require('./messageHandler');

process.on('uncaughtException', (e) => {
  logger.error('Error: ' + e);
});

// parse config
let path = config.get('path');

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
  const messageQueue = realm.getMessageQueueById(client.getId());

  if (messageQueue) {
    let message;
    while (message = messageQueue.readMessage()) {
      messageHandler(client, message);
    }
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

const port = config.get('port');
const host = config.get('host');

server.listen(port, host, () => {
  const host = server.address().address;
  const port = server.address().port;

  logger.info(
    'Started PeerServer on %s, port: %s',
    host, port
  );

  startMessagesExpiration();
});
