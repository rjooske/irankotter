import { DrednotBot } from "../domain/drednot/DrednotBot";
import { DrednotChat } from "../domain/drednot/DrednotChat";
import { ErrorReceiver } from "../domain/error/ErrorReceiver";
import { Logger } from "../domain/log/Logger";
import { MouseEventListener } from "../domain/mouse/MouseEventListener";
import { MouseService } from "../domain/mouse/MouseService";
import { sleep } from "../utility/promise";

// TODO: This certainly shouldn't be in the domain layer
export class TurretOperator {
  private readonly mouseEventListener: MouseEventListener = {
    onMouseMove: this.onMouseMove.bind(this),
    onMouseButtonDown: this.onMouseButtonDown.bind(this),
    onMouseButtonUp: this.onMouseButtonUp.bind(this),
  };

  constructor(
    private readonly drednotBot: DrednotBot,
    private readonly mouseService: MouseService,
    private readonly errorReceiver: ErrorReceiver,
    private readonly logger: Logger
  ) {
    drednotBot.setEventListener({
      onDrednotChat: this.onDrednotChat.bind(this),
      onDrednotDead: this.onDrednotDead.bind(this),
    });
    mouseService.addEventListener(this.mouseEventListener);
  }

  private async onDrednotChat(chat: DrednotChat) {
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
    await this.drednotBot.moveMouse(0, 0); // FIXME: Figure out where to click
    await this.drednotBot.pressMouseButton();
    await sleep(1000);
    await this.drednotBot.releaseMouseButton();
    this.logger("grabbed");
  }

  private async handleRelease() {
    await this.drednotBot.jump(); // FIXME: Maybe repurposing jump() is not a good idea
    this.logger("released");
  }

  private onDrednotDead() {
    this.mouseService.removeEventListener(this.mouseEventListener);
  }

  private async onMouseMove(x: number, y: number) {
    try {
      await this.drednotBot.moveMouse(x, y); // FIXME: Is the coordinate normalized?
    } catch (error) {
      this.errorReceiver(error);
    }
  }

  private async onMouseButtonDown() {
    try {
      await this.drednotBot.pressMouseButton();
    } catch (error) {
      this.errorReceiver(error);
    }
  }

  private async onMouseButtonUp() {
    try {
      await this.drednotBot.releaseMouseButton();
    } catch (error) {
      this.errorReceiver(error);
    }
  }
}
