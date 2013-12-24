[![Build Status](https://travis-ci.org/peers/peerjs-server.png?branch=master)](https://travis-ci.org/peers/peerjs-server)

# PeerServer: A server for PeerJS #

PeerServer helps broker connections between PeerJS clients. Data is not proxied through the server.

##[http://peerjs.com](http://peerjs.com)


**If you prefer to use a cloud hosted PeerServer instead of running your own, [sign up for a free API key here](http://peerjs.com/peerserver)**


### Run PeerServer

Install the library:

```bash
$> npm install peer
```

Run the server:

```bash
$> peerjs --port 9000 --key peerjs
```

Or, create a custom server:

```javascript
var PeerServer = require('peer').PeerServer;
var server = new PeerServer({ port: 9000 });
```

Connecting to the server from PeerJS:

```html
<script>
    // No API key required when not using cloud server
    var peer = new Peer('someid', {host: 'localhost', port: 9000});
</script>
```

Using HTTPS: Simply pass in PEM-encoded certificate and key.

```javascript
var fs = require('fs');
var PeerServer = require('peer').PeerServer;

var server = new PeerServer({
  port: 9000,
  ssl: {
    key: fs.readFileSync('/path/to/your/ssl/key/here.key'),
    certificate: fs.readFileSync('/path/to/your/ssl/certificate/here.crt')
  }
});
```

### Events

The `'connection'` event is emitted when a peer connects to the server.

```javascript
server.on('connection', function(id) { ... })
```

The `'disconnect'` event is emitted when a peer disconnects from the server or
when the peer can no longer be reached.

```javascript
server.on('disconnect', function(id) { ... })
```

## Problems?

Discuss PeerJS on our Google Group:
https://groups.google.com/forum/?fromgroups#!forum/peerjs

Please post any bugs as a Github issue.
