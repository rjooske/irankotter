import { appendFile } from "fs";
import { Logger } from "./Logger";

export class FileLogger implements Logger {
  constructor(private readonly id: string, private readonly path: string) {}

  log(s: string) {
    appendFile(
      this.path,
      [new Date().toISOString(), this.id, s].join(" "),
      (error) => {
        console.error(error);
      }
    );
  }
}
