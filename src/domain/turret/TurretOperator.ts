import { DrednotBot } from "../../domain/drednot/DrednotBot";
import { DrednotChat } from "../../domain/drednot/DrednotChat";
import { Logger } from "../../domain/log/Logger";
import { MouseEventListener } from "../../domain/mouse/MouseEventListener";
import { MouseMoveEvent } from "../../domain/mouse/MouseMoveEvent";
import { MouseService } from "../../domain/mouse/MouseService";
import { sleep } from "../../utility/promise";
import { TurretOperatorOnClose } from "./TurretOperatorOnClose";
import { TurretOperatorState } from "./TurretOperatorState";

export class TurretOperator {
  private state: TurretOperatorState = "idle";
  private readonly mouseEventListener: MouseEventListener;

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

    this.drednotBot.setOnChat(this.handleChat);
    this.drednotBot.setOnClose(this.handleClose);

    this.mouseEventListener = {
      onMouseMove: this.handleMouseMove,
      onMouseButtonDown: this.handleMouseButtonDown,
      onMouseButtonUp: this.handleMouseButtonUp,
    };
    this.mouseService.addEventListener(this.mouseEventListener);
  }

  readonly getShipName = () => {
    return this.drednotBot.getShipName();
  };

  private readonly handleChat = async (chat: DrednotChat) => {
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
  };

  private readonly handleClose = () => {
    this.mouseService.removeEventListener(this.mouseEventListener);
    this.onClose();
  };

  private readonly handleGrab = async () => {
    if (this.state !== "idle") {
      return;
    }

    await this.drednotBot.mouseMove(100, 150);
    await this.drednotBot.mousePress("left");
    await sleep(1000);
    await this.drednotBot.mouseRelease("left");

    this.state = "operating";
    this.logger("grabbed");
  };

  private readonly handleRelease = async () => {
    if (this.state !== "operating") {
      return;
    }

    await this.drednotBot.keyPress("Space");
    await sleep(1000);
    await this.drednotBot.keyRelease("Space");

    this.state = "idle";
    this.logger("released");
  };

  private readonly handleMouseMove = async (event: MouseMoveEvent) => {
    if (this.state !== "operating") {
      return;
    }

    let x = event.x / event.screenWidth - 0.5;
    let y = event.y / event.screenHeight - 0.5;
    const r = Math.sqrt(x ** 2 + y ** 2) || 1;
    x = 50 * (x / r) + 100;
    y = 50 * (y / r) + 100;
    await this.drednotBot.mouseMove(x, y);
  };

  private readonly handleMouseButtonDown = async () => {
    await this.drednotBot.mousePress("left");
  };

  private readonly handleMouseButtonUp = async () => {
    await this.drednotBot.mouseRelease("left");
  };
}
