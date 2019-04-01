const WSS = require('ws').Server;
const url = require('url');
const EventEmitter = require('events');
const logger = require('../logger');

const config = require('../../../config');
const realm = require('../realm');
const Client = require('../../models/client');

class WebSocketServer extends EventEmitter {
  constructor (server) {
    super();
    this.setMaxListeners(0);

    this._ips = {};

    let path = config.get('path');
    path = path + (path[path.length - 1] !== '/' ? '/' : '') + 'peerjs';

    logger.info(`ws opened on path:${path}`);

    this._wss = new WSS({ path, server });

    this._wss.on('connection', (socket, req) => this._onSocketConnection(socket, req));
    this._wss.on('error', (error) => this._onSocketError(error));
  }

  _onSocketConnection (socket, req) {
    logger.debug(`[WSS] on new connection:${req}`);

    const { query = {} } = url.parse(req.url, true);

    const { id, token, key } = query;

    if (!id || !token || !key) {
      return this._sendErrorAndClose(socket, 'No id, token, or key supplied to websocket server');
    }

    if (key !== config.get('key')) {
      return this._sendErrorAndClose(socket, 'Invalid key provided');
    }

    const client = realm.getClientById(id);

    if (client) {
      if (token !== client.getToken()) {
        // ID-taken, invalid token
        socket.send(JSON.stringify({
          type: 'ID-TAKEN',
          payload: { msg: 'ID is taken' }
        }));

        return socket.close();
      }

      return this._configureWS(socket, client);
    }

    this._registerClient({ socket, id, token });
  }

  _onSocketError (error) {
    logger.debug(`[WSS] on error:${error}`);
    // handle error
    this.emit('error', error);
  }

  _registerClient ({ socket, id, token }) {
    const ip = socket.remoteAddress;

    if (!this._ips[ip]) {
      this._ips[ip] = 0;
    }

    // Check concurrent limit
    const clientsCount = realm.getClientsIds().length;

    if (clientsCount >= config.get('concurrent_limit')) {
      return this._sendErrorAndClose(socket, 'Server has reached its concurrent user limit');
    }

    const connectionsPerIP = this._ips[ip];

    if (connectionsPerIP >= config.get('ip_limit')) {
      return this._sendErrorAndClose(socket, `${ip} has reached its concurrent user limit`);
    }

    const oldClient = realm.getClientById(id);

    if (oldClient) {
      return this._sendErrorAndClose(socket, `${id} already registered`);
    }

    const newClient = new Client({ id, token, ip });
    realm.setClient(newClient, id);
    socket.send(JSON.stringify({ type: 'OPEN' }));
    this._ips[ip]++;
    this._configureWS(socket, newClient);
  }

  _configureWS (socket, client) {
    if (client.socket && socket !== client.socket) {
      // TODO remove old ip, add new ip
    }

    client.setSocket(socket);

    // Cleanup after a socket closes.
    socket.on('close', () => {
      logger.info('Socket closed:', client.getId());

      const ip = socket.remoteAddress;

      if (this._ips[ip]) {
        this._ips[ip]--;

        if (this._ips[ip] === 0) {
          delete this._ips[ip];
        }
      }

      if (client.socket === socket) {
        realm.removeClientById(client.getId());
        this.emit('close', client);
      }
    });

    // Handle messages from peers.
    socket.on('message', (data) => {
      try {
        const message = JSON.parse(data);

        message.src = client.getId();

        this.emit('message', client, message);
      } catch (e) {
        logger.error('Invalid message', data);
        throw e;
      }
    });

    this.emit('connection', client);
  }

  _sendErrorAndClose (socket, msg) {
    socket.send(
      JSON.stringify({
        type: 'ERROR',
        payload: { msg }
      })
    );

    socket.close();
  }
}

module.exports = WebSocketServer;
