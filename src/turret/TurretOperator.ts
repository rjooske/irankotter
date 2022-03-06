import { Page } from "puppeteer";
import { Chat } from "../chat/Chat";
import { ChatReader } from "../chat/ChatReader";
import { ErrorReceiver } from "../error/ErrorReceiver";
import { Logger } from "../log/Logger";
import { getPageHeight, getPageWidth } from "../utility/puppeteer";
import { TurretOperatorState } from "./TurretOperatorState";

export class TurretOperator {
  private readonly chatReader: ChatReader;
  private state: TurretOperatorState = "idle";

  constructor(
    private readonly page: Page,
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
        case "grab":
          await this.handleGrab();
          break;
        case "release":
          await this.handleRelease();
          break;
      }
    } catch (error) {
      this.errorReceiver(error);
    }
  }

  private async handleGrab() {
    await this.page.mouse.click(
      getPageWidth(this.page) / 2,
      getPageHeight(this.page) / 2 + 50,
      { button: "left", delay: 1000 }
    );
    this.logger.log("grabbed turret");
  }

  private async handleRelease() {
    await this.page.keyboard.press("Space", { delay: 1000 });
    this.logger.log("released turret");
  }
}
