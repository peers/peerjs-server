import { describe, expect, it } from "@jest/globals";

import { MessageQueue } from "../../src/models/messageQueue.ts";
import { MessageType } from "../../src/enums.ts";
import type { IMessage } from "../../src/index.js";
import { wait } from "../utils.ts";

describe("MessageQueue", () => {
	const createTestMessage = (): IMessage => {
		return {
			type: MessageType.OPEN,
			src: "src",
			dst: "dst",
		};
	};

	describe("#addMessage", () => {
		it("should add message to queue", () => {
			const queue = new MessageQueue();
			queue.addMessage(createTestMessage());
			expect(queue.getMessages().length).toBe(1);
		});
	});

	describe("#readMessage", () => {
		it("should return undefined for empty queue", () => {
			const queue = new MessageQueue();
			expect(queue.readMessage()).toBeUndefined();
		});

		it("should return message if any exists in queue", () => {
			const queue = new MessageQueue();
			const message = createTestMessage();
			queue.addMessage(message);

			expect(queue.readMessage()).toEqual(message);
			expect(queue.readMessage()).toBeUndefined();
		});
	});

	describe("#getLastReadAt", () => {
		it("should not be changed if no messages when read", () => {
			const queue = new MessageQueue();
			const lastReadAt = queue.getLastReadAt();
			queue.readMessage();
			expect(queue.getLastReadAt()).toBe(lastReadAt);
		});

		it("should be changed when read message", async () => {
			const queue = new MessageQueue();
			const lastReadAt = queue.getLastReadAt();
			queue.addMessage(createTestMessage());

			await wait(10);

			expect(queue.getLastReadAt()).toBe(lastReadAt);

			queue.readMessage();

			expect(queue.getLastReadAt()).toBeGreaterThanOrEqual(lastReadAt + 10 - 2);
		});
	});
});
