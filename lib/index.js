var express = require('express');
var mixin = require('utils-merge');
var proto = require('./server');
var util = require('./util');
var http = require('http');
var https = require('https');

function ExpressPeerServer(server, options) {
    if (!server) {
        throw new Error('Server is not passed to constructor - '+
            'can\'t start PeerServer');
    }

    var app = express();

    mixin(app, proto);

    options = app.options = mixin({
        debug: false,
        timeout: 5000,
        key: 'peerjs',
        ip_limit: 5000,
        concurrent_limit: 5000,
        allow_discovery: false
    }, options);

    // Connected clients
    app._clients = {};

    // Messages waiting for another peer.
    app._outstanding = {};

    // Mark concurrent users per ip
    app._ips = {};

    app.on('mount', function() {
        // Initialize HTTP routes. This is only used for the first few milliseconds
        // before a socket is opened for a Peer.
        app._initializeHTTP();
        app._setCleanupIntervals();
        app._initializeWSS(server);
    });

    return app;
}

function PeerServer(options, callback) {
    var app = express();

    var path = options.path || '/';
    var port = options.port;

    delete options.path;
    delete options.port;

    if (path[0] !== '/') {
        path = '/' + path;
    }

    if (path[path.length - 1] !== '/') {
        path += '/';
    }

    var server;
    if (options.ssl) {
        if (options.ssl.certificate) {
            // Preserve compatibility with 0.2.7 API
            options.ssl.cert = options.ssl.certificate;
            delete options.ssl.certificate;
        }

        server = https.createServer(options.ssl, app);
        delete options.ssl;
    } else {
        server = http.createServer(app);
    }

    var peerjs = ExpressPeerServer(server, options);
    app.use(path, peerjs);

    if (callback) {
        server.listen(port, function() {
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
