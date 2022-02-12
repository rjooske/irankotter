const { EventEmitter } = require("events");
const { Page } = require("puppeteer");

class CommandListener extends EventEmitter {
  /**
   * @param {Page} page
   */
  constructor(page) {
    super();
    this.page = page;
  }

  listen() {
    const prefix = createRandomString(128);

    this.page.evaluate((prefix) => {
      new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            const json = JSON.stringify({
              role: node.querySelector("span").innerText,
              message: node.lastChild.textContent,
            });
            console.log(prefix + json);
          }
        }
      }).observe(document.querySelector("#chat-content"), { childList: true });
    }, prefix);

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
      if (command === "heal") {
        this.emit("heal-start");
      } else if (command === "no heal") {
        this.emit("heal-stop");
      } else if (command === "use up") {
        this.emit("use-up");
      }
    });
  }
}

function createRandomString(length) {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += Math.trunc(36 * Math.random()).toString(36);
  }
  return result;
}

module.exports = { CommandListener };
