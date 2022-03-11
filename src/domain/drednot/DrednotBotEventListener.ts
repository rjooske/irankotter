import { DrednotChat } from "./DrednotChat";

export interface DrednotBotEventListener {
  onDrednotChat(chat: DrednotChat): void;
  onDrednotDead(): void;
}
