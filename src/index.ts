import { IRealm } from "./models/realm";

import express from "express";
import http from "http";
import https from "https";

import { Server } from "net";
import defaultConfig, { IConfig } from "../config";
import { Api } from "./api";
import { MessageHandler } from "./messageHandler";
import { IClient } from "./models/client";
import { IMessage } from "./models/message";
import { Realm } from "./models/realm";
import { CheckBrokenConnections } from "./services/checkBrokenConnections";
import { IMessagesExpire, MessagesExpire } from "./services/messagesExpire";
import { IWebSocketServer, WebSocketServer } from "./services/webSocketServer";

const init = ({ app, server, options }: {
  app: express.Express,
  server: Server,
  options: IConfig
}) => {
  const config = options;
  const realm: IRealm = new Realm();
  const messageHandler = new MessageHandler(realm);
  const api = Api({ config, realm, messageHandler });

  const messagesExpire: IMessagesExpire = new MessagesExpire({ realm, config, messageHandler });
  const checkBrokenConnections = new CheckBrokenConnections({
    realm,
    config,
    onClose: (client: IClient) => {
      app.emit("disconnect", client);
    }
  });

  app.use(options.path, api);

  const wss: IWebSocketServer = new WebSocketServer({
    server,
    realm,
    config: {
      ...config,
    }
  });

  wss.on("connection", (client: IClient) => {
    const messageQueue = realm.getMessageQueueById(client.getId());

    if (messageQueue) {
      let message: IMessage | null;

      // tslint:disable
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

function ExpressPeerServer(server: Server, options?: IConfig) {
  const app = express();

  const newOptions: IConfig = {
    ...defaultConfig,
    ...options
  };

  if (newOptions.proxied) {
    app.set("trust proxy", newOptions.proxied === "false" ? false : !!newOptions.proxied);
  }

  app.on("mount", () => {
    if (!server) {
      throw new Error("Server is not passed to constructor - " +
        "can't start PeerServer");
    }

    init({ app, server, options: newOptions });
  });

  return app;
}

type Optional<T> = {
  [P in keyof T]?: (T[P] | undefined);
};

function PeerServer(options: Optional<IConfig> = {}, callback?: (server: Server) => void) {
  const app = express();

  const newOptions: IConfig = {
    ...defaultConfig,
    ...options
  };

  let path = newOptions.path;
  const port = newOptions.port;

  if (path[0] !== "/") {
    path = "/" + path;
  }

  if (path[path.length - 1] !== "/") {
    path += "/";
  }

  let server: Server;

  if (newOptions.ssl && newOptions.ssl.key && newOptions.ssl.cert) {
    server = https.createServer(options.ssl, app);
    // @ts-ignore
    delete newOptions.ssl;
  } else {
    server = http.createServer(app);
  }

  const peerjs = ExpressPeerServer(server, newOptions);
  app.use(peerjs);

  if (callback) {
    server.listen(port, () => callback(server));
  } else {
    server.listen(port);
  }

  return peerjs;
}

export {
  ExpressPeerServer,
  PeerServer
};
