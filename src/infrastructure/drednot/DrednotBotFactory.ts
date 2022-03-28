import puppeteer from "puppeteer";
import * as domain from "../../domain/drednot/DrednotBotFactory";
import { Logger } from "../../domain/log/Logger";
import { DrednotBot } from "./DrednotBot";

export class DrednotBotFactory implements domain.DrednotBotFactory {
  constructor(private readonly headless: boolean) {}

  async create(url: string, logger: Logger) {
    const browser = await puppeteer.launch({ headless: this.headless });
    const page = await browser.newPage();
    const bot = new DrednotBot(page, logger);
    await bot.join(url);
    return bot;
  }
}
