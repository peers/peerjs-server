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

  const newOptions: IConfig = {
    ...defaultConfig,
    ...options
  };

  const port = newOptions.port;

  let server: Server;

  if (newOptions.ssl && newOptions.ssl.key && newOptions.ssl.cert) {
    server = https.createServer(options.ssl!, app);
    // @ts-ignore
    delete newOptions.ssl;
  } else {
    server = http.createServer(app);
  }

  const peerjs = ExpressPeerServer(server, newOptions);
  app.use(peerjs);

  server.listen(port, () => callback?.(server));

  return peerjs;
}

export {
  ExpressPeerServer,
  PeerServer
};
