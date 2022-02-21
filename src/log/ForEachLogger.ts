import { Logger } from "./Logger";

export class ForEachLogger implements Logger {
  constructor(private readonly loggers: Logger[]) {}

  log(...args: any[]) {
    for (const logger of this.loggers) {
      logger.log(args);
    }
  }
}
