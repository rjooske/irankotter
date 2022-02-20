import bodyParser from "body-parser";
import { EventEmitter } from "events";
import express, { Request, Response } from "express";
import TypedEventEmitter from "typed-emitter";
import { Healer } from "./Healer";

type Events = {
  summon: (click: string, url: string, count: number) => void;
  kill: (id: string) => void;
  shutdown: () => void;
};

type HealerLister = () => Healer[];

export class Server extends (EventEmitter as new () => TypedEventEmitter<Events>) {
  constructor(
    readonly port: number,
    readonly rootPath: string,
    private readonly getHealers: HealerLister
  ) {
    super();

    const app = express();
    app.use(bodyParser.json());
    app.post("/summon", this.handleSummon.bind(this));
    app.post("/kill", this.handleKill.bind(this));
    app.post("/shutdown", this.handleShutdown.bind(this));
    app.get("/healers", this.handleHealers.bind(this));
    app.use(express.static(rootPath));
    app.listen(port);
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

  private handleHealers(_: Request, res: Response) {
    res.send(
      JSON.stringify(
        this.getHealers().map((healer) => ({
          id: healer.id,
          shipName: healer.shipName,
        }))
      )
    );
  }
}
