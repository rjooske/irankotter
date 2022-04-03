import { DrednotBot } from "./DrednotBot";
import { DrednotOnChat } from "./DrednotOnChat";
import { DrednotOnClose } from "./DrednotOnClose";

export interface DrednotBotFactory {
  create(onChat: DrednotOnChat, onClose: DrednotOnClose): Promise<DrednotBot>;
}
