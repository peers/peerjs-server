#!/usr/bin/env node

var path = require('path')
  , pkg = require('../package.json')
  , fs = require('fs')
  , version = pkg.version
  , PeerServer = require('../lib').PeerServer
  , util = require('../lib/util')
  , opts = require('optimist')
    .usage('Usage: $0')
    .options({
      debug: {
        demand: false,
        alias: 'd',
        description: 'debug',
        default: false
      },
      timeout: {
        demand: false,
        alias: 't',
        description: 'timeout (milliseconds)',
        default: 5000
      },
      ip_limit: {
        demand: false,
        alias: 'i',
        description: 'IP limit',
        default: 5000
      },
      concurrent_limit: {
        demand: false,
        alias: 'c',
        description: 'concurrent limit',
        default: 5000
      },
      key: {
        demand: false,
        alias: 'k',
        description: 'connection key',
        default: 'peerjs'
      },
      sslkey: {
        demand: false,
        description: 'path to SSL key'
      },
      sslcert: {
        demand: false,
        description: 'path to SSL certificate'
      },
      port: {
        demand: true,
        alias: 'p',
        description: 'port'
      },
      path: {
        demand: false,
        description: 'custom path',
        default: '/'
      },
      allow_discovery: {
        demand: false,
        description: 'allow discovery of peers'
      }
    })
    .boolean('allow_discovery')
    .argv;

process.on('uncaughtException', function(e) {
  console.error('Error: ' + e);
});

if (opts.sslkey || opts.sslcert) {
  if (opts.sslkey && opts.sslcert) {
    opts.ssl = {
      key: fs.readFileSync(path.resolve(opts.sslkey)),
      cert: fs.readFileSync(path.resolve(opts.sslcert))
    }

    delete opts.sslkey;
    delete opts.sslcert;
  } else {
    util.prettyError('Warning: PeerServer will not run because either ' +
      'the key or the certificate has not been provided.');
    process.exit(1);
  }
}


var userPath = opts.path;
var server = PeerServer(opts, function(server) {
  var host = server.address().address;
  var port = server.address().port;

  console.log(
    'Started PeerServer on %s, port: %s, path: %s (v. %s)',
    host, port, userPath || '/', version
  );
});
