var util = require('./util');
var express = require('express');
var http = require('http');
var EventEmitter = require('events').EventEmitter;
var WebSocketServer = require('ws').Server;
var url = require('url');

var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
};

function PeerServer(options) {
  if (!(this instanceof PeerServer)) return new PeerServer(options);
  EventEmitter.call(this);

  this._app = express();
  this._httpServer = http.createServer(this._app);
  var self = this;
  this._app.configure(function() {
    self._app.use(express.bodyParser());
    self._app.use(allowCrossDomain);
  });

  options = util.extend({
    port: 80
  }, options);

  util.debug = options.debug;

  // Listen on user-specified port and create WebSocket server as well.
  this._httpServer.listen(options.port);
  this._wss = new WebSocketServer({ path: '/ws', server: this._httpServer });

  // WebSockets that are opened.
  this._clients = {};
  this._timeouts = {};

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
    if (!!id && (!self._clients[id] || !!self._timeouts[id])) {
      if (!!self._timeouts[id]) {
        clearTimeout(self._timeouts[id]);
        delete self._timeouts[id];
        self._clients[id].end('socket');
      }
    } else if (!id) {
      id = self._generateClientId();
      socket.send(JSON.stringify({ type: 'ID', id: id }));
    }
    self._clients[id] = socket;

    socket.on('message', function(data) {
      try {
        var message = JSON.parse(data);
        util.log(message);

        switch (message.type) {
          // ICE candidates
          case 'CANDIDATE':
          // Offer or answer between peers.
          case 'OFFER':
          case 'ANSWER':
          // Firefoxism (connectDataConnection ports)
          case 'PORT':
            self._handleTransmission(message.type, message.src, message.dst, data);

            // Clean up.
            if (message.type === 'LEAVE') {
              delete self._clients[message.src];
              delete self._timeouts[message.src];
            }
            break;
          default:
            util.prettyError('message unrecognized');
        }
      } catch(e) {
        util.log('invalid message');
      }
    });
  });
};

/** Initialize HTTP server routes. */
PeerServer.prototype._initializeHTTP = function() {
  var self = this;

  // Server sets up HTTP streaming whether you get or post an ID.
  // Retrieve guaranteed random ID.
  this._app.get('/id', function(req, res) {
    var clientId = util.randomId();
    while (!!self._clients[clientId]) {
      clientId = util.randomId();
    }
    self._startStreaming(res, clientId, function() {
      // Chrome hacks.
      res.write('{"id":"' + clientId + '"}\n');
    });
  });

  this._app.post('/id', function(req, res) {
    var id = req.body.id;
    self._startStreaming(res, id);
  });

  this._app.post('/offer', function(req, res) {
    // TODO: if offer person does not exist, set a timeout for 10s. may need to
    // change switch.
    var data = req.body.data;
    var src = data.src;
    var dst = data.dst;
    self._handleTransmission('OFFER', src, dst, JSON.stringify(data));
  });

  this._app.post('/answer', function(req, res) {
    var data = req.body.data;
    var src = data.src;
    var dst = data.dst;
    self._handleTransmission('ANSWER', src, dst, JSON.stringify(data));
  });
};

/** Saves a streaming response and takes care of timeouts and headers. */
PeerServer.prototype._startStreaming = function(res, id, write) {
    res.writeHead(200, {'Content-Type': 'application/octet-stream'});
    if (!!write) {
      write();
    }

    var pad = '00';
    var iterations = 10;
    for (var i = 0; i < iterations; i++) {
      pad += pad;
    }
    res.write(pad + '\n');

    // Save res so we can write to it.
    this._clients[id] = res;

    // Set timeout to expire.
    this._timeouts[id] = setTimeout(function() { res.end('end') }, 10000);
};

// TODO: fix for streaming
/** Handles passing on a message. */
PeerServer.prototype._handleTransmission = function(type, src, dst, data) {
  var destination = this._clients[dst];

  if (!!destination) {
    try {
      if (this._timeouts[dst])
        data += '\n';

      destination.send(data);
    } catch (e) {
      util.prettyError(e);
    }
  } else {
    // TODO: IF OFFER: Place in queue for 10 seconds.
    util.log('TODO/handle: destination does not exist');
  }
};

PeerServer.prototype._generateClientId = function() {
  var clientId = util.randomId();
  while (!!self._clients[clientId]) {
    clientId = util.randomId();
  }
};

exports.PeerServer = PeerServer;
