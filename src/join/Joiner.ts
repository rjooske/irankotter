import { ConsoleMessage, Page } from "puppeteer";
import { ErrorReceiver } from "../error/ErrorReceiver";
import { Logger } from "../log/Logger";
import { JoinerState } from "./JoinerState";

export class Joiner {
  state: JoinerState = "title";
  shipName?: string;

  constructor(
    private readonly page: Page,
    private readonly url: string,
    private readonly errorReceiver: ErrorReceiver,
    private readonly logger: Logger
  ) {
    this.page.on("console", this.handleConsoleMessage.bind(this));
  }

  async join() {
    try {
      await setPageWidth(this.page, 800);
      await setPageHeight(this.page, 600);
      await this.page.goto(this.url);
      this.logger.log(`open ${this.url}`);

      // Accept the terms
      await waitForAndClickSelector(
        this.page,
        "body > div.modal-container > div > div > div > button"
      );
      // Deny to log in
      await waitForAndClickSelector(
        this.page,
        "body > div.modal-container > div > div > button"
      );
      this.state = "joining";
      this.logger.log("joining");

      this.shipName = await getShipName(this.page);
      this.logger.log(`joined ${this.shipName}`);

      await setPageWidth(this.page, 200);
      await setPageHeight(this.page, 200);
      await hideSelectorAll(this.page, "body > *:not(#game-container)");
    } catch (error) {
      this.errorReceiver(error);
    }
  }

  private handleConsoleMessage(message: ConsoleMessage) {
    if (message.text() === "[[drednot dead]]") {
      this.errorReceiver(new Error("Drednot died"));
    }
  }
}

async function setPageWidth(page: Page, width: number) {
  const viewport = page.viewport();
  if (!viewport || viewport.width === width) {
    return;
  }

  await page.setViewport({ width, height: viewport.height });
  await page.waitForFunction(`window.innerWidth === ${width}`);
}

async function setPageHeight(page: Page, height: number) {
  const viewport = page.viewport();
  if (!viewport || viewport.height === height) {
    return;
  }

  await page.setViewport({ width: viewport.width, height });
  await page.waitForFunction(`window.innerHeight === ${height}`);
}

async function waitForAndClickSelector(page: Page, selector: string) {
  await page.waitForSelector(selector);
  await page.click(selector);
}

async function getShipName(page: Page) {
  const handle = await page.waitForFunction(`(() => {
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

async function hideSelectorAll(page: Page, selector: string) {
  await page.evaluate(`(() => {
    for (const e of document.querySelectorAll("${selector}")) {
      e.style.transform = "scale(0) translateX(${2 * 31 - 1}px)";
    }
  })()`);
}
