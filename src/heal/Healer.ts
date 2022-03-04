import { Page } from "puppeteer";
import { Chat } from "../chat/Chat";
import { ChatReader } from "../chat/ChatReader";
import { ErrorReceiver } from "../error/ErrorReceiver";
import { Logger } from "../log/Logger";
import { getPageHeight, getPageWidth } from "../utility/puppeteer";
import { HealerClickDirection } from "./HealerClickDirection";
import { HealerState } from "./HealerState";
import { HealerStateChangeReceiver } from "./HealerStateChangeReceiver";

const SHIELD_USE_DURATION = 2000;

export class Healer {
  private readonly chatReader: ChatReader;
  private state: HealerState = "idle";

  constructor(
    private readonly page: Page,
    private readonly clickDirection: HealerClickDirection,
    private readonly stateChangeReceiver: HealerStateChangeReceiver,
    private readonly errorReceiver: ErrorReceiver,
    private readonly logger: Logger
  ) {
    this.chatReader = new ChatReader(page, this.handleChat.bind(this));
  }

  async start() {
    await this.chatReader.start();
  }

  private async handleChat(chat: Chat) {
    if (chat.role !== "Captain") {
      return;
    }

    try {
      switch (chat.text.trim().toLowerCase()) {
        case "heal":
          await this.handleHeal();
          break;
        case "no heal":
          await this.handleNoHeal();
          break;
        case "use up":
          await this.handleUseUp();
          break;
      }
    } catch (error) {
      this.errorReceiver(error);
    }
  }

  private async handleHeal() {
    if (this.state !== "idle") {
      return;
    }

    await this.page.waitForTimeout(SHIELD_USE_DURATION * Math.random());
    await this.page.mouse.move(
      ...getClickPosition(this.page, this.clickDirection)
    );
    await this.page.mouse.down({ button: "left" });

    this.setState("healing");
    this.logger.log(`start healing, click "${this.clickDirection}"`);
  }

  private async handleNoHeal() {
    if (this.state !== "healing") {
      return;
    }

    await this.page.mouse.up({ button: "left" });
    await this.page.mouse.click(
      getPageWidth(this.page) / 2,
      getPageHeight(this.page) / 2,
      { button: "right", delay: 1000 }
    );

    this.setState("idle");
    this.logger.log("stop healing");
  }

  private async handleUseUp() {
    if (this.state !== "idle") {
      return;
    }

    await this.page.mouse.click(
      getPageWidth(this.page) / 2,
      getPageHeight(this.page) / 2,
      { button: "left", delay: SHIELD_USE_DURATION }
    );

    this.logger.log("use up item");
  }

  private setState(state: HealerState) {
    this.state = state;
    this.stateChangeReceiver(state);
  }
}

function getClickPosition(
  page: Page,
  clickDirection: HealerClickDirection
): [number, number] {
  const centerX = getPageWidth(page) / 2 + 0.5;
  const centerY = getPageHeight(page) / 2 + 0.5;

  switch (clickDirection) {
    case "above":
      return [centerX, centerY - 100];
    case "left":
      return [centerX - 30, centerY - 30];
    case "right":
      return [centerX + 30, centerY - 30];
  }
}
