[![Build Status](https://travis-ci.org/peers/peerjs-server.png?branch=master)](https://travis-ci.org/peers/peerjs-server)

# PeerServer: A server for PeerJS #

PeerServer helps broker connections between PeerJS clients. Data is not proxied through the server.

## [https://peerjs.com](https://peerjs.com)

### Run PeerServer

1. Clone app:
```bash
git clone https://github.com/peers/peerjs-server.git
```

2. Install dependencies:
```bash
npm install
```

3. Run the server:
```bash
npm run start
```

Connecting to the server from PeerJS:

```html
<script>
    const peer = new Peer('someid', {host: 'localhost', port: 9000, path: '/myapp'});
</script>
```

Using HTTPS: Simply pass in paths to PEM-encoded certificate and key.

```bash
node ./src/index.js --port 9000 --path /myapp --sslKeyPath /path/to/your/ssl/key/here.key --sslCertPath /path/to/your/ssl/certificate/here.crt
```

#### Running PeerServer behind a reverse proxy

Make sure to set the `proxied` option.
The option is passed verbatim to the
[expressjs `trust proxy` setting](http://expressjs.com/4x/api.html#app-settings)
if it is truthy.

```bash
node ./src/index.js --port 9000 --path /myapp --proxied true
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

Discuss PeerJS on our Google Group:
https://groups.google.com/forum/?fromgroups#!forum/peerjs

Please post any bugs as a Github issue.
