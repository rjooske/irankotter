import { ConsoleMessage, Page } from "puppeteer";
import * as domain from "../../domain/drednot/DrednotBot";
import { DrednotBotEventListener } from "../../domain/drednot/DrednotBotEventListener";
import { DrednotChat } from "../../domain/drednot/DrednotChat";
import { Logger } from "../../domain/log/Logger";
import { MouseButton } from "../../domain/mouse/MouseButton";
import { createRandomString } from "../../utility/string";

export class DrednotBot implements domain.DrednotBot {
  private listener?: DrednotBotEventListener;

  constructor(private readonly page: Page, private readonly logger: Logger) {
    this.page.on("console", this.handleConsoleMessage.bind(this));
  }

  private handleConsoleMessage(message: ConsoleMessage) {
    if (message.text() === "[[drednot dead]]") {
      this.listener?.onDrednotDead();
    }
  }

  async join(url: string) {
    await setPageWidth(this.page, 800);
    await setPageHeight(this.page, 600);
    await this.page.goto(url);
    this.logger(`opened ${url}`);

    // Accept the terms
    await waitForAndClickSelector(
      this.page,
      "body > div.modal-container > div > div > div > button"
    );
    // Start without logging in
    await waitForAndClickSelector(
      this.page,
      "body > div.modal-container > div > div > button"
    );

    this.logger("joining");
    const shipName = await getShipName(this.page);
    this.logger(`joined "${shipName}"`);

    await hideSelectorAll(this.page, "body > *:not(#game-container)");

    // Listen to the chat
    const prefix = createRandomString(128);
    await this.observeChat(prefix);
    this.observeConsole(prefix);
    this.logger("listening to the chat");
  }

  private async observeChat(prefix: string) {
    await this.page.evaluate(`
      new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            const json = JSON.stringify({
              role: node.querySelector("span")?.innerText,
              name: node.querySelector("bdi")?.innerText ?? "",
              text: node.lastChild?.textContent ?? "",
            });
            console.log("${prefix}" + json);
          }
        }
      }).observe(document.querySelector("#chat-content"), { childList: true });
    `);
  }

  private observeConsole(prefix: string) {
    this.page.on("console", (event) => {
      const text = event.text();
      if (!text.startsWith(prefix)) {
        return;
      }

      const chat: DrednotChat = JSON.parse(text.substring(prefix.length));
      this.listener?.onDrednotChat(chat);
    });
  }

  async close() {
    if (!this.page.isClosed()) {
      await this.page.close();
    }

    const browser = this.page.browser();
    if (browser.isConnected()) {
      await browser.close();
    }
  }

  async setScreenSize(width: number, height: number) {
    await setPageWidth(this.page, width);
    await setPageHeight(this.page, height);
  }

  async jump() {
    await this.page.keyboard.press("Space", { delay: 1000 });
  }

  async moveMouse(x: number, y: number) {
    await this.page.mouse.move(x, y);
  }

  async pressMouseButton(button: MouseButton) {
    await this.page.mouse.down({ button });
  }

  async releaseMouseButton(button: MouseButton) {
    await this.page.mouse.up({ button });
  }

  setEventListener(listener: DrednotBotEventListener) {
    this.listener = listener;
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
