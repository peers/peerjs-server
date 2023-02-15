import { describe, expect, it } from "@jest/globals";

import { Client } from "../../../../src/models/client";
import { HeartbeatHandler } from "../../../../src/messageHandler/handlers";

describe("Heartbeat handler", () => {
	it("should update last ping time", () => {
		const client = new Client({ id: "id", token: "" });
		client.setLastPing(0);

		const nowTime = new Date().getTime();

		HeartbeatHandler(client);
		expect(client.getLastPing()).toBeGreaterThanOrEqual(nowTime - 2);
		expect(nowTime).toBeGreaterThanOrEqual(client.getLastPing() - 2);
	});
});
