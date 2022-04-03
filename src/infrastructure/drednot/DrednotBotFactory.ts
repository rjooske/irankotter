import puppeteer from "puppeteer";
import { DrednotBotFactory as DomainDrednotBotFactory } from "../../domain/drednot/DrednotBotFactory";
import { DrednotOnChat } from "../../domain/drednot/DrednotOnChat";
import { DrednotOnClose } from "../../domain/drednot/DrednotOnClose";
import { Logger } from "../../domain/log/Logger";
import { DrednotBot } from "./DrednotBot";

export class DrednotBotFactory implements DomainDrednotBotFactory {
  constructor(
    private readonly headless: boolean,
    private readonly url: string,
    private readonly logger: Logger
  ) {}

  async create(onChat: DrednotOnChat, onClose: DrednotOnClose) {
    const browser = await puppeteer.launch({ headless: this.headless });
    const page = await browser.newPage();
    const bot = new DrednotBot(onChat, onClose, page, this.logger);
    await bot.join(this.url);
    return bot;
  }
}
