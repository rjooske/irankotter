import { Page } from "puppeteer";
import { Chat } from "../chat/Chat";
import { ChatReader } from "../chat/ChatReader";
import { Logger } from "../log/Logger";
import { HealerClickDirection } from "./HealerClickDirection";

const SHIELD_USE_DURATION = 2000;

export class Healer {
  private readonly chatReader: ChatReader;
  isHealing = false;

  constructor(
    private readonly page: Page,
    private readonly clickDirection: HealerClickDirection,
    private readonly logger: Logger
  ) {
    this.chatReader = new ChatReader(page, this.handleChat.bind(this));
  }

  async start() {
    this.chatReader.start();
  }

  private handleChat(chat: Chat) {
    if (chat.role !== "Captain") {
      return;
    }

    switch (chat.text.trim().toLowerCase()) {
      case "heal":
        this.handleHeal();
        break;
      case "no heal":
        this.handleNoHeal();
        break;
      case "use up":
        this.handleUseUp();
        break;
    }
  }

  private async handleHeal() {
    if (this.isHealing) {
      return;
    }

    try {
      await this.page.waitForTimeout(SHIELD_USE_DURATION * Math.random());
      await this.page.mouse.move(
        ...getClickPosition(this.page, this.clickDirection)
      );
      await this.page.mouse.down({ button: "left" });
    } catch (error) {
      this.logger.log(error);
      return;
    }

    this.isHealing = true;
    this.logger.log(`start healing, click "${this.clickDirection}"`);
  }

  private async handleNoHeal() {
    if (!this.isHealing) {
      return;
    }

    try {
      await this.page.mouse.up({ button: "left" });
      await this.page.mouse.click(
        getPageWidth(this.page) / 2,
        getPageHeight(this.page) / 2,
        { button: "right", delay: 1000 }
      );
    } catch (error) {
      this.logger.log(error);
      return;
    }

    this.isHealing = false;
    this.logger.log("stop healing");
  }

  private async handleUseUp() {
    if (this.isHealing) {
      return;
    }

    try {
      await this.page.mouse.click(
        getPageWidth(this.page) / 2,
        getPageHeight(this.page) / 2,
        { button: "left", delay: SHIELD_USE_DURATION }
      );
    } catch (error) {
      this.logger.log(error);
      return;
    }

    this.logger.log("use up the item");
  }
}

function getPageWidth(page: Page) {
  return page.viewport()?.width ?? 0;
}

function getPageHeight(page: Page) {
  return page.viewport()?.height ?? 0;
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
