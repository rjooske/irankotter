import bodyParser from "body-parser";
import { EventEmitter } from "events";
import express, { Request, Response } from "express";
import { readFileSync } from "fs";
import { join } from "path";
import TypedEventEmitter from "typed-emitter";

type Events = {
  summon: (url: string, count: number) => void;
  kill: (id: string) => void;
};

type CreateHealerList = () => string;

export class Server extends (EventEmitter as new () => TypedEventEmitter<Events>) {
  constructor(
    port: number,
    private readonly rootPath: string,
    private readonly createHealerList: CreateHealerList
  ) {
    super();

    const app = express();
    app.use(bodyParser.json());
    app.get("/", this.handleGetRoot.bind(this));
    app.post("/summon", this.handleSummon.bind(this));
    app.post("/kill", this.handleKill.bind(this));
    app.use(express.static(rootPath));
    app.listen(port);
  }

  private handleGetRoot(_: Request, res: Response) {
    res.send(
      readFileSync(join(this.rootPath, "index.html"))
        .toString()
        .replace("__healers__", this.createHealerList())
    );
  }

  private handleSummon(req: Request, res: Response) {
    const url = req.body.url;
    const count = req.body.count;
    if (
      typeof url === "string" &&
      typeof count === "string" &&
      parseInt(count) > 0
    ) {
      this.emit("summon", url, parseInt(count));
    }
    res.sendStatus(200);
  }

  private handleKill(req: Request, res: Response) {
    const id = req.body.id;
    if (typeof id === "string") {
      this.emit("kill", id);
    }
    res.sendStatus(200);
  }
}
