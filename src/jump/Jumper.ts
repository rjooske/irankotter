import { Page } from "puppeteer";
import { Logger } from "../log/Logger";
import { JumperCanJump } from "./JumperCanJump";

export class Jumper {
  private readonly interval = setInterval(
    this.handleInterval.bind(this),
    10 * 1000
  );

  constructor(
    private readonly page: Page,
    private readonly canJump: JumperCanJump,
    private readonly logger: Logger
  ) {}

  private async handleInterval() {
    if (!this.canJump()) {
      return;
    }

    try {
      await this.page.keyboard.press("Space", { delay: 1000 });
    } catch (error) {
      this.logger.log(error);
      return;
    }
  }

  stop() {
    clearInterval(this.interval);
  }
}
