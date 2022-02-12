import commandLineArgs from "command-line-args";
import { argv } from "process";
import { Healer } from "./Healer";

interface Options {
  url?: string;
  population?: number;
  timeout?: number;
}

async function main() {
  const options = parseArguments(argv.slice(2));
  if (!options.url || !options.population) {
    console.error(
      [
        "Usage   : npm start -- -p (Number of bots to send) -u (Invitation link) -t (Timeout for UI navigation in seconds, Default: 30)",
        "Example : npm start -- -p 4 -u https://drednot.io/invite/abcdefghijklmn",
        "Example : npm start -- -p 2 -u https://drednot.io/invite/opqrstuvwxyz -t 120",
      ].join("\n")
    );
    return;
  }

  const healers = await Promise.all(
    new Array<[string, number]>(options.population)
      .fill([options.url, (options.timeout ?? 30) * 1000])
      .map(([url, timeout]) => Healer.join(url, timeout))
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
      { name: "timeout", alias: "t", type: Number },
    ],
    { argv: args, partial: true }
  ) as Options;
}

main();
