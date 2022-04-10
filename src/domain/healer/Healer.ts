import { sleep } from "../../utility/promise";
import { DrednotBot } from "../drednot/DrednotBot";
import { DrednotChat } from "../drednot/DrednotChat";
import { Logger } from "../log/Logger";
import { HealerClickDirection } from "./HealerClickDirection";
import { HealerOnClose } from "./HealerOnClose";
import { HealerState } from "./HealerState";

const SCREEN_WIDTH = 70;
const SCREEN_HEIGHT = 200;
const SHIELD_USE_DURATION = 2000;

export class Healer {
  private state: HealerState = "idle";
  private readonly jumpInterval;

  constructor(
    private readonly clickDirection: HealerClickDirection,
    private readonly drednotBot: DrednotBot,
    private readonly onClose: HealerOnClose,
    private readonly logger: Logger
  ) {
    (async () => {
      await this.drednotBot.setScreenWidth(SCREEN_WIDTH);
      await this.drednotBot.setScreenHeight(SCREEN_HEIGHT);
    })();

    this.jumpInterval = setInterval(this.handleJumpInterval, 10 * 1000);
    this.drednotBot.setOnChat(this.handleChat);
    this.drednotBot.setOnClose(this.handleClose);
  }

  private readonly handleChat = async (chat: DrednotChat) => {
    if (chat.role !== "Captain") {
      return;
    }

    this.logger(`received "${chat.text}" from ${chat.name}`);

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
  };

  private readonly handleHeal = async () => {
    if (this.state !== "idle") {
      return;
    }

    await sleep(SHIELD_USE_DURATION * Math.random());
    await this.drednotBot.mouseMove(...getClickPosition(this.clickDirection));
    await this.drednotBot.mousePress("left");

    this.state = "healing";
    this.logger(`started healing, click "${this.clickDirection}"`);
  };

  private readonly handleNoHeal = async () => {
    if (this.state !== "healing") {
      return;
    }

    await this.drednotBot.mouseRelease("left");
    await this.drednotBot.mouseMove(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);
    await this.drednotBot.mousePress("right");
    await sleep(1000);
    await this.drednotBot.mouseRelease("right");

    this.state = "idle";
    this.logger("stopped healing");
  };

  private readonly handleUseUp = async () => {
    if (this.state !== "idle") {
      return;
    }

    await this.drednotBot.mouseMove(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);
    await this.drednotBot.mousePress("left");
    await sleep(SHIELD_USE_DURATION);
    await this.drednotBot.mouseRelease("left");

    this.logger("used up the item");
  };

  private readonly handleClose = () => {
    clearInterval(this.jumpInterval);
    this.onClose();
  };

  private readonly handleJumpInterval = async () => {
    if (this.state !== "idle") {
      return;
    }

    await this.drednotBot.keyPress("Space");
    await sleep(1000);
    await this.drednotBot.keyRelease("Space");
  };
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
