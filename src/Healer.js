import { launch } from "puppeteer";
import { CommandListener } from "./CommandListener";

export class Healer {
  constructor(url) {
    this.url = url;
  }

  async join() {
    this.browser = await launch({
      headless: true,
      defaultViewport: { width: 800, height: 600 },
    });

    this.page = await this.browser.newPage();
    await this.page.goto(this.url);

    await this.waitForAndClickSelector(
      "body > div.modal-container > div > div > div > button"
    );
    await this.waitForAndClickSelector(
      "body > div.modal-container > div > div > button"
    );

    await this.page.waitForFunction(() => {
      return document
        .querySelector("#chat-content")
        ?.textContent.match(/Joined ship/);
    });
    await this.#sendChat("ready");

    await this.page.setViewport({ width: 1, height: 200 });
    await this.page.waitForFunction(() => window.innerWidth < 800);
    await this.page.evaluate(() =>
      document
        .querySelectorAll("body > *:not(#game-container)")
        .forEach((e) => (e.style.transform = "scale(0)"))
    );

    // Listen to the commands
    const commandListener = new CommandListener(this.page);
    commandListener.on("heal-start", async () => {
      this.healing = true;
      await this.page.mouse.move(this.page.viewport().width / 2, 0);
      await this.page.mouse.down();
    });
    commandListener.on("heal-stop", async () => {
      this.healing = false;
      await Promise.all([
        this.page.mouse.click(
          this.page.viewport().width / 2,
          this.page.viewport().height / 2,
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
        this.page.viewport().width / 2,
        this.page.viewport().height / 2
      );
      await this.page.mouse.down();
      await this.page.waitForFunction(
        (selector) => {
          return !document.querySelector(selector).hasChildNodes();
        },
        {},
        "#item-ui-inv > div.item-ui-item.active"
      );
      await this.page.mouse.up();
    });
    commandListener.listen();

    // AFK workaround
    this.jumpInterval = setInterval(async () => {
      if (!this.healing) {
        await this.page.keyboard.press("Space", { delay: 1000 });
      }
    }, 10 * 1000);
  }

  async waitForAndClickSelector(selector) {
    await this.page.waitForSelector(selector);
    await this.page.click(selector);
  }

  async leave() {
    clearInterval(this.jumpInterval);
    await this.browser.close();
  }

  async #sendChat(message) {
    await this.page.keyboard.type(`\n${message}\n`, { delay: 50 });
  }
}
