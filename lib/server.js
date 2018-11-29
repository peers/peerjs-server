var util = require("./util");
var bodyParser = require("body-parser");
var WebSocketServer = require("ws").Server;
var url = require("url");
var cors = require("cors");

var app = (exports = module.exports = {});

/** Initialize WebSocket server. */
app._initializeWSS = function(server) {
  var self = this;

  if (this.mountpath instanceof Array) {
    throw new Error("This app can only be mounted on a single path");
  }

  var path = this.mountpath;
  var path = path + (path[path.length - 1] != "/" ? "/" : "") + "peerjs";

  // Create WebSocket server as well.
  this._wss = new WebSocketServer({ path: path, server: server });

  this._wss.on("connection", function(socket, req) {
    var query = url.parse(req.url, true).query;
    var id = query.id;
    var token = query.token;
    var key = query.key;
    var ip = req.socket.remoteAddress;

    if (!id || !token || !key) {
      socket.send(
        JSON.stringify({
          type: "ERROR",
          payload: { msg: "No id, token, or key supplied to websocket server" }
        })
      );
      socket.close();
      return;
    }

    if (!self._clients[key] || !self._clients[key][id]) {
      self._checkKey(key, ip, function(err) {
        if (!err) {
          if (!self._clients[key][id]) {
            self._clients[key][id] = { token: token, ip: ip };
            self._ips[ip]++;
            socket.send(JSON.stringify({ type: "OPEN" }));
          }
          self._configureWS(socket, key, id, token);
        } else {
          socket.send(JSON.stringify({ type: "ERROR", payload: { msg: err } }));
        }
      });
    } else {
      self._configureWS(socket, key, id, token);
    }
  });

  this._wss.on("error", function (err) {
    // handle error
  })
};

app._configureWS = function(socket, key, id, token) {
  var self = this;
  var client = this._clients[key][id];

  if (token === client.token) {
    // res 'close' event will delete client.res for us
    client.socket = socket;
    // Client already exists
    if (client.res) {
      client.res.end();
    }
  } else {
    // ID-taken, invalid token
    socket.send(
      JSON.stringify({ type: "ID-TAKEN", payload: { msg: "ID is taken" } })
    );
    socket.close();
    return;
  }

  this._processOutstanding(key, id);

  // Cleanup after a socket closes.
  socket.on("close", function() {
    self._log("Socket closed:", id);
    if (client.socket == socket) {
      self._removePeer(key, id);
    }
  });

  // Handle messages from peers.
  socket.on("message", function(data) {
    try {
      var message = JSON.parse(data);

      if (
        ["LEAVE", "CANDIDATE", "OFFER", "ANSWER"].indexOf(message.type) !== -1
      ) {
        self._handleTransmission(key, {
          type: message.type,
          src: id,
          dst: message.dst,
          payload: message.payload
        });
      } else if (message.type === 'HEARTBEAT') {
        // Ignore - nothing needs doing here.
      } else {
        util.prettyError("Message unrecognized");
      }
    } catch (e) {
      self._log("Invalid message", data);
      throw e;
    }
  });

  // We're going to emit here, because for XHR we don't *know* when someone
  // disconnects.
  this.emit("connection", id);
};

app._checkAllowsDiscovery = function(key, cb) {
  cb(this._options.allow_discovery);
};

app._checkKey = function(key, ip, cb) {
  if (key == this._options.key) {
    if (!this._clients[key]) {
      this._clients[key] = {};
    }
    if (!this._outstanding[key]) {
      this._outstanding[key] = {};
    }
    if (!this._ips[ip]) {
      this._ips[ip] = 0;
    }
    // Check concurrent limit
    if (
      Object.keys(this._clients[key]).length >= this._options.concurrent_limit
    ) {
      cb("Server has reached its concurrent user limit");
      return;
    }
    if (this._ips[ip] >= this._options.ip_limit) {
      cb(ip + " has reached its concurrent user limit");
      return;
    }
    cb(null);
  } else {
    cb("Invalid key provided");
  }
};

/** Initialize HTTP server routes. */
app._initializeHTTP = function() {
  var self = this;

  this.use(cors());

  this.get("/", function(req, res, next) {
    res.send(require("../app.json"));
  });

  // Retrieve guaranteed random ID.
  this.get("/:key/id", function(req, res, next) {
    res.contentType = "text/html";
    res.send(self._generateClientId(req.params.key));
  });

  // Server sets up HTTP streaming when you get post an ID.
  this.post("/:key/:id/:token/id", function(req, res, next) {
    var id = req.params.id;
    var token = req.params.token;
    var key = req.params.key;
    var ip = req.connection.remoteAddress;

    if (!self._clients[key] || !self._clients[key][id]) {
      self._checkKey(key, ip, function(err) {
        if (!err && !self._clients[key][id]) {
          self._clients[key][id] = { token: token, ip: ip };
          self._ips[ip]++;
          self._startStreaming(res, key, id, token, true);
        } else {
          res.send(JSON.stringify({ type: "HTTP-ERROR" }));
        }
      });
    } else {
      self._startStreaming(res, key, id, token);
    }
  });

  // Get a list of all peers for a key, enabled by the `allowDiscovery` flag.
  this.get("/:key/peers", function(req, res, next) {
    var key = req.params.key;
    if (self._clients[key]) {
      self._checkAllowsDiscovery(key, function(isAllowed) {
        if (isAllowed) {
          res.send(Object.keys(self._clients[key]));
        } else {
          res.sendStatus(401);
        }
      });
    } else {
      res.sendStatus(404);
    }
  });

  var handle = function(req, res, next) {
    var key = req.params.key;
    var id = req.params.id;

    var client;
    if (!self._clients[key] || !(client = self._clients[key][id])) {
      if (req.params.retry) {
        res.sendStatus(401);
        return;
      } else {
        // Retry this request
        req.params.retry = true;
        setTimeout(handle, 25, req, res);
        return;
      }
    }

    // Auth the req
    if (client.token && req.params.token !== client.token) {
      res.sendStatus(401);
      return;
    } else {
      self._handleTransmission(key, {
        type: req.body.type,
        src: id,
        dst: req.body.dst,
        payload: req.body.payload
      });
      res.sendStatus(200);
    }
  };

  var jsonParser = bodyParser.json();

  this.post("/:key/:id/:token/offer", jsonParser, handle);

  this.post("/:key/:id/:token/candidate", jsonParser, handle);

  this.post("/:key/:id/:token/answer", jsonParser, handle);

  this.post("/:key/:id/:token/leave", jsonParser, handle);
};

