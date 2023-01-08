import cors from "cors";
import express from "express";
import publicContent from "../../app.json";
import PublicApi from "./v1/public";
import type {IConfig} from "../config";
import type {IRealm} from "../models/realm";

export const Api = ({ config, realm }: {
  config: IConfig;
  realm: IRealm;
}): express.Router => {
  const app = express.Router();

  app.use(cors());

  app.get("/", (_, res) => {
    res.send(publicContent);
  });

  app.use("/:key", PublicApi({ config, realm }));

  return app;
};
