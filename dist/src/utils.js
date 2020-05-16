"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require("chalk");
const stackTrace = require("stack-trace");
exports.clog = (message) => {
    console.log(chalk.blue(message));
};
exports.trace = () => {
    stackTrace
        .get()
        .filter((site) => !site.getFileName().includes("node_modules"))
        .map((site) => {
        console.log(chalk.red(`${site.getFileName()} --- ${site.getLineNumber()}`));
    });
};
