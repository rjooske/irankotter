import { DrednotBot } from "../drednot/DrednotBot";
import { DrednotChat } from "../drednot/DrednotChat";
import { ErrorReceiver } from "../error/ErrorReceiver";
import { Logger } from "../log/Logger";
import { MouseEventListener } from "../mouse/MouseEventListener";
import { MouseService } from "../mouse/MouseService";

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

  private onDrednotChat(chat: DrednotChat) {
    if (chat.role !== "Captain") {
      return;
    }

    switch (chat.text.trim().toLowerCase()) {
    }
  }

  private onDrednotDead() {
    this.mouseService.removeEventListener(this.mouseEventListener);
  }

  private onMouseMove(x: number, y: number) {}

  private onMouseButtonDown() {}

  private onMouseButtonUp() {}
}
