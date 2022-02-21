import { Logger } from "./Logger";

export class ConsoleLogger implements Logger {
  constructor(private readonly id: number) {}

  log(...args: any[]) {
    console.log([new Date().toISOString(), this.id, ...args].join(" "));
  }
}
