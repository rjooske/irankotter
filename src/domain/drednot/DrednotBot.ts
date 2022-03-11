import { DrednotBotEventListener } from "./DrednotBotEventListener";

export interface DrednotBot {
  jump(): Promise<void>;
  setEventListener(listener: DrednotBotEventListener): void;
}
