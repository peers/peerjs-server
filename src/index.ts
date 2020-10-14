import express from "express";
import http from "http";
import https from "https";
import { Server } from "net";

import defaultConfig, { IConfig } from "./config";
import { createInstance } from "./instance";

type Optional<T> = {
  [P in keyof T]?: (T[P] | undefined);
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

    createInstance({ app, server, options: newOptions });
  });

  return app;
}

function PeerServer(options: Optional<IConfig> = {}, callback?: (server: Server) => void) {
  const app = express();

  let newOptions: IConfig = {
    ...defaultConfig,
    ...options
  };

  const port = newOptions.port;
  const host = newOptions.host;

  let server: Server;

  const { ssl, ...restOptions } = newOptions;
  if (ssl && Object.keys(ssl).length) {
    server = https.createServer(ssl, app);

    newOptions = restOptions;
  } else {
    server = http.createServer(app);
  }

  const peerjs = ExpressPeerServer(server, newOptions);
  app.use(peerjs);

  server.listen(port, host, () => callback?.(server));

  return peerjs;
}

export {
  ExpressPeerServer,
  PeerServer
};
