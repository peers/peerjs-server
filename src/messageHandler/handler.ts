import type { IClient } from "../models/client";
import type { IMessage } from "../models/message";

export type Handler = (
	client: IClient | undefined,
	message: IMessage,
) => boolean;
