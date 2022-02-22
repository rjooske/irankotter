import { Logger } from "./Logger";

export class ConsoleLogger implements Logger {
  constructor(private readonly id: string) {}

  log(...args: any[]) {
    console.log([new Date().toISOString(), this.id, ...args].join(" "));
  }
}
