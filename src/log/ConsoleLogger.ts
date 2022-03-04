import { Logger } from "./Logger";

export class ConsoleLogger implements Logger {
  constructor(private readonly name: string) {}

  log(...args: any[]) {
    console.log([new Date().toISOString(), this.name, ...args].join(" "));
  }
}
