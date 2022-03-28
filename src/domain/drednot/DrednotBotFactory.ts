import { Logger } from "../log/Logger";
import { DrednotBot } from "./DrednotBot";

export interface DrednotBotFactory {
  create(url: string, logger: Logger): Promise<DrednotBot>;
}
