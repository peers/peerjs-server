const express = require('express');
const http = require('http');
const https = require('https');

const config = require('../config');
const WebSocketServer = require('./services/webSocketServer');
const Realm = require('./models/realm');

const init = ({ app, server, options }) => {
  const config = options;
  const realm = new Realm();
  const messageHandler = require('./messageHandler')({ realm });
  const api = require('./api')({ config, realm, messageHandler });
  const { startMessagesExpiration } = require('./services/messagesExpire')({ realm, config });

  app.use(options.path, api);

  const wss = new WebSocketServer({
    server,
    realm,
    config: {
      ...config,
      path: app.mountpath
    }
  });

  wss.on('connection', client => {
    const messageQueue = realm.getMessageQueueById(client.getId());

    if (messageQueue) {
      let message;
      while (message = messageQueue.readMessage()) {
        messageHandler(client, message);
      }
      realm.clearMessageQueue(client.getId());
    }

    app.emit('connection', client);
  });

  wss.on('message', (client, message) => {
    app.emit('message', client, message);
    messageHandler(client, message);
  });

  wss.on('close', client => {
    app.emit('disconnect', client);
  });

  wss.on('error', error => {
    app.emit('error', error);
  });

  startMessagesExpiration();
};

function ExpressPeerServer (server, options) {
  const app = express();

  options = {
    ...config,
    ...options
  };

  if (options.proxied) {
    app.set('trust proxy', options.proxied === 'false' ? false : options.proxied);
  }

  app.on('mount', () => {
    if (!server) {
      throw new Error('Server is not passed to constructor - ' +
        'can\'t start PeerServer');
    }

    init({ app, server, options });
  });

  return app;
}

function PeerServer (options = {}, callback) {
  const app = express();

  options = {
    ...config,
    ...options
  };

  let path = options.path;
  const port = options.port;

  delete options.path;

  if (path[0] !== '/') {
    path = '/' + path;
  }

  if (path[path.length - 1] !== '/') {
    path += '/';
  }

  let server;

  if (options.ssl && options.ssl.key && options.ssl.cert) {
    server = https.createServer(options.ssl, app);
    delete options.ssl;
  } else {
    server = http.createServer(app);
  }

  const peerjs = ExpressPeerServer(server, options);
  app.use(path, peerjs);

  if (callback) {
    server.listen(port, () => {
      callback(server);
    });
  } else {
    server.listen(port);
  }

  return peerjs;
}

exports = module.exports = {
  ExpressPeerServer: ExpressPeerServer,
  PeerServer: PeerServer
};
