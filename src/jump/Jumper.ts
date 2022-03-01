import { Page } from "puppeteer";
import { ErrorReceiver } from "../error/ErrorReceiver";

export class Jumper {
  private isJumping = false;
  private isClosed = false;

  constructor(
    private readonly page: Page,
    private readonly errorReceiver: ErrorReceiver
  ) {
    this.loop();
  }

  enable() {
    this.isJumping = true;
  }

  disable() {
    this.isJumping = false;
  }

  close() {
    this.isClosed = true;
  }

  private async loop() {
    while (!this.isClosed) {
      if (this.isJumping) {
        await this.jump();
        await this.page.waitForTimeout(10 * 1000);
      } else {
        await this.page.waitForTimeout(1000);
      }
    }
  }

  private async jump() {
    try {
      await this.page.keyboard.press("Space", { delay: 1000 });
    } catch (error) {
      this.errorReceiver(error);
    }
  }
}
