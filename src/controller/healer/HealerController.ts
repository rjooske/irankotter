import puppeteer from "puppeteer";
import { Healer } from "../../application/healer/Healer";
import { HealerClickDirection } from "../../application/healer/HealerClickDirection";
import { ErrorReceiver } from "../../domain/error/ErrorReceiver";
import { Logger } from "../../domain/log/Logger";
import { DrednotBot } from "../../infrastructure/drednot/DrednotBot";

export class HealerController {
  private readonly healers: Healer[] = [];

  constructor(private readonly logger: Logger) {}

  async create(url: string, direction: HealerClickDirection) {
    const errorReceiver: ErrorReceiver = (error) => {
      bot.close().catch(this.logError);
      this.removeHealer(healer);
      this.logError(error);
    };

    // TODO: Dedupe this bit here
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const bot = new DrednotBot(page);
    await bot.join(url); // FIXME: Handle errors from this

    const healer = new Healer(direction, bot, errorReceiver, this.logger);
    this.healers.push(healer);
  }

  private removeHealer(healer: Healer) {
    for (let i = 0; i < this.healers.length; i++) {
      if (this.healers[i] === healer) {
        this.healers.splice(i, 1);
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
