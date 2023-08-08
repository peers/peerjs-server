#!/usr/bin/env node

import path from "node:path";
import fs from "node:fs";
const optimistUsageLength = 98;
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { PeerServer } from "../src/index.ts";
import type { AddressInfo } from "node:net";
import type { CorsOptions } from "cors";

const y = yargs(hideBin(process.argv));

const portEnvIsSet = !!process.env["PORT"];

const opts = y
	.usage("Usage: $0")
	.wrap(Math.min(optimistUsageLength, y.terminalWidth()))
	.options({
		expire_timeout: {
			demandOption: false,
			alias: "t",
			describe: "timeout (milliseconds)",
			default: 5000,
		},
		concurrent_limit: {
			demandOption: false,
			alias: "c",
			describe: "concurrent limit",
			default: 5000,
		},
		alive_timeout: {
			demandOption: false,
			describe: "broken connection check timeout (milliseconds)",
			default: 60000,
		},
		key: {
			demandOption: false,
			alias: "k",
			describe: "connection key",
			default: "peerjs",
		},
		sslkey: {
			type: "string",
			demandOption: false,
			describe: "path to SSL key",
		},
		sslcert: {
			type: "string",
			demandOption: false,
			describe: "path to SSL certificate",
		},
		host: {
			type: "string",
			demandOption: false,
			alias: "H",
			describe: "host",
		},
		port: {
			type: "number",
			demandOption: !portEnvIsSet,
			alias: "p",
			describe: "port",
		},
		path: {
			type: "string",
			demandOption: false,
			describe: "custom path",
			default: process.env["PEERSERVER_PATH"] ?? "/",
		},
		allow_discovery: {
			type: "boolean",
			demandOption: false,
			describe: "allow discovery of peers",
		},
		proxied: {
			type: "boolean",
			demandOption: false,
			describe: "Set true if PeerServer stays behind a reverse proxy",
			default: false,
		},
		cors: {
			type: "string",
			array: true,
			describe: "Set the list of CORS origins",
		},
	})
	.boolean("allow_discovery")
	.parseSync();

if (!opts.port) {
	// .port is only not set if the PORT env var is set
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	opts.port = parseInt(process.env["PORT"]!);
}
if (opts.cors) {
	opts["corsOptions"] = {
		origin: opts.cors,
	} satisfies CorsOptions;
}
process.on("uncaughtException", function (e) {
	console.error("Error: " + e.toString());
});

if (opts.sslkey ?? opts.sslcert) {
	if (opts.sslkey && opts.sslcert) {
		opts["ssl"] = {
			key: fs.readFileSync(path.resolve(opts.sslkey)),
			cert: fs.readFileSync(path.resolve(opts.sslcert)),
		};
	} else {
		console.error(
			"Warning: PeerServer will not run because either " +
				"the key or the certificate has not been provided.",
		);
		process.exit(1);
	}
}

const userPath = opts.path;
const server = PeerServer(opts, (server) => {
	const { address: host, port } = server.address() as AddressInfo;

	console.log(
		"Started PeerServer on %s, port: %s, path: %s",
		host,
		port,
		userPath || "/",
	);

	const shutdownApp = () => {
		server.close(() => {
			console.log("Http server closed.");

			process.exit(0);
		});
	};

	process.on("SIGINT", shutdownApp);
	process.on("SIGTERM", shutdownApp);
});

server.on("connection", (client) => {
	console.log(`Client connected: ${client.getId()}`);
});

server.on("disconnect", (client) => {
	console.log(`Client disconnected: ${client.getId()}`);
});
