import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { IConfig } from "../config";
import { IMessageHandler } from "../messageHandler";
import { IRealm } from "../models/realm";
import { AuthMiddleware } from "./middleware/auth";
import CallsApi from "./v1/calls";
import PublicApi from "./v1/public";

export const Api = ({ config, realm, messageHandler }: {
  config: IConfig;
  realm: IRealm;
  messageHandler: IMessageHandler;
}): express.Router => {
  const authMiddleware = new AuthMiddleware(config, realm);

  const app = express.Router();

  const jsonParser = bodyParser.json();

  app.use(cors());

  app.use("/:key", PublicApi({ config, realm }));
  app.use("/:key/:id/:token", authMiddleware.handle, jsonParser, CallsApi({ realm, messageHandler }));

  return app;
};
