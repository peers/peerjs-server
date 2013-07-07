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
    WebSocketServer = sinon.stub();

  });

  describe('#_configureWS', function() {

  });

  describe('#_checkKey', function() {
    var p;
    before(function() {
      PeerServer.prototype._initializeHTTP = sinon.stub();
      p = new PeerServer({ port: 8000 });
      p._checkKey('peerjs', 'myip', function() {});
    });

    it('should reject keys that are not the default', function(done) {
      p._checkKey('bad key', null, function(response) {
        expect(response).to.be('Invalid key provided');
        done();
      });
    });

    it('should accept valid key/ip pairs', function(done) {
      p._checkKey('peerjs', 'myip', function(response) {
        expect(response).to.be(null);
        done();
      });
    });

    it('should reject ips that are at their limit', function(done) {
      p._options.ip_limit = 0;
      p._checkKey('peerjs', 'myip', function(response) {
        expect(response).to.be('myip has reached its concurrent user limit');
        done();
      });
    });

    it('should reject when the server is at its limit', function(done) {
      p._options.concurrent_limit = 0;
      p._checkKey('peerjs', 'myip', function(response) {
        expect(response).to.be('Server has reached its concurrent user limit');
        done();
      });
    });

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
    // TODO: this is probably the most important method to test.
  });

  describe('#_generateClientId', function() {
    var p;
    before(function() {
      PeerServer.prototype._initializeHTTP = sinon.stub();
      p = new PeerServer({ port: 8000 });
    });

    it('should generate a 16-character ID', function() {
      expect(p._generateClientId('anykey').length).to.be(16);
    });
  });
});
