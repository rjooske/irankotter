import { Logger } from "./Logger";

export class ConsoleLogger implements Logger {
  constructor(private readonly id: number) {}

  log(s: any) {
    console.log([new Date().toISOString(), this.id, s].join(" "));
  }
}
