const puppeteer = require("puppeteer");
const { CommandListener } = require("./CommandListener");

class Healer {
  constructor(url) {
    this.url = url;
  }

  async join() {
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: { width: 800, height: 600 },
    });

    this.page = await browser.newPage();
    await this.page.goto(this.url);

    await this.waitForAndClickSelector(
      "body > div.modal-container > div > div > div > button"
    );
    await this.waitForAndClickSelector(
      "body > div.modal-container > div > div > button"
    );

    // Listen to the commands
    const commandListener = new CommandListener(this.page);
    commandListener.on("heal-start", async () => {
      this.healing = true;
      await this.page.mouse.move(400, 200);
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
    await this.page.close();
  }
}

module.exports = { Healer };
