import type { MessageType } from "../enums";

export interface IMessage {
	readonly type: MessageType;
	readonly src: string;
	readonly dst: string;
	readonly payload?: string | undefined;
}
