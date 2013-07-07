var PeerServer = require('../').PeerServer;
var expect = require('expect.js');
var sinon = require('sinon');

describe('PeerServer', function() {
  describe('constructor', function() {
    before(function() {
      PeerServer.prototype._initializeWSS = sinon.stub();
      PeerServer.prototype._initializeHTTP = sinon.stub();
    });

    it('should be able to be created without the `new` keyword', function() {
      var p = PeerServer();
      expect(p.constructor).to.be(PeerServer);
    });

    it('should default to port 80, key `peerjs`', function() {
      var p = new PeerServer();
      expect(p._options.key).to.be('peerjs');
      expect(p._options.port).to.be(80);
    });

    it('should accept a custom port', function() {
      var p = new PeerServer({ port: 8000 });
      expect(p._options.port).to.be(8000);
    });
  });

  describe('#_initializeWSS', function() {

  });

  describe('#_configureWS', function() {

  });

  describe('#_checkKey', function() {

  });

  describe('#_initializeHTTP', function() {

  });

  describe('#_startStreaming', function() {

  });

  describe('#_pruneOutstanding', function() {

  });

  describe('#_processOutstanding', function() {

  });

  describe('#_removePeer', function() {

  });

  describe('#_handleTransmission', function() {

  });

  describe('#_generateClientId', function() {

  });
});
