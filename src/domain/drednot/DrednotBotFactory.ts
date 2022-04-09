import { Logger } from "../log/Logger";
import { DrednotBot } from "./DrednotBot";

export interface DrednotBotFactory {
  // TODO: not sure about what to do with this logger here
  // somewhat leaky of the implementation
  create(url: string, logger: Logger): Promise<DrednotBot>;
}
