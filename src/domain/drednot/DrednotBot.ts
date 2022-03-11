import { DrednotBotEventListener } from "./DrednotBotEventListener";

export interface DrednotBot {
  moveMouse(x: number, y: number): Promise<void>;
  pressMouseButton(): Promise<void>;
  releaseMouseButton(): Promise<void>;
  jump(): Promise<void>;
  setEventListener(listener: DrednotBotEventListener): void;
}
