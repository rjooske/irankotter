import { appendFile } from "fs";
import { Logger } from "./Logger";

export class FileLogger implements Logger {
  constructor(private readonly name: string, private readonly path: string) {}

  log(...args: any[]) {
    appendFile(
      this.path,
      [new Date().toISOString(), this.name, ...args].join(" ") + "\n",
      (error) => {
        console.error(error);
      }
    );
  }
}
