import { DrednotBot } from "../../domain/drednot/DrednotBot";
import { DrednotChat } from "../../domain/drednot/DrednotChat";
import { ErrorReceiver } from "../../domain/error/ErrorReceiver";
import { Logger } from "../../domain/log/Logger";
import { sleep } from "../../utility/promise";
import { HealerClickDirection } from "./HealerClickDirection";
import { HealerState } from "./HealerState";

const SCREEN_WIDTH = 70;
const SCREEN_HEIGHT = 200;
const SHIELD_USE_DURATION = 2000;

export class Healer {
  private state: HealerState = "idle";
  private readonly jumpInterval = setInterval(
    this.handleJumpInterval.bind(this),
    10 * 1000
  );

  constructor(
    private readonly clickDirection: HealerClickDirection,
    private readonly drednotBot: DrednotBot,
    private readonly errorReceiver: ErrorReceiver,
    private readonly logger: Logger
  ) {
    drednotBot.setScreenSize(SCREEN_WIDTH, SCREEN_HEIGHT).catch(errorReceiver);
    drednotBot.setEventListener({
      onDrednotChat: this.handleDrednotChat.bind(this),
      onDrednotDead: this.handleDrednotDead.bind(this),
    });
  }

  private async handleDrednotChat(chat: DrednotChat) {
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

    await sleep(SHIELD_USE_DURATION * Math.random());
    await this.drednotBot.moveMouse(...getClickPosition(this.clickDirection));
    await this.drednotBot.pressMouseButton("left");

    this.state = "healing";
    this.logger(`started healing, click "${this.clickDirection}"`);
  }

  private async handleNoHeal() {
    if (this.state !== "healing") {
      return;
    }

    await this.drednotBot.releaseMouseButton("left");
    await this.drednotBot.moveMouse(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);
    await this.drednotBot.pressMouseButton("right");
    await sleep(1000);
    await this.drednotBot.releaseMouseButton("right");

    this.state = "idle";
    this.logger("stopped healing");
  }

  private async handleUseUp() {
    if (this.state !== "idle") {
      return;
    }

    await this.drednotBot.moveMouse(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);
    await this.drednotBot.pressMouseButton("left");
    await sleep(SHIELD_USE_DURATION);
    await this.drednotBot.releaseMouseButton("left");

    this.logger("used up the item");
  }

  private handleDrednotDead() {
    clearInterval(this.jumpInterval);
    this.errorReceiver(new Error("Drednot died"));
  }

  private async handleJumpInterval() {
    if (this.state === "idle") {
      await this.drednotBot.jump();
    }
  }
}

function getClickPosition(direction: HealerClickDirection): [number, number] {
  const centerX = SCREEN_WIDTH / 2;
  const centerY = SCREEN_HEIGHT / 2;

  switch (direction) {
    case "above":
      return [centerX, centerY - 100];
    case "left":
      return [centerX - 30, centerY - 30];
    case "right":
      return [centerX + 30, centerY - 30];
  }
}
