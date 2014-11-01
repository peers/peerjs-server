[![Build Status](https://travis-ci.org/peers/peerjs-server.png?branch=master)](https://travis-ci.org/peers/peerjs-server)

# PeerServer: A server for PeerJS #

PeerServer helps broker connections between PeerJS clients. Data is not proxied through the server.

##[http://peerjs.com](http://peerjs.com)

**If you prefer to use a cloud hosted PeerServer instead of running your own, [sign up for a free API key here](http://peerjs.com/peerserver)**

or

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

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
var server = PeerServer({port: 9000, path: '/myapp'});
```

Connecting to the server from PeerJS:

```html
<script>
    // No API key required when not using cloud server
    var peer = new Peer('someid', {host: 'localhost', port: 9000, path: '/myapp'});
</script>
```

Using HTTPS: Simply pass in PEM-encoded certificate and key.

```javascript
var fs = require('fs');
var PeerServer = require('peer').PeerServer;

var server = PeerServer({
  port: 9000,
  ssl: {
    key: fs.readFileSync('/path/to/your/ssl/key/here.key'),
    cert: fs.readFileSync('/path/to/your/ssl/certificate/here.crt')
  }
});
```

#### Running PeerServer behind a reverse proxy

Make sure to set the `proxied` option, otherwise IP based limiting will fail.
The option is passed verbatim to the
[expressjs `trust proxy` setting](http://expressjs.com/4x/api.html#app-settings)
if it is truthy.

```javascript
var PeerServer = require('peer').PeerServer;
var server = PeerServer({port: 9000, path: '/myapp', proxied: true});
```

### Combining with existing express app

```javascript
var express = require('express');
var app = express();
var ExpressPeerServer = require('peer').ExpressPeerServer;

app.get('/', function(req, res, next) { res.send('Hello world!'); });

var server = app.listen(9000);

var options = {
    debug: true
}

app.use('/api', ExpressPeerServer(server, options));

// OR

var server = require('http').createServer(app);

app.use('/peerjs', ExpressPeerServer(server, options));

server.listen(9000);
```

### Events

The `'connection'` event is emitted when a peer connects to the server.

```javascript
server.on('connection', function(id) { ... });
```

The `'disconnect'` event is emitted when a peer disconnects from the server or
when the peer can no longer be reached.

```javascript
server.on('disconnect', function(id) { ... });
```

## Problems?

Discuss PeerJS on our Google Group:
https://groups.google.com/forum/?fromgroups#!forum/peerjs

Please post any bugs as a Github issue.
