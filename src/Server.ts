import { EventEmitter } from "events";
import express, { Request, Response } from "express";
import { readFileSync } from "fs";
import { join } from "path";
import TypedEmitter from "typed-emitter";

type Events = {
  summon: (url: string, count: number) => void;
};

export class Server extends (EventEmitter as new () => TypedEmitter<Events>) {
  constructor(port: number, private readonly rootPath: string) {
    super();

    const app = express();
    app.get("/", this.handleGetRoot.bind(this));
    app.get("/summon", this.handleSummon.bind(this));
    app.use(express.static(rootPath));
    app.listen(port);
  }

  private handleGetRoot(_: Request, res: Response) {
    res.send(
      readFileSync(join(this.rootPath, "index.html"))
        .toString()
        .replace("__healers__", "")
    );
  }

  private handleSummon(req: Request, res: Response) {
    const url = req.query.url;
    const count = req.query.count;
    if (
      typeof url === "string" &&
      typeof count === "string" &&
      parseInt(count) > 0
    ) {
      this.emit("summon", url, parseInt(count));
    }

    res.redirect(301, "/");
  }
}
