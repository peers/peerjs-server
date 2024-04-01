import cors, { CorsOptions } from "cors";
import express from "express";
import publicContent from "../../app.json";
import PublicApi from "./v1/public/index.ts";
import type { IConfig } from "../config/index.ts";
import type { IRealm } from "../models/realm.ts";

export const Api = ({
	config,
	realm,
	corsOptions,
}: {
	config: IConfig;
	realm: IRealm;
	corsOptions: CorsOptions;
}): express.Router => {
	const app = express.Router();

	app.use(cors(corsOptions));

	app.get("/", (_, res) => {
		res.send(publicContent);
	});

	app.use("/:key", PublicApi({ config, realm }));

	return app;
};
