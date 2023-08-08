import { describe, expect, it } from "@jest/globals";

import { Realm } from "../../src/models/realm.ts";
import { Client } from "../../src/models/client.ts";

describe("Realm", () => {
	describe("#generateClientId", () => {
		it("should generate a 36-character UUID, or return function value", () => {
			const realm = new Realm();
			expect(realm.generateClientId().length).toBe(36);
			expect(realm.generateClientId(() => "abcd")).toBe("abcd");
		});
	});

	describe("#setClient", () => {
		it("should add client to realm", () => {
			const realm = new Realm();
			const client = new Client({ id: "id", token: "" });

			realm.setClient(client, "id");
			expect(realm.getClientsIds()).toEqual(["id"]);
		});
	});

	describe("#removeClientById", () => {
		it("should remove client from realm", () => {
			const realm = new Realm();
			const client = new Client({ id: "id", token: "" });

			realm.setClient(client, "id");
			realm.removeClientById("id");

			expect(realm.getClientById("id")).toBeUndefined();
		});
	});

	describe("#getClientsIds", () => {
		it("should reflects on add/remove childs", () => {
			const realm = new Realm();
			const client = new Client({ id: "id", token: "" });

			realm.setClient(client, "id");
			expect(realm.getClientsIds()).toEqual(["id"]);

			expect(realm.getClientById("id")).toBe(client);

			realm.removeClientById("id");
			expect(realm.getClientsIds()).toEqual([]);
		});
	});
});
