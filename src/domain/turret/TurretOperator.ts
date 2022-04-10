import { DrednotBot } from "../../domain/drednot/DrednotBot";
import { DrednotChat } from "../../domain/drednot/DrednotChat";
import { Logger } from "../../domain/log/Logger";
import { MouseEventListener } from "../../domain/mouse/MouseEventListener";
import { MouseMoveEvent } from "../../domain/mouse/MouseMoveEvent";
import { MouseService } from "../../domain/mouse/MouseService";
import { sleep } from "../../utility/promise";
import { TurretOperatorOnClose } from "./TurretOperatorOnClose";

export class TurretOperator {
  private readonly mouseEventListener: MouseEventListener = {
    onMouseMove: this.onMouseMove.bind(this),
    onMouseButtonDown: this.onMouseButtonDown.bind(this),
    onMouseButtonUp: this.onMouseButtonUp.bind(this),
  };

  constructor(
    private readonly drednotBot: DrednotBot,
    private readonly mouseService: MouseService,
    private readonly onClose: TurretOperatorOnClose,
    private readonly logger: Logger
  ) {
    (async () => {
      await this.drednotBot.setScreenWidth(200);
      await this.drednotBot.setScreenHeight(200);
    })();

    this.drednotBot.setOnChat(this.handleChat.bind(this));
    this.drednotBot.setOnClose(this.handleClose.bind(this));
    this.mouseService.addEventListener(this.mouseEventListener);
  }

  private async handleChat(chat: DrednotChat) {
    if (chat.role !== "Captain") {
      return;
    }

    this.logger(`received "${chat.text}" from ${chat.name}`);

    switch (chat.text.trim().toLowerCase()) {
      case "grab":
        await this.handleGrab();
        break;
      case "release":
        await this.handleRelease();
        break;
    }
  }

  private handleClose() {
    this.mouseService.removeEventListener(this.mouseEventListener);
    this.onClose();
  }

  private async handleGrab() {
    await this.drednotBot.mouseMove(100, 150);
    await this.drednotBot.mousePress("left");
    await sleep(1000);
    await this.drednotBot.mouseRelease("left");
    this.logger("grabbed");
  }

  private async handleRelease() {
    await this.drednotBot.keyPress("Space");
    await sleep(1000);
    await this.drednotBot.keyRelease("Space");
    this.logger("released");
  }

  private async onMouseMove(event: MouseMoveEvent) {
    let x = event.x / event.screenWidth - 0.5;
    let y = event.y / event.screenHeight - 0.5;
    const r = Math.sqrt(x ** 2 + y ** 2) || 1;
    x = 50 * (x / r) + 100;
    y = 50 * (y / r) + 100;
    await this.drednotBot.mouseMove(x, y);
  }

  private async onMouseButtonDown() {
    await this.drednotBot.mousePress("left");
  }

  private async onMouseButtonUp() {
    await this.drednotBot.mouseRelease("left");
  }
}
