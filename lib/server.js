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
  this._app.use(express.bodyParser());
  this._app.use(this._allowCrossDomain);

  options = util.extend({
    port: 80
  }, options);

  util.debug = options.debug;

  // Listen on user-specified port and create WebSocket server as well.
  this._httpServer.listen(options.port);
  this._wss = new WebSocketServer({ path: '/ws', server: this._httpServer });

  // WebSockets that are opened or HTTP responses (which are paired with
  // something in timeouts.
  this._clients = {};
  // Timeouts for HTTP responses.
  this._timeouts = {};
  // Connections waiting for another peer.
  this._outstandingOffers = {};

  // Initailize WebSocket server handlers.
  this._initializeWSS();

  // Initialize HTTP routes. This is only used for the first few milliseconds
  // before a socket is opened for a Peer.
  this._initializeHTTP();
};

util.inherits(PeerServer, EventEmitter);

/** Handle CORS */
PeerServer.prototype._allowCrossDomain = function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  next();
}

/** Initialize WebSocket server. */
PeerServer.prototype._initializeWSS = function() {
  var self = this;
  this._wss.on('connection', function(socket) {
    var id = url.parse(socket.upgradeReq.url, true).query.id;
    if (!!id && !!self._clients[id]) {
      // If response client and timeout exist, overwrite and clear.
      if (!!self._timeouts[id]) {
        clearTimeout(self._timeouts[id]);
        delete self._timeouts[id];
        self._clients[id].end('socket');
      } else {
        socket.send(JSON.stringify({ type: 'ERROR', msg: 'ID is taken' }));
        return;
      }
    } else if (!id) {
      id = self._generateClientId();
      socket.send(JSON.stringify({ type: 'ID', id: id }));
    }

    // Save the socket for this id.
    self._clients[id] = socket;

    self._processOutstandingOffers(id);

    socket.on('message', function(data) {
      try {
        var message = JSON.parse(data);
        util.log(message);

        switch (message.type) {
          case 'LEAVE':
            // Clean up if a Peer sends a LEAVE.
            if (!message.dst) {
              delete self._clients[message.src];
              delete self._timeouts[message.src];
              break;
            }
          // ICE candidates
          case 'CANDIDATE':
          // Offer or answer between peers.
          case 'OFFER':
          case 'ANSWER':
          // Firefoxism (connectDataConnection ports)
          case 'PORT':
            self._handleTransmission(message.type, message.src, message.dst, data);
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


/** Process outstanding peer offers. */
PeerServer.prototype._processOutstandingOffers = function(id) {
  console.log('processing outstanding offers');
  var offers = this._outstandingOffers[id];
  if (offers === undefined)
    return;
  var sources = Object.keys(offers);
  for (var i = 0, ii = sources.length; i < ii; i += 1) {
    var messages = offers[sources[i]];
    for (var j = 0, jj = messages.length; j < jj; j += 1)
      this._handleTransmission.apply(this, messages[j]);

    delete this._outstandingOffers[id][sources[i]];
  }
  console.log(this._outstandingOffers[id]);
};

/** Initialize HTTP server routes. */
PeerServer.prototype._initializeHTTP = function() {
  var self = this;

  this._app.options('/*', function(req, res, next) {
    res.send(200);
  });

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
    var src = req.body.src;
    var dst = req.body.dst;
    self._handleTransmission('OFFER', src, dst, JSON.stringify(req.body), res);
  });

  this._app.post('/ice', function(req, res) {
    var src = req.body.src;
    var dst = req.body.dst;
    self._handleTransmission('CANDIDATE', src, dst, JSON.stringify(req.body), res);
  });

  this._app.post('/answer', function(req, res) {
    var src = req.body.src;
    var dst = req.body.dst;
    self._handleTransmission('ANSWER', src, dst, JSON.stringify(req.body), res);
  });

  this._app.post('/leave', function(req, res) {
    var src = req.body.src;
    var dst = req.body.dst;
    self._handleTransmission('LEAVE', src, dst, JSON.stringify(req.body), res);
  });

  this._app.post('/port', function(req, res) {
    var src = req.body.src;
    var dst = req.body.dst;
    self._handleTransmission('PORT', src, dst, JSON.stringify(req.body), res);
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
  if (!this._clients[id]) {
    this._clients[id] = res;
    // Set timeout to expire.
    this._timeouts[id] = setTimeout(function() { res.end('end') }, 10000);
  } else {
    res.write(JSON.stringify({ type: 'ERROR', msg: 'ID is taken' }) + '\n');
    res.end('error');
  }

};

/** Handles passing on a message. */
PeerServer.prototype._handleTransmission = function(type, src, dst, data, res) {
  var destination = this._clients[dst];

  if (!!destination) {
    try {
      if (this._timeouts[dst]) {
        data += '\n';
      }
      // We have to let the source peer know that the offer was sent
      // successfully so that ice can start being processed.
      if (type === 'OFFER') {
        if (!!res) {
          res.send(200);
        } else if (!this._timeouts[src] && !!this._clients[src]) {
          this._clients[src].send(JSON.stringify({ type: 'PEER_READY', src: dst, dst: src }));
        }
      }
      destination.send(data);
    } catch (e) {
      util.prettyError(e);
      // This really shouldn't happen given correct client browsers.
      // 501: Server does not support this functionality.
      if (!!res) res.send(501);
    }
  } else {
    if (type === 'OFFER' && (!this._outstandingOffers[dst] || !this._outstandingOffers[dst][src])) {
      // Wait 5 seconds for this client to connect.
      var self = this;
      if (!this._outstandingOffers[dst])
        this._outstandingOffers[dst] = {};
      this._outstandingOffers[dst][src] = [];
      this._outstandingOffers[dst][src].push(Array.prototype.slice.apply(arguments));

      console.log('offer on queue');
      setTimeout(function() {
        delete self._outstandingOffers[dst][src]
      }, 30000);
    } else if (type === 'CANDIDATE' && !!this._outstandingOffers[dst][src]) {
      this._outstandingOffers[dst][src].push(Array.prototype.slice.apply(arguments));
      console.log('ice on queue');
    } else {
      // Assume a disconnect if the client no longer exists.
      util.log('destination does not exist');
      this._handleTransmission('LEAVE', dst, src, JSON.stringify({ type: 'LEAVE', dst: src, src: dst }));
      // 410: Resource not available.
      if (!!res) res.send(410);
    }
  }
};

PeerServer.prototype._generateClientId = function() {
  var clientId = util.randomId();
  while (!!self._clients[clientId]) {
    clientId = util.randomId();
  }
};

exports.PeerServer = PeerServer;
