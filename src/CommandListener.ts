import { EventEmitter } from "events";
import { Page } from "puppeteer";
import TypedEmitter from "typed-emitter";

type Events = {
  "heal-start": () => void;
  "heal-stop": () => void;
  "use-up": () => void;
};

const commandToEventName: { [key: string]: keyof Events } = {
  heal: "heal-start",
  "no heal": "heal-stop",
  "use up": "use-up",
};

export class CommandListener extends (EventEmitter as new () => TypedEmitter<Events>) {
  constructor(private readonly page: Page) {
    super();

    const prefix = createRandomString(128);
    this.observeChat(prefix);
    this.observeConsole(prefix);
  }

  private observeChat(prefix: string) {
    this.page.evaluate(`
      new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            const json = JSON.stringify({
              role: node.querySelector("span").innerText,
              message: node.lastChild.textContent,
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

      const { role, message } = JSON.parse(text.substring(prefix.length));
      if (role !== "Captain") {
        return;
      }

      const command = message.toLowerCase();
      const eventName = commandToEventName[command];
      if (!eventName) {
        return;
      }

      this.emit(eventName);
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
