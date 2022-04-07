import { DrednotBot } from "./DrednotBot";

export interface DrednotBotFactory {
  create(url: string): Promise<DrednotBot>;
}
