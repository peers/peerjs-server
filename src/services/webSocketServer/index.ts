import { EventEmitter } from "node:events";
import type { IncomingMessage } from "node:http";
import type WebSocket from "ws";
import { Errors, MessageType } from "../../enums.ts";
import type { IClient } from "../../models/client.ts";
import { Client } from "../../models/client.ts";
import type { IConfig } from "../../config/index.ts";
import type { IRealm } from "../../models/realm.ts";
import { WebSocketServer as Server } from "ws";
import type { Server as HttpServer } from "node:http";
import type { Server as HttpsServer } from "node:https";
import { IMessage } from "../../models/message.js";

export interface IWebSocketServer extends EventEmitter {
	readonly path: string;
}

type CustomConfig = Pick<
	IConfig,
	"path" | "key" | "concurrent_limit" | "createWebSocketServer"
>;

const WS_PATH = "peerjs";

export class WebSocketServer extends EventEmitter implements IWebSocketServer {
	public readonly path: string;
	private readonly realm: IRealm;
	private readonly config: CustomConfig;
	public readonly socketServer: Server;

	constructor({
		server,
		realm,
		config,
	}: {
		server: HttpServer | HttpsServer;
		realm: IRealm;
		config: CustomConfig;
	}) {
		super();

		this.setMaxListeners(0);

		this.realm = realm;
		this.config = config;

		const path = this.config.path;
		this.path = `${path}${path.endsWith("/") ? "" : "/"}${WS_PATH}`;

		const options: WebSocket.ServerOptions = {
			path: this.path,
			server,
		};

		this.socketServer = config.createWebSocketServer
			? config.createWebSocketServer(options)
			: new Server(options);

		this.socketServer.on("connection", (socket, req) => {
			this._onSocketConnection(socket, req);
		});
		this.socketServer.on("error", (error: Error) => {
			this._onSocketError(error);
		});
	}

	private _onSocketConnection(socket: WebSocket, req: IncomingMessage): void {
		// An unhandled socket error might crash the server. Handle it first.
		socket.on("error", (error) => {
			this._onSocketError(error);
		});

		// We are only interested in the query, the base url is therefore not relevant
		const { searchParams } = new URL(req.url ?? "", "https://peerjs");
		const { id, token, key } = Object.fromEntries(searchParams.entries());

		if (!id || !token || !key) {
			this._sendErrorAndClose(socket, Errors.INVALID_WS_PARAMETERS);
			return;
		}

		if (key !== this.config.key) {
			this._sendErrorAndClose(socket, Errors.INVALID_KEY);
			return;
		}

		const client = this.realm.getClientById(id);

		if (client) {
			if (token !== client.getToken()) {
				// ID-taken, invalid token
				socket.send(
					JSON.stringify({
						type: MessageType.ID_TAKEN,
						payload: { msg: "ID is taken" },
					}),
				);

				socket.close();
				return;
			}

			this._configureWS(socket, client);
			return;
		}

		this._registerClient({ socket, id, token });
	}

	private _onSocketError(error: Error): void {
		// handle error
		this.emit("error", error);
	}

	private _registerClient({
		socket,
		id,
		token,
	}: {
		socket: WebSocket;
		id: string;
		token: string;
	}): void {
		// Check concurrent limit
		const clientsCount = this.realm.getClientsIds().length;

		if (clientsCount >= this.config.concurrent_limit) {
			this._sendErrorAndClose(socket, Errors.CONNECTION_LIMIT_EXCEED);
			return;
		}

		const newClient: IClient = new Client({ id, token });
		this.realm.setClient(newClient, id);
		socket.send(JSON.stringify({ type: MessageType.OPEN }));

		this._configureWS(socket, newClient);
	}

	private _configureWS(socket: WebSocket, client: IClient): void {
		client.setSocket(socket);

		// Cleanup after a socket closes.
		socket.on("close", () => {
			if (client.getSocket() === socket) {
				this.realm.removeClientById(client.getId());
				this.emit("close", client);
			}
		});

		// Handle messages from peers.
		socket.on("message", (data) => {
			try {
				// eslint-disable-next-line @typescript-eslint/no-base-to-string
				const message = JSON.parse(data.toString()) as Writable<IMessage>;

				message.src = client.getId();

				this.emit("message", client, message);
			} catch (e) {
				this.emit("error", e);
			}
		});

		this.emit("connection", client);
	}

	private _sendErrorAndClose(socket: WebSocket, msg: Errors): void {
		socket.send(
			JSON.stringify({
				type: MessageType.ERROR,
				payload: { msg },
			}),
		);

		socket.close();
	}
}

type Writable<T> = {
	-readonly [K in keyof T]: T[K];
};
