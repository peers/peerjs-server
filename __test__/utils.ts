import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import path from "path";

export const wait = (ms: number): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, ms));

export const startServer = (params: string[] = []) => {
	return new Promise<ChildProcessWithoutNullStreams>((resolve, reject) => {
		const ls = spawn("node", [
			path.join(__dirname, "../", "dist/bin/peerjs.js"),
			"--port",
			"9000",
			...params,
		]);
		ls.stdout.once("data", () => resolve(ls));
		ls.stderr.once("data", () => {
			ls.kill();
			reject();
		});
	});
};
