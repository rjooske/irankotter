import { KeyCode } from "../keyboard/KeyCode";
import { MouseButton } from "../mouse/MouseButton";
import { DrednotOnChat } from "./DrednotOnChat";
import { DrednotOnClose } from "./DrednotOnClose";

export interface DrednotBot {
  getShipName(): string;

  setOnChat(onChat: DrednotOnChat): void;
  setOnClose(onClose: DrednotOnClose): void;

  setScreenWidth(width: number): Promise<void>;
  setScreenHeight(height: number): Promise<void>;

  keyPress(key: KeyCode): Promise<void>;
  keyRelease(key: KeyCode): Promise<void>;

  mouseMove(x: number, y: number): Promise<void>;
  mousePress(button: MouseButton): Promise<void>;
  mouseRelease(button: MouseButton): Promise<void>;
}
