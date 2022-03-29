import { KeyCode } from "../keyboard/KeyCode";
import { MouseButton } from "../mouse/MouseButton";
import { DrednotOnChat } from "./DrednotOnChat";
import { DrednotOnClose } from "./DrednotOnClose";

export abstract class DrednotBot {
  protected constructor(
    protected readonly onChat: DrednotOnChat,
    protected readonly onClose: DrednotOnClose
  ) {}

  abstract setScreenWidth(width: number): Promise<void>;
  abstract setScreenHeight(height: number): Promise<void>;

  abstract keyPress(key: KeyCode): Promise<void>;
  abstract keyRelease(key: KeyCode): Promise<void>;

  abstract mouseMove(x: number, y: number): Promise<void>;
  abstract mousePress(button: MouseButton): Promise<void>;
  abstract mouseRelease(button: MouseButton): Promise<void>;
}
