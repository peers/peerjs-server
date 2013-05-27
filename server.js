var PeerServer = require('./lib/server').PeerServer;
var server = new PeerServer({ port: process.env.PORT || 9000 });
