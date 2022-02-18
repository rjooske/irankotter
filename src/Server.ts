import bodyParser from "body-parser";
import { EventEmitter } from "events";
import express, { Request, Response } from "express";
import { readFileSync } from "fs";
import { join } from "path";
import TypedEventEmitter from "typed-emitter";

type Events = {
  summon: (click: string, url: string, count: number) => void;
  kill: (id: string) => void;
  shutdown: () => void;
};

type StringProvider = () => string;

export class Server extends (EventEmitter as new () => TypedEventEmitter<Events>) {
  constructor(
    readonly port: number,
    private readonly rootPath: string,
    private readonly createHealerList: StringProvider,
    private readonly createUpdateNotification: StringProvider
  ) {
    super();

    const app = express();
    app.use(bodyParser.json());
    app.get("/", this.handleGetRoot.bind(this));
    app.post("/summon", this.handleSummon.bind(this));
    app.post("/kill", this.handleKill.bind(this));
    app.post("/shutdown", this.handleShutdown.bind(this));
    app.use(express.static(rootPath));
    app.listen(port);
  }

  private handleGetRoot(_: Request, res: Response) {
    res.send(
      readFileSync(join(this.rootPath, "index.html"))
        .toString()
        .replace("__update_notification__", this.createUpdateNotification())
        .replace("__healers__", this.createHealerList())
    );
  }

  private handleSummon(req: Request, res: Response) {
    const click = req.body.click;
    if (typeof click !== "string") {
      res.sendStatus(400);
      return;
    }

    const url = req.body.url;
    if (typeof url !== "string") {
      res.sendStatus(400);
      return;
    }

    const count = req.body.count;
    if (typeof count !== "number" || count < 0) {
      res.sendStatus(400);
      return;
    }

    res.sendStatus(200);
    this.emit("summon", click, url, count);
  }

  private handleKill(req: Request, res: Response) {
    const id = req.body.id;
    if (typeof id !== "string") {
      res.sendStatus(400);
      return;
    }

    res.sendStatus(200);
    this.emit("kill", id);
  }

  private handleShutdown(_: Request, res: Response) {
    res.sendStatus(200);
    this.emit("shutdown");
  }
}
