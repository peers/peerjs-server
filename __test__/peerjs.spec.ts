import { describe, expect, it } from "@jest/globals";

import http from "http";
import expectedJson from "../app.json";
import fetch from "node-fetch";
import * as crypto from "crypto";
import { startServer } from "./utils.ts";

const PORT = "9000";

async function makeRequest() {
	return new Promise<object>((resolve, reject) => {
		http
			.get(`http://localhost:${PORT}/`, (resp) => {
				let data = "";

				resp.on("data", (chunk) => {
					data += chunk;
				});

				resp.on("end", () => {
					resolve(JSON.parse(data));
				});
			})
			.on("error", (err) => {
				console.log("Error: " + err.message);
				reject(err);
			});
	});
}

describe("Check bin/peerjs", () => {
	it("should return content of app.json file", async () => {
		expect.assertions(1);

		const ls = await startServer();
		try {
			const resp = await makeRequest();
			expect(resp).toEqual(expectedJson);
		} finally {
			ls.kill();
		}
	});

	it("should reflect the origin header in CORS by default", async () => {
		expect.assertions(1);

		const ls = await startServer();
		const origin = crypto.randomUUID();
		try {
			const res = await fetch(`http://localhost:${PORT}/peerjs/id`, {
				headers: {
					Origin: origin,
				},
			});
			expect(res.headers.get("access-control-allow-origin")).toBe(origin);
		} finally {
			ls.kill();
		}
	});
	it("should respect the CORS parameters", async () => {
		expect.assertions(3);

		const origin1 = crypto.randomUUID();
		const origin2 = crypto.randomUUID();
		const origin3 = crypto.randomUUID();
		const ls = await startServer(["--cors", origin1, "--cors", origin2]);
		try {
			const res1 = await fetch(`http://localhost:${PORT}/peerjs/id`, {
				headers: {
					Origin: origin1,
				},
			});
			expect(res1.headers.get("access-control-allow-origin")).toBe(origin1);
			const res2 = await fetch(`http://localhost:${PORT}/peerjs/id`, {
				headers: {
					Origin: origin2,
				},
			});
			expect(res2.headers.get("access-control-allow-origin")).toBe(origin2);
			const res3 = await fetch(`http://localhost:${PORT}/peerjs/id`, {
				headers: {
					Origin: origin3,
				},
			});
			expect(res3.headers.get("access-control-allow-origin")).toBe(null);
		} finally {
			ls.kill();
		}
	});
});
