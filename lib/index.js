var express = require('express');
var mixin = require('utils-merge');
var proto = require('./server');

exports = module.exports = {
    PeerServer: createPeerServer
};

function createPeerServer(options) {

    var app = express();

    mixin(app, proto);

    app.options = {
        debug: false,
        timeout: 5000,
        key: 'peerjs',
        ip_limit: 5000,
        concurrent_limit: 5000,
        ssl: {},
        path: '/',
        allow_discovery: false
    };

    mixin(app.options, options);

    // Print warning if only one of the two is given.
    if (Object.keys(app.options.ssl).length === 1) {
        util.prettyError('Warning: PeerServer will not run on an HTTPS server' +
            ' because either the key or the certificate has not been provided.');
    }

    app.options.ssl.name = 'PeerServer';

    if (app.options.path[0] !== '/') {
        app.options.path = '/' + app.options.path;
    }
    if (app.options.path[app.options.path.length - 1] !== '/') {
        app.options.path += '/';
    }

    // Connected clients
    app._clients = {};

    // Messages waiting for another peer.
    app._outstanding = {};

    // Initailize WebSocket server handlers.
    app._initializeWSS();

    // Initialize HTTP routes. This is only used for the first few milliseconds
    // before a socket is opened for a Peer.
    app._initializeHTTP();

    // Mark concurrent users per ip
    app._ips = {};

    app._setCleanupIntervals();

    return app;
}
