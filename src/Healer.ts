import EventEmitter from "events";
import puppeteer, { ConsoleMessage, Page } from "puppeteer";
import TypedEventEmitter from "typed-emitter";
import { CommandListener } from "./CommandListener";

const HEAL_USE_DURATION = 2000;

type Events = {
  error: (error: unknown) => void;
};

export class Healer extends (EventEmitter as new () => TypedEventEmitter<Events>) {
  readonly id = createRandomString(128);

  playerName?: string;
  shipName?: string;

  private page?: Page;
  private isHealing = false;
  private isTyping = false;

  private readonly jumpInterval = setInterval(
    this.handleJumpInterval.bind(this),
    10 * 1000
  );

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
    this.page.setDefaultTimeout(this.defaultTimeout * 1000);
    this.page.on("console", this.handleConsoleMessage.bind(this));

    const commandListener = new CommandListener(this.page);
    commandListener.on("heal-start", this.handleHealStart.bind(this));
    commandListener.on("heal-stop", this.handleHealStop.bind(this));
    commandListener.on("use-up", this.handleUseUp.bind(this));

    try {
      await this.page.goto(this.url);

      await this.waitForAndClickSelector(
        "body > div.modal-container > div > div > div > button"
      );
      await this.waitForAndClickSelector(
        "body > div.modal-container > div > div > button"
      );

      this.shipName = await this.getShipName();
      await this.sendChat("ready");

      await this.page.setViewport({ width: 1, height: 200 });
      await this.hideSelectorAll("body > *:not(#game-container)");

      await commandListener.start();
    } catch (error) {
      this.error(error);
    }
  }

  private async waitForAndClickSelector(selector: string) {
    if (!this.page) {
      throw new Error("Page is falsy");
    }

    await this.page.waitForSelector(selector);
    await this.page.click(selector);
  }

  private async getShipName() {
    if (!this.page) {
      throw new Error("Page is falsy");
    }

    const handle = await this.page.waitForFunction(`(() => {
      const chatContent = document.querySelector("#chat-content");
      if (!chatContent) return;
      const match = chatContent.textContent.match(/Joined ship '(.*?)'/);
      if (!match) return;
      return match[1];
    })()`);

    const name = await handle.jsonValue();
    if (typeof name !== "string") {
      throw new Error(`Ship name "${name}" is not a string`);
    }

    return name;
  }

  private async hideSelectorAll(selector: string) {
    if (!this.page) {
      throw new Error("Page is falsy");
    }

    await this.page.evaluate(
      `document.querySelectorAll("${selector}").forEach((e) => (e.style.transform = "scale(0)"))`
    );
  }

  private async sendChat(message: string) {
    if (!this.page) {
      throw new Error("Page is falsy");
    }

    this.isTyping = true;
    await this.page.keyboard.type(`\n${message}\n`, { delay: 5 });
    this.isTyping = false;
  }

  private getPageWidth() {
    return this.page?.viewport()?.width ?? 0;
  }

  private getPageHeight() {
    return this.page?.viewport()?.height ?? 0;
  }

  private async handleHealStart() {
    if (this.isHealing) {
      return;
    }
    this.isHealing = true;

    if (!this.page) {
      return;
    }

    try {
      await this.page.waitForTimeout(HEAL_USE_DURATION * Math.random());
      await this.page.mouse.move(0, 0);
      await this.page.mouse.down();
    } catch (error) {
      await this.error(error);
    }
  }

  private async handleHealStop() {
    if (!this.isHealing) {
      return;
    }
    this.isHealing = false;

    if (!this.page) {
      return;
    }

    try {
      await this.page.mouse.up();
      await this.page.mouse.click(
        this.getPageWidth() / 2,
        this.getPageHeight() / 2,
        { button: "right", delay: 1000 }
      );
    } catch (error) {
      await this.error(error);
    }
  }

  private async handleUseUp() {
    if (!this.isHealing) {
      return;
    }
    this.isHealing = false;

    if (!this.page) {
      return;
    }

    try {
      await this.page.mouse.move(
        this.getPageWidth() / 2,
        this.getPageHeight() / 2
      );
      await this.page.mouse.down();
      await this.page.waitForTimeout(HEAL_USE_DURATION);
      await this.page.mouse.up();
    } catch (error) {
      await this.error(error);
    }
  }

  private async handleJumpInterval() {
    if (this.isHealing || this.isTyping) {
      return;
    }

    if (!this.page) {
      return;
    }

    try {
      await this.page.keyboard.press("Space", { delay: 1000 });
    } catch (error) {
      await this.error(error);
    }
  }

  private async handleConsoleMessage(event: ConsoleMessage) {
    if (event.text() === "[[drednot dead]]") {
      await this.error(new Error("Drednot died"));
    }
  }

  private async error(error: unknown) {
    this.emit("error", error);
    await this.close();
  }

  async close() {
    clearInterval(this.jumpInterval);

    if (this.page && !this.page.isClosed()) {
      this.page.browser().close();
    }
  }
}

function createRandomString(length: number) {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += Math.trunc(36 * Math.random()).toString(36);
  }
  return result;
}
