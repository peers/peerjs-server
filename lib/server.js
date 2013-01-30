var util = require('./util');
var express = require('express');
var http = require('http');
var EventEmitter = require('events').EventEmitter;
var WebSocketServer = require('ws').Server;
var url = require('url');


function PeerServer(options) {
  if (!(this instanceof PeerServer)) return new PeerServer(options);
  EventEmitter.call(this);

  this._app = express();
  this._httpServer = http.createServer(this._app);

  options = util.extend({
    port: 80
  }, options);

  util.debug = options.debug;

  // Listen on user-specified port and create WebSocket server as well.
  this._httpServer.listen(options.port);
  this._wss = new WebSocketServer({ path: '/ws', server: this._httpServer });

  // WebSockets that are opened.
  this._clients = {};
  // Requests that are awaiting response.
  this._requests = {};

  // Initailize WebSocket server handlers.
  this._initializeWSS();

  // Initialize HTTP routes. This is only used for the first few milliseconds
  // before a socket is opened for a Peer.
  this._initializeHTTP();
};

util.inherits(PeerServer, EventEmitter);

/* Initialize WebSocket server. */
PeerServer.prototype._initializeWSS = function() {
  var self = this;
  this._wss.on('connection', function(socket) {
    var id = url.parse(socket.upgradeReq.url, true).query.id;

    // Save the socket for this id.
    if (!!id && !self._clients[id]) {
      self._clients[id] = socket;
    } else if (!id) {
      // TODO: error
    };

    socket.on('message', function(data) {
      var message = JSON.parse(data);
      var ice = false;
      util.log(message);

      // Save the socket.
      if (!self._clients[message.src]) {
        self._clients[message.src] = socket;
      }

      switch (message.type) {
        // ICE candidates
        case 'CANDIDATE':
          ice = true;
        // Offer or answer between peers.
        case 'OFFER':
        case 'ANSWER':
        // Firefoxism (connectDataConnection ports)
        case 'PORT':
          self._handleTransmission(message.src, message.dst, data, ice);

          // Clean up.
          if (message.type === 'LEAVE') {
            delete self._clients[message.src];
            delete self._requests[message.src];
          }
          break;
        default:
          util.prettyError('message unrecognized');
      }
    });
  });
};

/** Initialize HTTP server routes. */
PeerServer.prototype._initializeHTTP = function() {
  var self = this;

  // Retrieve guaranteed random ID.
  this._app.get('/id', function(req, res) {
    var clientId = util.randomId();
    while (!!self._clients[clientId] || !!self._requests[clientId]) {
      clientId = util.randomId();
    }
    res.send(clientId);
  });

  this._app.post('/id', function(req, res) {
    var id = req.body.id;
    // Checked in with ID, now waiting for an offer.
    self._requests[id, 'offer'] = res;
  });

  this._app.post('/offer', function(req, res) {
    var data = req.body.data;
    var src = data.src;
    var dst = data.dst;
    self._handleTransmission(src, dst, JSON.stringify(data));
    // Now expecting ice from same dst.
    self._requests[src, dst] = res;
    self._ice[src, dst] = [];
  });

  this._app.post('/answer', function(req, res) {
    var data = req.body.data;
    var src = data.src;
    var dst = data.dst;
    self._handleTransmission(src, dst, JSON.stringify(data));
    // Now expecting ice from same dst.
    self._requests[src, dst] = res;
    self._ice[src, dst] = [];
  });
};

/** Handles passing on a message. */
PeerServer.prototype._handleTransmission = function(src, dst, data, ice) {
  var destination = this._clients[dst];
  if (!destination) {
    // For ICE, ports, and answers this should be here.
    destination = this._requests[dst, src];
    if (!destination) {
      // Otherwise it's a new offer.
      destination = this._requests[dst, 'offer'];
    }
  }

  if (!!destination) {
    if (!ice) {
      try {
        destination.send(data);
      } catch (e) {
        util.prettyError(e);
      }
    } else {
      if (!!this._ice[dst, src]) {
        // TODO: see if we can save less.
        this._ice[dst, src].push(data);
      }
    }
  } else {
    // Place in queue for 10 seconds.
  }
}



exports.PeerServer = PeerServer;

var ps = new PeerServer({ debug: true });
