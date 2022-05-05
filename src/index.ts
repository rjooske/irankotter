import { readFileSync } from "fs";
import { createServer } from "https";
import { HealerApplication } from "./application/healer/HealerApplication";
import { TurretOperatorApplication } from "./application/turret/TurretOperatorApplication";
import { HealerGroup } from "./domain/healer/HealerGroup";
import { Logger } from "./domain/log/Logger";
import { TurretOperatorGroup } from "./domain/turret/TurretOperatorGroup";
import { DrednotBotFactory } from "./infrastructure/drednot/DrednotBotFactory";
import { MouseService } from "./infrastructure/mouse/MouseService";
import { HealerController } from "./presentation/controller/healer/HealerController";

(async () => {
  const logger = (s: string) => {
    const time = new Date(Date.now()).toISOString();
    console.log(`${time} | ${s}`);
  };

  const server = createHttpsServer(
    "cert/localhost/localhost.crt",
    "cert/localhost/localhost.key",
    logger
  );

  const drednotBotFactory = new DrednotBotFactory(true);
  const mouseService = new MouseService(server, logger);

  new HealerController(
    server,
    new HealerApplication(new HealerGroup(drednotBotFactory, logger))
  );
  new TurretOperatorApplication(
    new TurretOperatorGroup(drednotBotFactory, mouseService, logger)
  );

  const port = 4433;
  server.listen(port, () => logger(`server started at ${port}`));
})();

function createHttpsServer(
  certificatePath: string,
  keyPath: string,
  logger: Logger
) {
  return createServer(
    { cert: readFileSync(certificatePath), key: readFileSync(keyPath) },
    (request, response) => {
      logger(
        `got "${request.method} ${request.url}" from ${request.headers.origin}`
      );

      response.setHeader("Access-Control-Allow-Origin", "*");
      response.setHeader("Access-Control-Allow-Headers", "*");
      response.setHeader("Access-Control-Allow-Methods", "OPTIONS, POST, GET");
      response.setHeader("Access-Control-Max-Age", 2592000);

      if (request.method === "OPTIONS") {
        response.writeHead(204);
        response.end();
        return;
      }

      if (request.url === "/") {
        response.writeHead(200);
        response.end("OK");
      }
    }
  );
}
