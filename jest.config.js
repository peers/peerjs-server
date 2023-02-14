/** @type {import('jest').Config} */
const config = {
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
  collectCoverageFrom: ["./src/**"]
};

export default config;
