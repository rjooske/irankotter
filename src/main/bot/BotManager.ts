import puppeteer from "puppeteer";
import { ErrorReceiver } from "../../error/ErrorReceiver";
import { Healer } from "../../heal/Healer";
import { HealerClickDirection } from "../../heal/HealerClickDirection";
import { Joiner } from "../../join/Joiner";
import { Jumper } from "../../jump/Jumper";
import { ConsoleLogger } from "../../log/ConsoleLogger";
import { createRandomString } from "../../utility/string";
import { Bot } from "./Bot";

export class BotManager {
  private readonly bots: Bot[] = [];

  constructor() {}

  async createHealer(url: string, clickDirection: HealerClickDirection) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const id = createRandomString(8);
    const logger = new ConsoleLogger(id);
    const errorReceiver: ErrorReceiver = async (error) => {
      try {
        this.remove(id);
        jumper.close();
        logger.log(error);
        await browser.close();
      } catch (error) {
        logger.log(error);
      }
    };

    const jumper = new Jumper(page, errorReceiver);
    const joiner = new Joiner(page, url, errorReceiver, logger);
    const healer = new Healer(
      page,
      clickDirection,
      (state) => {
        if (state === "idle") {
          jumper.enable();
        } else if (state === "healing") {
          jumper.disable();
        }
      },
      errorReceiver,
      logger
    );

    this.bots.push({ id, browser, joiner, jumper, logger });

    (async () => {
      await joiner.join();
      await healer.start();
      jumper.enable();
    })();

    return id;
  }

  async kill(id: string) {
    const bot = this.bots.find((e) => e.id === id);
    if (!bot) {
      return;
    }

    bot.jumper.close();
    await bot.browser.close();

    bot.logger.log("killed");
    this.remove(id);
  }

  private remove(id: string) {
    for (let i = 0; i < this.bots.length; i++) {
      if (this.bots[i].id === id) {
        this.bots.splice(i, 1);
        break;
      }
    }
  }

  getBots() {
    return this.bots;
  }
}
