import commandLineArgs from "command-line-args";
import express from "express";
import { join } from "path";
import { argv, cwd, exit } from "process";
import { ConsoleLogger } from "./log/ConsoleLogger";
import { BotManager } from "./main/bot/BotManager";
import { Player } from "./Player";
import { Server } from "./server/Server";

interface Options {
  development: boolean;
  windowed: boolean;
  click: string;
  url: string;
  population: number;
  timeout: number;
}

const options = parseArguments(argv.slice(2));

function parseArguments(args: string[]) {
  try {
    const options = {
      development: false,
      windowed: false,
      timeout: 30,
      ...(commandLineArgs(
        [
          { name: "development", alias: "d", type: Boolean },
          { name: "windowed", alias: "w", type: Boolean },
          { name: "click", alias: "c", type: String },
          { name: "url", alias: "u", type: String },
          { name: "population", alias: "p", type: Number },
          { name: "timeout", alias: "t", type: Number },
        ],
        {
          argv: args,
          camelCase: true,
        }
      ) as Partial<Options>),
    };

    options.timeout *= 1000;

    if (options.development) {
      if (!options.click || !options.url || !options.population) {
        throw new Error();
      }
    }

    return options as Options;
  } catch {
    console.error(
      `
Invalid options
Help page: https://github.com/EnkaOsaru/healer/wiki/%E5%AE%9F%E8%A1%8C
      `.trim()
    );
    exit(1);
  }
}

const healers: Player[] = [];
const botManager = new BotManager();

async function main() {
  // if (process.platform === "darwin") {
  //   return;
  // }

  if (options.development) {
    mainDevelopment();
  } else {
    await mainProduction();
  }

  console.log("Control + C to stop");
}

async function mainProduction() {
  const app = express();
  app.use(express.static(join(cwd(), "page")));

  new Server(
    app,
    [
      {
        path: "/summon",
        handler: (input) => {
          const { click, url, count } = input;
          if (
            typeof click !== "string" ||
            typeof url !== "string" ||
            typeof count !== "number"
          ) {
            throw new Error("Bad input in /summon");
          }

          if (click !== "above" && click !== "left" && click !== "right") {
            throw new Error(`"${click}" is not a valid option`);
          }

          for (let i = 0; i < count; i++) {
            botManager.createHealer(url, click);
          }
        },
      },
      {
        path: "/kill",
        handler: (input) => {
          const { id } = input;
          if (typeof id !== "string") {
            throw new Error("Bad input in /kill");
          }

          if (!botManager.getBots().some((e) => e.id === id)) {
            throw new Error(`Bot of id "${id}" does not exist`);
          }

          botManager.kill(id);
        },
      },
      {
        path: "/healers",
        handler: () =>
          botManager
            .getBots()
            .map((e) => ({ id: e.id, shipName: e.joiner.shipName })),
      },
      {
        path: "/shutdown",
        handler: () => {
          console.log("Shutting down");
          exit(0);
        },
      },
    ],
    (error) => console.error(error),
    new ConsoleLogger("server  ")
  );

  const port = 6565;
  await new Promise<void>((res) => app.listen(port, res));

  console.log(`Healer Control Panel running at http://localhost:${port}`);
}

function mainDevelopment() {
  handleSummon(options.click, options.url, options.population);
}

function handleSummon(click: string, url: string, count: number) {
  if (click !== "above" && click !== "left" && click !== "right") {
    return;
  }

  for (let i = 0; i < count; i++) {
    botManager.createHealer(url, click);
  }
}

function handleKill(id: string) {
  for (let i = 0; i < healers.length; i++) {
    const healer = healers[i];
    if (healer.id === id) {
      healer.close();
      healers.splice(i, 1);
      break;
    }
  }
}

main();
