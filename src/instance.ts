import express from "express";
import { Server } from "net";
import path from 'path';
import { IClient } from "./models/client";
import { IMessage } from "./models/message";
import { Realm } from "./models/realm";
import { IRealm } from "./models/realm";
import { CheckBrokenConnections } from "./services/checkBrokenConnections";
import { IMessagesExpire, MessagesExpire } from "./services/messagesExpire";
import { IWebSocketServer, WebSocketServer } from "./services/webSocketServer";
import { MessageHandler } from "./messageHandler";
import { Api } from "./api";
import { IConfig } from "./config";

export const createInstance = ({ app, server, options }: {
  app: express.Application,
  server: Server,
  options: IConfig;
}): void => {
  const config = options;
  const realm: IRealm = new Realm();
  const messageHandler = new MessageHandler(realm);

  const api = Api({ config, realm, messageHandler });
  const messagesExpire: IMessagesExpire = new MessagesExpire({ realm, config, messageHandler });
  const checkBrokenConnections = new CheckBrokenConnections({
    realm,
    config,
    onClose: client => {
      app.emit("disconnect", client);
    }
  });

  app.use(options.path, api);

  //use mountpath for WS server
  const customConfig = { ...config, path: path.posix.join(app.path(), options.path, '/') };

  const wss: IWebSocketServer = new WebSocketServer({
    server,
    realm,
    config: customConfig
  });

  wss.on("connection", (client: IClient) => {
    const messageQueue = realm.getMessageQueueById(client.getId());

    if (messageQueue) {
      let message: IMessage | undefined;

      while (message = messageQueue.readMessage()) {
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