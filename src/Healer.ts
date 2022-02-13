import EventEmitter from "events";
import puppeteer, { Page } from "puppeteer";
import TypedEventEmitter from "typed-emitter";
import { CommandListener } from "./CommandListener";

const HEAL_USE_DURATION = 2000;

type Events = {
  exit: () => void;
};

export class Healer extends (EventEmitter as new () => TypedEventEmitter<Events>) {
  readonly id = createRandomString(128);

  shipName?: string;

  private page?: Page;
  private isHealing = false;

  private readonly jumpInterval = setInterval(async () => {
    if (!this.isHealing) {
      try {
        await this.page?.keyboard.press("Space", { delay: 1000 });
      } catch {}
    }
  }, 10 * 1000);

  constructor(
    private readonly url: string,
    private readonly defaultTimeout: number
  ) {
    super();
  }

  async join() {
    // This must be puppeteer.launch for some reason
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: { width: 800, height: 600 },
    });

    this.page = await browser.newPage();
    await this.page.goto(this.url);
    this.page.setDefaultTimeout(this.defaultTimeout * 1000);

    await this.waitForAndClickSelector(
      "body > div.modal-container > div > div > div > button"
    );
    await this.waitForAndClickSelector(
      "body > div.modal-container > div > div > button"
    );

    await this.waitForJoinToComplete();
    await this.sendChat("ready");

    await this.page.setViewport({ width: 1, height: 200 });
    await this.hideSelectorAll("body > *:not(#game-container)");

    // Listen to the commands
    const commandListener = new CommandListener(this.page);
    commandListener.on("heal-start", async () => {
      this.isHealing = true;
      await this.page?.waitForTimeout(HEAL_USE_DURATION * Math.random());
      await this.page?.mouse.move(0, 0);
      await this.page?.mouse.down();
    });
    commandListener.on("heal-stop", async () => {
      this.isHealing = false;
      await Promise.all([
        this.page?.mouse.click(
          this.getPageWidth() / 2,
          this.getPageHeight() / 2,
          {
            button: "right",
            delay: 1000,
          }
        ),
        this.page?.mouse.up(),
      ]);
    });
    commandListener.on("use-up", async () => {
      await this.page?.mouse.move(
        this.getPageWidth() / 2,
        this.getPageHeight() / 2
      );
      await this.page?.mouse.down();
      await this.page?.waitForTimeout(HEAL_USE_DURATION);
      await this.page?.mouse.up();
    });
  }

  private async waitForAndClickSelector(selector: string) {
    await this.page?.waitForSelector(selector);
    await this.page?.click(selector);
  }

  private async waitForJoinToComplete() {
    await this.page?.waitForFunction(
      `document.querySelector("#chat-content")?.textContent.match(/Joined ship/)`
    );

    this.shipName = await this.page?.evaluate(
      `Promise.resolve(document.querySelector("#chat-content")?.textContent.match(/Joined ship '(.*?)'/)[1])`
    );
  }

  private async hideSelectorAll(selector: string) {
    await this.page?.evaluate(
      `document.querySelectorAll("${selector}").forEach((e) => (e.style.transform = "scale(0)"))`
    );
  }

  private async sendChat(message: string) {
    await this.page?.keyboard.type(`\n${message}\n`, { delay: 50 });
  }

  private getPageWidth() {
    return this.page?.viewport()?.width ?? 0;
  }

  private getPageHeight() {
    return this.page?.viewport()?.height ?? 0;
  }

  async leave() {
    clearInterval(this.jumpInterval);
    await this.page?.browser()?.close();
  }

  waitUntilExit() {
    return new Promise<void>((resolve) => {
      this.page?.on("console", (event) => {
        if (event.text() === "[[drednot dead]]") {
          resolve();
        }
      });
    });
  }
}

function createRandomString(length: number) {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += Math.trunc(36 * Math.random()).toString(36);
  }
  return result;
}
