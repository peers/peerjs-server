import { IClient } from "../models/client";
import { IMessage } from "../models/message";

export type Handler = (client: IClient | undefined, message: IMessage) => boolean;
