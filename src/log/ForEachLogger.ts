import { Logger } from "./Logger";

export class ForEachLogger implements Logger {
  constructor(private readonly loggers: Logger[]) {}

  log(s: any) {
    for (const logger of this.loggers) {
      logger.log(s);
    }
  }
}
