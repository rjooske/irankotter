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
import { Router } from "./presentation/controller/router/Router";
import { TurretOperatorController } from "./presentation/controller/turret-operator/TurretOperatorController";

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
  const router = new Router(server);

  const drednotBotFactory = new DrednotBotFactory(true);
  const mouseService = new MouseService(server, logger);

  new HealerController(
    router,
    new HealerApplication(new HealerGroup(drednotBotFactory, logger))
  );
  new TurretOperatorController(
    router,
    new TurretOperatorApplication(
      new TurretOperatorGroup(drednotBotFactory, mouseService, logger)
    )
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
    (request) => {
      logger(
        `received "${request.method} ${request.url}" from ${request.headers.origin}`
      );
    }
  );
}
