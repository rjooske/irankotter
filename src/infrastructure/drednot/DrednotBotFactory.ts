import puppeteer from "puppeteer";
import { DrednotBotFactory as DomainDrednotBotFactory } from "../../domain/drednot/DrednotBotFactory";
import { Logger } from "../../domain/log/Logger";
import { DrednotBot } from "./DrednotBot";

export class DrednotBotFactory implements DomainDrednotBotFactory {
  constructor(
    private readonly headless: boolean,
    private readonly logger: Logger
  ) {}

  async create(url: string) {
    const browser = await puppeteer.launch({ headless: this.headless });
    const page = await browser.newPage();
    const bot = new DrednotBot(page, this.logger);
    await bot.join(url);
    return bot;
  }
}
