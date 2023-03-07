import { MessageType } from "../enums";
import { HeartbeatHandler, TransmissionHandler } from "./handlers";
import type { IHandlersRegistry } from "./handlersRegistry";
import { HandlersRegistry } from "./handlersRegistry";
import type { IClient } from "../models/client";
import type { IMessage } from "../models/message";
import type { IRealm } from "../models/realm";
import type { Handler } from "./handler";

export interface IMessageHandler {
	handle(client: IClient | undefined, message: IMessage): boolean;
}

export class MessageHandler implements IMessageHandler {
	constructor(
		realm: IRealm,
		private readonly handlersRegistry: IHandlersRegistry = new HandlersRegistry(),
	) {
		const transmissionHandler: Handler = TransmissionHandler({ realm });
		const heartbeatHandler: Handler = HeartbeatHandler;

		const handleTransmission: Handler = (
			client: IClient | undefined,
			{ type, src, dst, payload }: IMessage,
		): boolean => {
			return transmissionHandler(client, {
				type,
				src,
				dst,
				payload,
			});
		};

		const handleHeartbeat = (client: IClient | undefined, message: IMessage) =>
			heartbeatHandler(client, message);

		this.handlersRegistry.registerHandler(
			MessageType.HEARTBEAT,
			handleHeartbeat,
		);
		this.handlersRegistry.registerHandler(
			MessageType.OFFER,
			handleTransmission,
		);
		this.handlersRegistry.registerHandler(
			MessageType.ANSWER,
			handleTransmission,
		);
		this.handlersRegistry.registerHandler(
			MessageType.CANDIDATE,
			handleTransmission,
		);
		this.handlersRegistry.registerHandler(
			MessageType.LEAVE,
			handleTransmission,
		);
		this.handlersRegistry.registerHandler(
			MessageType.EXPIRE,
			handleTransmission,
		);
	}

	public handle(client: IClient | undefined, message: IMessage): boolean {
		return this.handlersRegistry.handle(client, message);
	}
}