/** Saves a streaming response and takes care of timeouts and headers. */
app._startStreaming = function(res, key, id, token, open) {
  var self = this;

  res.writeHead(200, { "Content-Type": "application/octet-stream" });

  var pad = "00";
  for (var i = 0; i < 10; i++) {
    pad += pad;
  }
  res.write(pad + "\n");

  if (open) {
    res.write(JSON.stringify({ type: "OPEN" }) + "\n");
  }

  var client = this._clients[key][id];

  if (token === client.token) {
    // Client already exists
    res.on("close", function() {
      if (client.res === res) {
        if (!client.socket) {
          // No new request yet, peer dead
          self._removePeer(key, id);
          return;
        }
        delete client.res;
      }
    });
    client.res = res;
    this._processOutstanding(key, id);
  } else {
    // ID-taken, invalid token
    res.end(JSON.stringify({ type: "HTTP-ERROR" }));
  }
};

app._pruneOutstanding = function() {
  var keys = Object.keys(this._outstanding);
  for (var k = 0, kk = keys.length; k < kk; k += 1) {
    var key = keys[k];
    var dsts = Object.keys(this._outstanding[key]);
    for (var i = 0, ii = dsts.length; i < ii; i += 1) {
      var offers = this._outstanding[key][dsts[i]];
      var seen = {};
      for (var j = 0, jj = offers.length; j < jj; j += 1) {
        var message = offers[j];
        if (!seen[message.src]) {
          this._handleTransmission(key, {
            type: "EXPIRE",
            src: message.dst,
            dst: message.src
          });
          seen[message.src] = true;
        }
      }
    }
    this._outstanding[key] = {};
  }
};

/** Cleanup */
app._setCleanupIntervals = function() {
  var self = this;

  // Clean up ips every 10 minutes
  setInterval(function() {
    var keys = Object.keys(self._ips);
    for (var i = 0, ii = keys.length; i < ii; i += 1) {
      var key = keys[i];
      if (self._ips[key] === 0) {
        delete self._ips[key];
      }
    }
  }, 600000);

  // Clean up outstanding messages every 5 seconds
  setInterval(function() {
    self._pruneOutstanding();
  }, 5000);
};

/** Process outstanding peer offers. */
app._processOutstanding = function(key, id) {
  var offers = this._outstanding[key][id];
  if (!offers) {
    return;
  }
  for (var j = 0, jj = offers.length; j < jj; j += 1) {
    this._handleTransmission(key, offers[j]);
  }
  delete this._outstanding[key][id];
};

app._removePeer = function(key, id) {
  if (this._clients[key] && this._clients[key][id]) {
    this._ips[this._clients[key][id].ip]--;
    delete this._clients[key][id];
    this.emit("disconnect", id);
  }
};

/** Handles passing on a message. */
app._handleTransmission = function(key, message) {
  var type = message.type;
  var src = message.src;
  var dst = message.dst;
  var data = JSON.stringify(message);

  var destination = this._clients[key][dst];

  // User is connected!
  if (destination) {
    try {
      this._log(type, "from", src, "to", dst);
      if (destination.socket) {
        destination.socket.send(data);
      } else if (destination.res) {
        data += "\n";
        destination.res.write(data);
      } else {
        // Neither socket no res available. Peer dead?
        throw "Peer dead";
      }
    } catch (e) {
      // This happens when a peer disconnects without closing connections and
      // the associated WebSocket has not closed.
      // Tell other side to stop trying.
      this._removePeer(key, dst);
      this._handleTransmission(key, {
        type: "LEAVE",
        src: dst,
        dst: src
      });
    }
  } else {
    // Wait for this client to connect/reconnect (XHR) for important
    // messages.
    if (type !== "LEAVE" && type !== "EXPIRE" && dst) {
      var self = this;
      if (!this._outstanding[key][dst]) {
        this._outstanding[key][dst] = [];
      }
      this._outstanding[key][dst].push(message);
    } else if (type === "LEAVE" && !dst) {
      this._removePeer(key, src);
    } else {
      // Unavailable destination specified with message LEAVE or EXPIRE
      // Ignore
    }
  }
};

app._generateClientId = function(key) {
  var clientId = util.randomId();
  if (!this._clients[key]) {
    return clientId;
  }
  while (!!this._clients[key][clientId]) {
    clientId = util.randomId();
  }
  return clientId;
};

app._log = function() {
  if (this._options.debug) {
    console.log.apply(console, arguments);
  }
};
