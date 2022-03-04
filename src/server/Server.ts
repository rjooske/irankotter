import { Application, json } from "express";
import { inspect } from "util";
import { ErrorReceiver } from "../error/ErrorReceiver";
import { Logger } from "../log/Logger";
import { ServerEndpoint } from "./ServerEndpoint";

export class Server {
  constructor(
    app: Application,
    endpoints: ServerEndpoint[],
    errorReceiver: ErrorReceiver,
    logger: Logger
  ) {
    app.use(json());

    for (const endpoint of endpoints) {
      app.post(endpoint.path, (req, res) => {
        logger.log(
          `${endpoint.path} received ${inspect(req.body, { compact: true })}`
        );

        try {
          const output = endpoint.handler(req.body);
          res.send(JSON.stringify(output));
        } catch (error) {
          errorReceiver(error);
        }
      });
    }
  }
}
