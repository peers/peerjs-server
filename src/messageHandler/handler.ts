import type { IClient } from "../models/client.ts";
import type { IMessage } from "../models/message.ts";

export type Handler = (
	client: IClient | undefined,
	message: IMessage,
) => boolean;
