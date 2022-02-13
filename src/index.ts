import commandLineArgs from "command-line-args";
import { argv } from "process";
import { Healer } from "./Healer";
import { Server } from "./Server";

interface Options {
  timeout?: number;
}

const healers: Healer[] = [];

async function main() {
  const options = parseArguments(argv.slice(2));
  if (!options) {
    console.error(
      `
Usage: npm start -- -t (Timeout for UI navigation in seconds, Default: 30)

Example, Use the default timeout value:
    npm start

Example, Set the timeout to 120 seconds:
    npm start -- -t 120
      `.trim()
    );
    return;
  }

  const port = 6565;
  const timeout = options.timeout ?? 30;
  const server = new Server(port, "page", createHealerList);
  server.on("summon", (url, count) => {
    for (let i = 0; i < count; i++) {
      const healer = new Healer(url, timeout);
      healer.join().catch(() => killHealer(healer.id));
      healer.waitUntilExit().then(() => killHealer(healer.id));
      healers.push(healer);
    }
  });
  server.on("kill", (id) => killHealer(id));

  console.log(`Listening on localhost:${port}`);
  console.log(`Timeout after ${options.timeout ?? 30}s`);
  console.log("Control + C to stop");
}

function parseArguments(args: string[]) {
  try {
    return commandLineArgs([{ name: "timeout", alias: "t", type: Number }], {
      argv: args,
    }) as Options;
  } catch {}
}

function createHealerList() {
  if (healers.length == 0) {
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

function killHealer(id: string) {
  for (let i = 0; i < healers.length; i++) {
    const healer = healers[i];
    if (healer.id === id) {
      healer.leave();
    }
    healers.splice(i, 1);
    return;
  }
}

main();
