import { appendFile } from "fs";
import { Logger } from "./Logger";

export class FileLogger implements Logger {
  constructor(private readonly id: string, private readonly path: string) {}

  log(...args: any[]) {
    appendFile(
      this.path,
      [new Date().toISOString(), this.id, ...args].join(" "),
      (error) => {
        console.error(error);
      }
    );
  }
}
