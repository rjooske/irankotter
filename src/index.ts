import commandLineArgs from "command-line-args";
import { argv } from "process";
import { Healer } from "./Healer";

interface Options {
  url?: string;
  population?: number;
}

async function main() {
  const options = parseArguments(argv.slice(2));
  if (!options.url || !options.population) {
    console.error(
      [
        "Usage   : npm start -- -p (Number of bots to send) -u (Invitation link)",
        "Example : npm start -- -p 4 -u https://drednot.io/invite/abcdefghijklmn",
      ].join("\n")
    );
    return;
  }

  const healers = await Promise.all(
    new Array<string>(options.population)
      .fill(options.url)
      .map((url) => Healer.join(url))
  );

  console.log("Control + C to stop");

  await Promise.any([
    new Promise((res) => process.on("SIGINT", res)),
    Promise.all(healers.map((healer) => healer.waitUntilExit())),
  ]);

  await Promise.all(healers.map((healer) => healer.leave()));
}

function parseArguments(args: string[]) {
  return commandLineArgs(
    [
      { name: "url", alias: "u", type: String },
      { name: "population", alias: "p", type: Number },
    ],
    { argv: args, partial: true }
  ) as Options;
}

main();
