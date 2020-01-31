[![Build Status](https://travis-ci.org/peers/peerjs-server.png?branch=master)](https://travis-ci.org/peers/peerjs-server)
[![npm version](https://badge.fury.io/js/peer.svg)](https://www.npmjs.com/package/peer)
[![Downloads](https://img.shields.io/npm/dm/peer.svg)](https://www.npmjs.com/package/peer)

# PeerServer: A server for PeerJS #

PeerServer helps broker connections between PeerJS clients. Data is not proxied through the server.

Run your own server on Gitpod!

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/peers/peerjs-server)

## [https://peerjs.com](https://peerjs.com)

### Run PeerServer

1. Install PeerServer from npm or github:

#### NPM
```bash
npm install peer
```

#### github

```bash
git clone https://github.com/peers/peerjs-server.git#master
npm install
```

2. Run the server:

```bash
$> peerjs --port 9000 --key peerjs --path /myapp
```

Or, create a custom server:

```bash
$> npm install peerjs-server
```

```javascript
import {PeerServer} from 'peerjs-server';

const server = PeerServer({port: 9000, path: '/myapp'});
```

3. Check that server works: open browser with [http://localhost:9000/myapp](http://localhost:9000/myapp) It should returns JSON with name, description and website fields.

### Connecting to the server from PeerJS:

```html
<script>
    const peer = new Peer('someid', {host: 'localhost', port: 9000, path: '/myapp'});
</script>
```

### Using HTTPS: Simply pass in PEM-encoded certificate and key.

```javascript
import fs from 'fs';
import {PeerServer} from 'peerjs-server';

const server = PeerServer({
  port: 9000,
  ssl: {
    key: fs.readFileSync('/path/to/your/ssl/key/here.key'),
    cert: fs.readFileSync('/path/to/your/ssl/certificate/here.crt')
  }
});
```

### Running PeerServer behind a reverse proxy

Make sure to set the `proxied` option, otherwise IP based limiting will fail.
The option is passed verbatim to the
[expressjs `trust proxy` setting](http://expressjs.com/4x/api.html#app-settings)
if it is truthy.

```javascript
import {PeerServer} from 'peerjs-server';

const server = PeerServer({port: 9000, path: '/myapp', proxied: true});
```


### Custom client ID generation

You can specify a custom function to use to generate client IDs.

```javascript
const genRandomId = () => {
    // Original generation algorithm
    return (Math.random().toString(36) + '0000000000000000000').substr(2, 16);
}

const server = PeerServer({port: 9000, path: '/myapp', proxied: true, genRandomId: genRandomId });
```

### Combining with existing express app

```javascript
import express from 'express';
import {ExpressPeerServer} from 'peerjs-server';

const app = express();
app.get('/', (req, res, next) => { res.send('Hello world!'); });

// =======

const server = app.listen(9000);

const options = {
    debug: true
}

const peerserver = ExpressPeerServer(server, options);

app.use('/api', peerserver);

// == OR ==

import http from 'http';

const server = http.createServer(app);
const peerserver = ExpressPeerServer(server, options);

app.use('/peerjs', peerserver);

server.listen(9000);

// ========
```

### Events

The `'connection'` event is emitted when a peer connects to the server.

```javascript
peerserver.on('connection', (client) => { ... });
```

The `'disconnect'` event is emitted when a peer disconnects from the server or
when the peer can no longer be reached.

```javascript
peerserver.on('disconnect', (client) => { ... });
```

## Running tests

```bash
npm test
```

## Docker

You can build this image simply by calling:
```bash
docker build -t peerjs https://github.com/peers/peerjs-server.git
```

To run the image execute this:  
```bash
docker run -p 9000:9000 -d peerjs
```

This will start a peerjs server on port 9000 exposed on port 9000.

## Problems?

Discuss PeerJS on our Telegram chat:
https://t.me/joinchat/ENhPuhTvhm8WlIxTjQf7Og

Please post any bugs as a Github issue.
