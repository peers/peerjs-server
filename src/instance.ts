import type express from "express";
import type { Server as HttpServer } from "node:http";
import type { Server as HttpsServer } from "node:https";
import path from "node:path";
import type { IRealm } from "./models/realm";
import { Realm } from "./models/realm";
import { CheckBrokenConnections } from "./services/checkBrokenConnections";
import type { IMessagesExpire } from "./services/messagesExpire";
import { MessagesExpire } from "./services/messagesExpire";
import type { IWebSocketServer } from "./services/webSocketServer";
import { WebSocketServer } from "./services/webSocketServer";
import { MessageHandler } from "./messageHandler";
import { Api } from "./api";
import type { IClient } from "./models/client";
import type { IMessage } from "./models/message";
import type { IConfig } from "./config";

export interface PeerServerEvents {
	on(event: "connection", listener: (client: IClient) => void): this;
	on(
		event: "message",
		listener: (client: IClient, message: IMessage) => void,
	): this;
	on(event: "disconnect", listener: (client: IClient) => void): this;
	on(event: "error", listener: (client: Error) => void): this;
}

export const createInstance = ({
	app,
	server,
	options,
}: {
	app: express.Application;
	server: HttpServer | HttpsServer;
	options: IConfig;
}): void => {
	const config = options;
	const realm: IRealm = new Realm();
	const messageHandler = new MessageHandler(realm);

	const api = Api({ config, realm, corsOptions: options.corsOptions });
	const messagesExpire: IMessagesExpire = new MessagesExpire({
		realm,
		config,
		messageHandler,
	});
	const checkBrokenConnections = new CheckBrokenConnections({
		realm,
		config,
		onClose: (client) => {
			app.emit("disconnect", client);
		},
	});

	app.use(options.path, api);

	//use mountpath for WS server
	const customConfig = {
		...config,
		path: path.posix.join(app.path(), options.path, "/"),
	};

	const wss: IWebSocketServer = new WebSocketServer({
		server,
		realm,
		config: customConfig,
	});

	wss.on("connection", (client: IClient) => {
		const messageQueue = realm.getMessageQueueById(client.getId());

		if (messageQueue) {
			let message: IMessage | undefined;

			while ((message = messageQueue.readMessage())) {
				messageHandler.handle(client, message);
			}
			realm.clearMessageQueue(client.getId());
		}

		app.emit("connection", client);
	});

	wss.on("message", (client: IClient, message: IMessage) => {
		app.emit("message", client, message);
		messageHandler.handle(client, message);
	});

	wss.on("close", (client: IClient) => {
		app.emit("disconnect", client);
	});

	wss.on("error", (error: Error) => {
		app.emit("error", error);
	});

	messagesExpire.startMessagesExpiration();
	checkBrokenConnections.start();
};
