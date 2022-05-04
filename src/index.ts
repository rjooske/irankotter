// import commandLineArgs from "command-line-args";

import { readFileSync } from "fs";
import { createServer } from "https";
import { HealerApplication } from "./application/healer/HealerApplication";
import { TurretOperatorApplication } from "./application/turret/TurretOperatorApplication";
import { HealerGroup } from "./domain/healer/HealerGroup";
import { TurretOperatorGroup } from "./domain/turret/TurretOperatorGroup";
import { DrednotBotFactory } from "./infrastructure/drednot/DrednotBotFactory";
import { MouseService } from "./infrastructure/mouse/MouseService";
import { HealerController } from "./presentation/controller/healer/HealerController";

// interface Options {
//   development: boolean;
//   windowed: boolean;
//   click: string;
//   url: string;
//   population: number;
//   timeout: number;
// }

// const options = parseArguments(argv.slice(2));

// function parseArguments(args: string[]) {
//   try {
//     const options = {
//       development: false,
//       windowed: false,
//       timeout: 30,
//       ...(commandLineArgs(
//         [
//           { name: "development", alias: "d", type: Boolean },
//           { name: "windowed", alias: "w", type: Boolean },
//           { name: "click", alias: "c", type: String },
//           { name: "url", alias: "u", type: String },
//           { name: "population", alias: "p", type: Number },
//           { name: "timeout", alias: "t", type: Number },
//         ],
//         {
//           argv: args,
//           camelCase: true,
//         }
//       ) as Partial<Options>),
//     };

//     options.timeout *= 1000;

//     if (options.development) {
//       if (!options.click || !options.url || !options.population) {
//         throw new Error();
//       }
//     }

//     return options as Options;
//   } catch {
//     console.error(
//       `
// Invalid options
// Help page: https://github.com/EnkaOsaru/healer/wiki/%E5%AE%9F%E8%A1%8C
//       `.trim()
//     );
//     exit(1);
//   }
// }

// const botManager = new BotManager();

// async function main() {
//   // if (process.platform === "darwin") {
//   //   return;
//   // }

//   if (options.development) {
//     mainDevelopment();
//   } else {
//     await mainProduction();
//   }

//   console.log("Control + C to stop");
// }

// async function mainProduction() {
//   const app = express();
//   app.use(express.static(join(cwd(), "page")));

//   new Server(
//     app,
//     [
//       {
//         path: "/summon",
//         handler: (input) => {
//           const { click, url, count } = input;
//           if (
//             typeof click !== "string" ||
//             typeof url !== "string" ||
//             typeof count !== "number"
//           ) {
//             throw new Error("Bad input in /summon");
//           }

//           if (click !== "above" && click !== "left" && click !== "right") {
//             throw new Error(`"${click}" is not a valid option`);
//           }

//           for (let i = 0; i < count; i++) {
//             botManager.createHealer(url, click);
//           }
//         },
//       },
//       {
//         path: "/kill",
//         handler: (input) => {
//           const { id } = input;
//           if (typeof id !== "string") {
//             throw new Error("Bad input in /kill");
//           }

//           if (!botManager.getBots().some((e) => e.id === id)) {
//             throw new Error(`Bot of id "${id}" does not exist`);
//           }

//           botManager.kill(id);
//         },
//       },
//       {
//         path: "/healers",
//         handler: () =>
//           botManager
//             .getBots()
//             .map((e) => ({ id: e.id, shipName: e.joiner.shipName })),
//       },
//       {
//         path: "/shutdown",
//         handler: () => {
//           console.log("Shutting down");
//           exit(0);
//         },
//       },
//     ],
//     (error) => console.error(error),
//     new ConsoleLogger("server")
//   );

//   const port = 6565;
//   const httpsServer = createSecureServer(app);
//   await new Promise<void>((res) => httpsServer.listen(port, res));

//   console.log(`Healer Control Panel running at https://localhost:${port}`);
// }

// function createSecureServer(app: Application) {
//   const key = readFileSync("cert/localhost/localhost.decrypted.key").toString();
//   const cert = readFileSync("cert/localhost/localhost.crt").toString();
//   return createServer({ key, cert }, app);
// }

// function mainDevelopment() {
//   handleSummon(options.click, options.url, options.population);
// }

// function handleSummon(click: string, url: string, count: number) {
//   if (click !== "above" && click !== "left" && click !== "right") {
//     return;
//   }

//   for (let i = 0; i < count; i++) {
//     botManager.createHealer(url, click);
//   }
// }

// main();

(async () => {
  // const mouseService = new MouseService();
  // const turretOperatorGroup = new TurretOperatorGroup(
  //   new DrednotBotFactory(false),
  //   mouseService,
  //   (log) => console.log(log)
  // );
  // await turretOperatorGroup.create(
  //   "https://test.drednot.io/invite/VtRqyN08DyngT4fvLr_FOPaL"
  // );
  // const healerController = new HealerController((log) => console.log(log));
  // healerController.create(
  //   "https://test.drednot.io/invite/VtRqyN08DyngT4fvLr_FOPaL",
  //   "right"
  // );

  const server = createHttpsServer(
    "cert/localhost/localhost.crt",
    "cert/localhost/localhost.key"
  );

  const logger = (s: string) => {
    const time = new Date(Date.now()).toISOString();
    console.log(`${time} | ${s}`);
  };

  const drednotBotFactory = new DrednotBotFactory(false);
  const mouseService = new MouseService(server, logger);

  new HealerController(
    server,
    new HealerApplication(new HealerGroup(drednotBotFactory, logger)),
    logger
  );
  new TurretOperatorApplication(
    new TurretOperatorGroup(drednotBotFactory, mouseService, logger)
  );

  const port = 8080;
  server.listen(port, () => logger(`server started at ${port}`));
})();

function createHttpsServer(certificatePath: string, keyPath: string) {
  return createServer(
    { cert: readFileSync(certificatePath), key: readFileSync(keyPath) },
    (request, response) => {
      if (request.url === "/") {
        response.writeHead(200);
        response.end("OK");
      }
    }
  );
}
