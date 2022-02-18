import commandLineArgs from "command-line-args";
import { argv, exit } from "process";
import { Healer } from "./Healer";
import { Server } from "./Server";

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

const healers: Healer[] = [];

function main() {
  // if (process.platform === "darwin") {
  //   return;
  // }

  if (options.development) {
    mainDevelopment();
  } else {
    mainProduction();
  }

  console.log("Control + C to stop");
}

function mainProduction() {
  const server = new Server(6565, "page", createHealerList);
  server.on("summon", handleSummon);
  server.on("kill", handleKill);
  server.on("shutdown", handleShutdown);

  console.log(
    `Healer Control Panel running at http://localhost:${server.port}`
  );
}

function mainDevelopment() {
  handleSummon(options.click, options.url, options.population);
}

function createHealerList() {
  if (healers.length === 0) {
    return "";
  }

  const lis = healers
    .map((healer) => {
      const status = healer.shipName ? "up" : "boot";
      const label = healer.shipName ?? "Booting up...";
      return `
        <li class="round-left ${status}">
          <span class="label">${label}</span>
          <span class="kill" data-id="${healer.id}">Kill</span>
        </li>
      `;
    })
    .join("");

  return `<ul>${lis}</ul>`;
}

function handleSummon(click: string, url: string, count: number) {
  for (let i = 0; i < count; i++) {
    const healer = new Healer(click, url, !options.windowed, options.timeout);
    healer.on("error", () => handleKill(healer.id));
    healer.join();
    healers.push(healer);
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

function handleShutdown() {
  console.log("Shutting down");
  exit(0);
}

main();
