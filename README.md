[![Build Status](https://travis-ci.org/peers/peerjs-server.png?branch=master)](https://travis-ci.org/peers/peerjs-server)
![node](https://img.shields.io/node/v/peer)
![David](https://img.shields.io/david/peers/peerjs-server)
[![npm version](https://badge.fury.io/js/peer.svg)](https://www.npmjs.com/package/peer)
[![Downloads](https://img.shields.io/npm/dm/peer.svg)](https://www.npmjs.com/package/peer)
[![Docker Image Size (latest semver)](https://img.shields.io/docker/image-size/peerjs/peerjs-server)](https://hub.docker.com/r/peerjs/peerjs-server)

# PeerServer: A server for PeerJS

PeerServer helps establishing connections between PeerJS clients. Data is not proxied through the server.

Run your own server on Gitpod!

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/peers/peerjs-server)

### [https://peerjs.com](https://peerjs.com)

## Usage

### Run server

#### Natively

If you don't want to develop anything, just enter few commands below.

1. Install the package globally:
   ```sh
   $ npm install peer -g
   ```
2. Run the server:

   ```sh
   $ peerjs --port 9000 --key peerjs --path /myapp

     Started PeerServer on ::, port: 9000, path: /myapp (v. 0.3.2)
   ```

3. Check it: http://127.0.0.1:9000/myapp It should returns JSON with name, description and website fields.

#### Docker

Also, you can use Docker image to run a new container:

```sh
$ docker run -p 9000:9000 -d peerjs/peerjs-server
```

##### Kubernetes

```sh
$ kubectl run peerjs-server --image=peerjs/peerjs-server --port 9000 --expose -- --port 9000 --path /myapp
```

### Create a custom server:

If you have your own server, you can attach PeerServer.

1. Install the package:

   ```bash
   # $ cd your-project-path

   # with npm
   $ npm install peer

   # with yarn
   $ yarn add peer
   ```

2. Use PeerServer object to create a new server:

   ```javascript
   const { PeerServer } = require("peer");

   const peerServer = PeerServer({ port: 9000, path: "/myapp" });
   ```

3. Check it: http://127.0.0.1:9000/myapp It should returns JSON with name, description and website fields.

### Connecting to the server from client PeerJS:

```html
<script>
	const peer = new Peer("someid", {
		host: "localhost",
		port: 9000,
		path: "/myapp",
	});
</script>
```

## Config / CLI options

You can provide config object to `PeerServer` function or specify options for `peerjs` CLI.

| CLI option               | JS option          | Description                                                                                                                                                                                                                                           | Required |  Default   |
| ------------------------ | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------: | :--------: |
| `--port, -p`             | `port`             | Port to listen (number)                                                                                                                                                                                                                               | **Yes**  |            |
| `--key, -k`              | `key`              | Connection key (string). Client must provide it to call API methods                                                                                                                                                                                   |    No    | `"peerjs"` |
| `--path`                 | `path`             | Path (string). The server responds for requests to the root URL + path. **E.g.** Set the `path` to `/myapp` and run server on 9000 port via `peerjs --port 9000 --path /myapp` Then open http://127.0.0.1:9000/myapp - you should see a JSON reponse. |    No    |   `"/"`    |
| `--proxied`              | `proxied`          | Set `true` if PeerServer stays behind a reverse proxy (boolean)                                                                                                                                                                                       |    No    |  `false`   |
| `--expire_timeout, -t`   | `expire_timeout`   | The amount of time after which a message sent will expire, the sender will then receive a `EXPIRE` message (milliseconds).                                                                                                                            |    No    |   `5000`   |
| `--alive_timeout`        | `alive_timeout`    | Timeout for broken connection (milliseconds). If the server doesn't receive any data from client (includes `pong` messages), the client's connection will be destroyed.                                                                               |    No    |  `60000`   |
| `--concurrent_limit, -c` | `concurrent_limit` | Maximum number of clients' connections to WebSocket server (number)                                                                                                                                                                                   |    No    |   `5000`   |
| `--sslkey`               | `sslkey`           | Path to SSL key (string)                                                                                                                                                                                                                              |    No    |            |
| `--sslcert`              | `sslcert`          | Path to SSL certificate (string)                                                                                                                                                                                                                      |    No    |            |
| `--allow_discovery`      | `allow_discovery`  | Allow to use GET `/peers` http API method to get an array of ids of all connected clients (boolean)                                                                                                                                                   |    No    |            |
| `--cors`                 | `corsOptions`      | The CORS origins that can access this server                                                                                                                                                                                                          |
|                          | `generateClientId` | A function which generate random client IDs when calling `/id` API method (`() => string`)                                                                                                                                                            |    No    | `uuid/v4`  |

## Using HTTPS

Simply pass in PEM-encoded certificate and key.

```javascript
const fs = require("fs");
const { PeerServer } = require("peer");

const peerServer = PeerServer({
	port: 9000,
	ssl: {
		key: fs.readFileSync("/path/to/your/ssl/key/here.key"),
		cert: fs.readFileSync("/path/to/your/ssl/certificate/here.crt"),
	},
});
```

You can also pass any other [SSL options accepted by https.createServer](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistenerfrom), such as `SNICallback:

```javascript
const fs = require("fs");
const { PeerServer } = require("peer");

const peerServer = PeerServer({
	port: 9000,
	ssl: {
		SNICallback: (servername, cb) => {
			// your code here ....
		},
	},
});
```

## Running PeerServer behind a reverse proxy

Make sure to set the `proxied` option, otherwise IP based limiting will fail.
The option is passed verbatim to the
[expressjs `trust proxy` setting](http://expressjs.com/4x/api.html#app-settings)
if it is truthy.

```javascript
const { PeerServer } = require("peer");

const peerServer = PeerServer({
	port: 9000,
	path: "/myapp",
	proxied: true,
});
```

## Custom client ID generation

By default, PeerServer uses `uuid/v4` npm package to generate random client IDs.

You can set `generateClientId` option in config to specify a custom function to generate client IDs.

```javascript
const { PeerServer } = require("peer");

const customGenerationFunction = () =>
	(Math.random().toString(36) + "0000000000000000000").substr(2, 16);

const peerServer = PeerServer({
	port: 9000,
	path: "/myapp",
	generateClientId: customGenerationFunction,
});
```

Open http://127.0.0.1:9000/myapp/peerjs/id to see a new random id.

## Combining with existing express app

```javascript
const express = require("express");
const { ExpressPeerServer } = require("peer");

const app = express();

app.get("/", (req, res, next) => res.send("Hello world!"));

// =======

const server = app.listen(9000);

const peerServer = ExpressPeerServer(server, {
	path: "/myapp",
});

app.use("/peerjs", peerServer);

// == OR ==

const http = require("http");

const server = http.createServer(app);
const peerServer = ExpressPeerServer(server, {
	debug: true,
	path: "/myapp",
});

app.use("/peerjs", peerServer);

server.listen(9000);

// ========
```

Open the browser and check http://127.0.0.1:9000/peerjs/myapp

## Events

The `'connection'` event is emitted when a peer connects to the server.

```javascript
peerServer.on('connection', (client) => { ... });
```

The `'disconnect'` event is emitted when a peer disconnects from the server or
when the peer can no longer be reached.

```javascript
peerServer.on('disconnect', (client) => { ... });
```

## HTTP API

Read [/src/api/README.md](src/api/README.md)

## Running tests

```sh
$ npm test
```

## Docker

We have 'ready to use' images on docker hub:
https://hub.docker.com/r/peerjs/peerjs-server

To run the latest image:

```sh
$ docker run -p 9000:9000 -d peerjs/peerjs-server
```

You can build a new image simply by calling:

```sh
$ docker build -t myimage https://github.com/peers/peerjs-server.git
```

To run the image execute this:

```sh
$ docker run -p 9000:9000 -d myimage
```

This will start a peerjs server on port 9000 exposed on port 9000 with key `peerjs` on path `/myapp`.

Open your browser with http://localhost:9000/myapp It should returns JSON with name, description and website fields. http://localhost:9000/myapp/peerjs/id - should returns a random string (random client id)

## Running in Google App Engine

Google App Engine will create an HTTPS certificate for you automatically,
making this by far the easiest way to deploy PeerJS in the Google Cloud
Platform.

1. Create a `package.json` file for GAE to read:

```sh
echo "{}" > package.json
npm install express@latest peer@latest
```

2. Create an `app.yaml` file to configure the GAE application.

```yaml
runtime: nodejs

# Flex environment required for WebSocket support, which is required for PeerJS.
env: flex

# Limit resources to one instance, one CPU, very little memory or disk.
manual_scaling:
  instances: 1
resources:
  cpu: 1
  memory_gb: 0.5
  disk_size_gb: 0.5
```

3. Create `server.js` (which node will run by default for the `start` script):

```js
const express = require("express");
const { ExpressPeerServer } = require("peer");
const app = express();

app.enable("trust proxy");

const PORT = process.env.PORT || 9000;
const server = app.listen(PORT, () => {
	console.log(`App listening on port ${PORT}`);
	console.log("Press Ctrl+C to quit.");
});

const peerServer = ExpressPeerServer(server, {
	path: "/",
});

app.use("/", peerServer);

module.exports = app;
```

4. Deploy to an existing GAE project (assuming you are already logged in via
   `gcloud`), replacing `YOUR-PROJECT-ID-HERE` with your particular project ID:

```sh
gcloud app deploy --project=YOUR-PROJECT-ID-HERE --promote --quiet app.yaml
```

## Privacy

See [PRIVACY.md](https://github.com/peers/peerjs-server/blob/master/PRIVACY.md)

## Problems?

Discuss PeerJS on our Telegram chat:
https://t.me/joinchat/ENhPuhTvhm8WlIxTjQf7Og

Please post any bugs as a Github issue.
