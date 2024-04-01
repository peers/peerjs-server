import { describe, expect, it } from "@jest/globals";

import { Client } from "../../../src/models/client.ts";
import { Realm } from "../../../src/models/realm.ts";
import type { IMessage } from "../../../src/index.js";
import { MessagesExpire } from "../../../src/services/messagesExpire/index.ts";
import { MessageHandler } from "../../../src/messageHandler/index.ts";
import { MessageType } from "../../../src/enums.ts";
import { wait } from "../../utils.ts";

describe("MessagesExpire", () => {
	const createTestMessage = (dst: string): IMessage => {
		return {
			type: MessageType.OPEN,
			src: "src",
			dst,
		};
	};

	it("should remove client if no read from queue", async () => {
		const realm = new Realm();
		const messageHandler = new MessageHandler(realm);
		const checkInterval = 10;
		const expireTimeout = 50;
		const config = {
			cleanup_out_msgs: checkInterval,
			expire_timeout: expireTimeout,
		};

		const messagesExpire = new MessagesExpire({
			realm,
			config,
			messageHandler,
		});

		const client = new Client({ id: "id", token: "" });
		realm.setClient(client, "id");
		realm.addMessageToQueue(client.getId(), createTestMessage("dst"));

		messagesExpire.startMessagesExpiration();

		await wait(checkInterval * 2);

		expect(
			realm.getMessageQueueById(client.getId())?.getMessages().length,
		).toBe(1);

		await wait(expireTimeout);

		expect(realm.getMessageQueueById(client.getId())).toBeUndefined();

		messagesExpire.stopMessagesExpiration();
	});

	it("should fire EXPIRE message", async () => {
		const realm = new Realm();
		const messageHandler = new MessageHandler(realm);
		const checkInterval = 10;
		const expireTimeout = 50;
		const config = {
			cleanup_out_msgs: checkInterval,
			expire_timeout: expireTimeout,
		};

		const messagesExpire = new MessagesExpire({
			realm,
			config,
			messageHandler,
		});

		const client = new Client({ id: "id", token: "" });
		realm.setClient(client, "id");
		realm.addMessageToQueue(client.getId(), createTestMessage("dst1"));
		realm.addMessageToQueue(client.getId(), createTestMessage("dst2"));

		let handledCount = 0;

		messageHandler.handle = (client, message): boolean => {
			expect(client).toBeUndefined();
			expect(message.type).toBe(MessageType.EXPIRE);

			handledCount++;

			return true;
		};

		messagesExpire.startMessagesExpiration();

		await wait(checkInterval * 2);
		await wait(expireTimeout);

		expect(handledCount).toBe(2);

		messagesExpire.stopMessagesExpiration();
	});
});
