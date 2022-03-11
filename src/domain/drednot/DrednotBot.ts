import { DrednotBotEventListener } from "./DrednotBotEventListener";

export interface DrednotBot {
  setEventListener(listener: DrednotBotEventListener): void;
}
