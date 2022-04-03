import { ConsoleMessage, Page } from "puppeteer";
import { inspect } from "util";
import { DrednotBot as DomainDrednotBot } from "../../domain/drednot/DrednotBot";
import { DrednotChat } from "../../domain/drednot/DrednotChat";
import { DrednotOnChat } from "../../domain/drednot/DrednotOnChat";
import { DrednotOnClose } from "../../domain/drednot/DrednotOnClose";
import { KeyCode } from "../../domain/keyboard/KeyCode";
import { Logger } from "../../domain/log/Logger";
import { MouseButton } from "../../domain/mouse/MouseButton";
import { createRandomString } from "../../utility/string";

export class DrednotBot extends DomainDrednotBot {
  constructor(
    private readonly page: Page,
    onChat: DrednotOnChat,
    onClose: DrednotOnClose,
    private readonly logger: Logger
  ) {
    super(onChat, onClose);
    this.page.on("console", this.handleConsoleMessage.bind(this));
  }

  private async handleConsoleMessage(message: ConsoleMessage) {
    if (message.text() === "[[drednot dead]]") {
      await this.close(new Error("Drednot died"));
    }
  }

  async join(url: string) {
    try {
      await this.setScreenWidth(800);
      await this.setScreenHeight(600);
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
    } catch (error) {
      await this.close(error);
    }
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
      this.onChat(chat);
    });
  }

  async close(error: unknown) {
    this.logger(`closing because of: ${JSON.stringify(inspect(error))}`);
    this.onClose();

    try {
      await this.page.browser().close();
    } catch (error) {
      this.logger("failed to close the browser");
    }
  }

  // Implement domain methods

  async setScreenWidth(width: number) {
    const viewport = this.page.viewport();
    if (!viewport || viewport.width === width) {
      return;
    }

    try {
      await this.page.setViewport({ width, height: viewport.height });
      await this.page.waitForFunction(`window.innerWidth === ${width}`);
    } catch (error) {
      await this.close(error);
    }
  }

  async setScreenHeight(height: number) {
    const viewport = this.page.viewport();
    if (!viewport || viewport.height === height) {
      return;
    }

    try {
      await this.page.setViewport({ width: viewport.width, height });
      await this.page.waitForFunction(`window.innerHeight === ${height}`);
    } catch (error) {
      await this.close(error);
    }
  }

  async keyPress(key: KeyCode) {
    try {
      await this.page.keyboard.down(key);
    } catch (error) {
      await this.close(error);
    }
  }

  async keyRelease(key: KeyCode) {
    try {
      await this.page.keyboard.up(key);
    } catch (error) {
      await this.close(error);
    }
  }

  async mouseMove(x: number, y: number) {
    try {
      await this.page.mouse.move(x, y);
    } catch (error) {
      await this.close(error);
    }
  }

  async mousePress(button: MouseButton) {
    try {
      await this.page.mouse.down({ button });
    } catch (error) {
      await this.close(error);
    }
  }

  async mouseRelease(button: MouseButton) {
    try {
      await this.page.mouse.up({ button });
    } catch (error) {
      await this.close(error);
    }
  }
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
