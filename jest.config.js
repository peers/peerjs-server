/** @type {import('jest').Config} */
const config = {
	testEnvironment: "node",
	transform: {
		"^.+\\.(t|j)sx?$": "@swc/jest",
	},
	transformIgnorePatterns: [
		// "node_modules"
	],
	collectCoverageFrom: ["./src/**"],
};

export default config;
