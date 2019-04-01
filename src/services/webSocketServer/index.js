const WSS = require('ws').Server;
const url = require('url');
const EventEmitter = require('events');
const logger = require('../logger');
const { MessageType, Errors } = require('../../enums');
const config = require('../../../config');
const realm = require('../realm');
const Client = require('../../models/client');

class WebSocketServer extends EventEmitter {
  constructor (server) {
    super();
    this.setMaxListeners(0);

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
      return this._sendErrorAndClose(socket, Errors.INVALID_WS_PARAMETERS);
    }

    if (key !== config.get('key')) {
      return this._sendErrorAndClose(socket, Errors.INVALID_KEY);
    }

    const client = realm.getClientById(id);

    if (client) {
      if (token !== client.getToken()) {
        // ID-taken, invalid token
        socket.send(JSON.stringify({
          type: MessageType.ID_TAKEN,
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
    // Check concurrent limit
    const clientsCount = realm.getClientsIds().length;

    if (clientsCount >= config.get('concurrent_limit')) {
      return this._sendErrorAndClose(socket, Errors.CONNECTION_LIMIT_EXCEED);
    }

    const newClient = new Client({ id, token });
    realm.setClient(newClient, id);
    socket.send(JSON.stringify({ type: MessageType.OPEN }));

    this._configureWS(socket, newClient);
  }

  _configureWS (socket, client) {
    client.setSocket(socket);

    // Cleanup after a socket closes.
    socket.on('close', () => {
      logger.info('Socket closed:', client.getId());

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
        type: MessageType.ERROR,
        payload: { msg }
      })
    );

    socket.close();
  }
}

module.exports = WebSocketServer;
