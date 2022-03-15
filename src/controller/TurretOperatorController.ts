import puppeteer from "puppeteer";
import { TurretOperator } from "../application/TurretOperator";
import { ErrorReceiver } from "../domain/error/ErrorReceiver";
import { Logger } from "../domain/log/Logger";
import { MouseService } from "../domain/mouse/MouseService";
import { DrednotBot } from "../infrastructure/drednot/DrednotBot";

export class TurretOperatorController {
  readonly operators: TurretOperator[] = [];

  constructor(
    private readonly mouseService: MouseService,
    private readonly logger: Logger
  ) {}

  async create(url: string) {
    const errorReceiver: ErrorReceiver = (error) => {
      bot.close().catch(this.logError);
      this.removeTurretOperator(operator);
      this.logError(error);
    };

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const bot = new DrednotBot(page);
    await bot.join(url);

    const operator = new TurretOperator(
      bot,
      this.mouseService,
      errorReceiver,
      this.logger
    );
    this.operators.push(operator);
  }

  private removeTurretOperator(operator: TurretOperator) {
    for (let i = 0; i < this.operators.length; i++) {
      if (this.operators[i] === operator) {
        this.operators.splice(i, 1);
        return;
      }
    }
  }

  private logError(error: unknown) {
    if (error instanceof Error) {
      this.logger(error.message);
    } else {
      this.logger(`error of type "${typeof error}" occurred`);
    }
  }
}
