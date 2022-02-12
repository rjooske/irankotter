import puppeteer, { Browser, Page } from "puppeteer";
import { CommandListener } from "./CommandListener";

const HEAL_USE_DURATION = 2000;

export class Healer {
  private isHealing = false;

  private readonly jumpInterval = setInterval(async () => {
    if (!this.isHealing) {
      await this.page.keyboard.press("Space", { delay: 1000 });
    }
  }, 10 * 1000);

  constructor(private readonly browser: Browser, private readonly page: Page) {}

  private async join() {
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
      await this.page.waitForTimeout(HEAL_USE_DURATION * Math.random());
      await this.page.mouse.move(this.getPageWidth() / 2, 0);
      await this.page.mouse.down();
    });
    commandListener.on("heal-stop", async () => {
      this.isHealing = false;
      await Promise.all([
        this.page.mouse.click(
          this.getPageWidth() / 2,
          this.getPageHeight() / 2,
          {
            button: "right",
            delay: 1000,
          }
        ),
        this.page.mouse.up(),
      ]);
    });
    commandListener.on("use-up", async () => {
      await this.page.mouse.move(
        this.getPageWidth() / 2,
        this.getPageHeight() / 2
      );
      await this.page.mouse.down();
      await this.page.waitForTimeout(HEAL_USE_DURATION);
      await this.page.mouse.up();
    });
  }

  private async waitForAndClickSelector(selector: string) {
    await this.page.waitForSelector(selector);
    await this.page.click(selector);
  }

  private async waitForJoinToComplete() {
    await this.page.waitForFunction(
      `document.querySelector("#chat-content")?.textContent.match(/Joined ship/)`
    );
  }

  private async hideSelectorAll(selector: string) {
    await this.page.evaluate(
      `document.querySelectorAll("${selector}").forEach((e) => (e.style.transform = "scale(0)"))`
    );
  }

  private async sendChat(message: string) {
    await this.page.keyboard.type(`\n${message}\n`, { delay: 50 });
  }

  private getPageWidth() {
    return this.page.viewport()?.width ?? 0;
  }

  private getPageHeight() {
    return this.page.viewport()?.height ?? 0;
  }

  async leave() {
    clearInterval(this.jumpInterval);
    await this.page.close();
    await this.browser.close();
  }

  static async join(url: string) {
    // This must be puppeteer.launch for some reason
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: { width: 800, height: 600 },
    });

    const page = await browser.newPage();
    await page.goto(url);

    const healer = new Healer(browser, page);
    await healer.join();
    return healer;
  }
}
