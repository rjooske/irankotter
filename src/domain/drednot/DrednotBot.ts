import { MouseButton } from "../mouse/MouseButton";
import { DrednotBotEventListener } from "./DrednotBotEventListener";

export interface DrednotBot {
  moveMouse(x: number, y: number): Promise<void>;
  pressMouseButton(button: MouseButton): Promise<void>;
  releaseMouseButton(button: MouseButton): Promise<void>;
  jump(): Promise<void>;
  setScreenSize(width: number, height: number): Promise<void>;
  setEventListener(listener: DrednotBotEventListener): void;
}
