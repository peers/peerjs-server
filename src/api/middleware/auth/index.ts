import express from "express";
import { IConfig } from "../../../config";
import { Errors } from "../../../enums";
import { IRealm } from "../../../models/realm";
import { IMiddleware } from "../middleware";

export class AuthMiddleware implements IMiddleware {

  constructor(private readonly config: IConfig, private readonly realm: IRealm) { }

  public handle = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { id, token, key } = req.params;

    if (key !== this.config.key) {
      return res.status(401).send(Errors.INVALID_KEY);
    }

    if (!id) {
      return res.sendStatus(401);
    }

    const client = this.realm.getClientById(id);

    if (!client) {
      return res.sendStatus(401);
    }

    if (client.getToken() && token !== client.getToken()) {
      return res.status(401).send(Errors.INVALID_TOKEN);
    }

    next();
  };

}
