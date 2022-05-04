import { readFileSync } from "fs";
import { createServer } from "https";
import { HealerApplication } from "./application/healer/HealerApplication";
import { TurretOperatorApplication } from "./application/turret/TurretOperatorApplication";
import { HealerGroup } from "./domain/healer/HealerGroup";
import { TurretOperatorGroup } from "./domain/turret/TurretOperatorGroup";
import { DrednotBotFactory } from "./infrastructure/drednot/DrednotBotFactory";
import { MouseService } from "./infrastructure/mouse/MouseService";
import { HealerController } from "./presentation/controller/healer/HealerController";

(async () => {
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

  const port = 4433;
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
