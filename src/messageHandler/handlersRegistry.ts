import type { MessageType } from "../enums.ts";
import type { IClient } from "../models/client.ts";
import type { IMessage } from "../models/message.ts";
import type { Handler } from "./handler.ts";

export interface IHandlersRegistry {
	registerHandler(messageType: MessageType, handler: Handler): void;
	handle(client: IClient | undefined, message: IMessage): boolean;
}

export class HandlersRegistry implements IHandlersRegistry {
	private readonly handlers = new Map<MessageType, Handler>();

	public registerHandler(messageType: MessageType, handler: Handler): void {
		if (this.handlers.has(messageType)) return;

		this.handlers.set(messageType, handler);
	}

	public handle(client: IClient | undefined, message: IMessage): boolean {
		const { type } = message;

		const handler = this.handlers.get(type);

		if (!handler) return false;

		return handler(client, message);
	}
}
