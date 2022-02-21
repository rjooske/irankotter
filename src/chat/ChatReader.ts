import { Page } from "puppeteer";
import { createRandomString } from "../utility/string";
import { ChatReceiver } from "./ChatReceiver";

export class ChatReader {
  constructor(
    private readonly page: Page,
    private readonly onChat: ChatReceiver
  ) {}

  async start() {
    const prefix = createRandomString(128);
    await this.observeChat(prefix);
    this.observeConsole(prefix);
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

      this.onChat(JSON.parse(text.substring(prefix.length)));
    });
  }
}
