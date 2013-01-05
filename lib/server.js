var WebSocketServer = require('ws').Server;
var util = require('./util');
var EventEmitter = require('events').EventEmitter;


function PeerServer(options) {
  if (!(this instanceof PeerServer)) return new PeerServer(options);
  
  EventEmitter.call(this);
  
   
  options = util.extend({
    port: 80
  }, options);
  
  var wss = new WebSocketServer({ port: options.port });
  
  
  this.clients = {};
  var self = this;

  // For connecting clients:
  // Src will connect upon creating a link.
  // Receivers will connect after clicking a button and entering an optional key.
  wss.on('connection', function(socket) {
    var clientId = util.randomId();
    while (!!self.clients[clientId]) {
      clientId = util.randomId();
    }
    self.clients[clientId] = socket;

    socket.on('message', function(data) {
      var message = JSON.parse(data);
      if (options.debug) {
        console.log('PeerServer: ', message);
      }

      switch (message.type) {
        // Source connected -- send back its ID.
        case 'SOURCE':
          socket.send(JSON.stringify({ type: 'SOURCE-ID', id: clientId }));
          break;
        // Sink connected -- send back its ID and notify src.
        case 'SINK':
          if (!!message.source && !!self.clients[message.source]) {
            self.clients[message.source].send(JSON.stringify({
              type: 'SINK-CONNECTED', sink: clientId }));

            socket.send(JSON.stringify({ type: 'SINK-ID', id: clientId }));
          } else {
            util.prettyError('source invalid');
          }
          break;
        case 'LEAVE':
          if (!!self.clients[message.dst]) {
            try {
              self.clients[message.dst].send(data);
            } catch (e) {
              if (options.debug) {
                console.log('Error', e);
              }
            }
            delete self.clients[message.src];
          }
          break;
        // Offer or answer from src to sink.
        case 'OFFER':
        case 'ANSWER':
        case 'CANDIDATE':
        case 'PORT':
          if (!!self.clients[message.dst]) {
            try {
              self.clients[message.dst].send(data);
            } catch (e) {
              if (options.debug) {
                console.log('Error', e);
              }
            }
          }
          break;
        default:
          util.prettyError('message unrecognized');
      }
    });
  });

};


util.inherits(PeerServer, EventEmitter);

exports.PeerServer = PeerServer;
