import { Logger } from "./Logger";

export class ForEachLogger implements Logger {
  constructor(private readonly loggers: Logger[]) {}

  log(s: string) {
    for (const logger of this.loggers) {
      logger.log(s);
    }
  }
}
