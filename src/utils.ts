const chalk = require("chalk");
const stackTrace = require("stack-trace");

export const clog = (message: string) => {
  console.log(chalk.blue(message));
};

export const trace = () => {
  stackTrace
    .get()
    .filter((site: any) => !site.getFileName().includes("node_modules"))
    .map((site: any) => {
      console.log(
        chalk.red(`${site.getFileName()} --- ${site.getLineNumber()}`)
      );
    });
};
