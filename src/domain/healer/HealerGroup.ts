import { DrednotBotFactory } from "../drednot/DrednotBotFactory";
import { Logger } from "../log/Logger";
import { Healer } from "./Healer";
import { HealerClickDirection } from "./HealerClickDirection";

export class HealerGroup {
  private counter = 0;
  private readonly healers: Healer[] = [];

  constructor(
    private readonly drednotBotFactory: DrednotBotFactory,
    private readonly logger: Logger
  ) {}

  readonly create = async (
    url: string,
    clickDirection: HealerClickDirection
  ) => {
    const onClose = () => {
      this.removeHealer(healer);
    };

    const counter = this.counter;
    const logger: Logger = (log) => {
      this.logger(`healer #${counter}: ${log}`);
    };

    const drednotBot = await this.drednotBotFactory.create(url, logger);
    const healer = new Healer(clickDirection, drednotBot, onClose, logger);
    this.healers.push(healer);

    this.counter++;
  };

  private readonly removeHealer = (healer: Healer) => {
    const index = this.healers.indexOf(healer);
    if (index >= 0) {
      this.healers.splice(index, 1);
    }
  };
}
