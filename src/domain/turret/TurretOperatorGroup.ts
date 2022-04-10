import { DrednotBotFactory } from "../../domain/drednot/DrednotBotFactory";
import { Logger } from "../../domain/log/Logger";
import { MouseService } from "../../domain/mouse/MouseService";
import { TurretOperator } from "./TurretOperator";

export class TurretOperatorGroup {
  private counter = 0;
  private readonly operators: TurretOperator[] = [];

  constructor(
    private readonly drednotBotFactory: DrednotBotFactory,
    private readonly mouseService: MouseService,
    private readonly logger: Logger
  ) {}

  async create(url: string) {
    const onClose = () => {
      this.removeOperator(operator);
    };

    const counter = this.counter;
    const logger: Logger = (log) => {
      this.logger(`turret operator #${counter}: ${log}`);
    };

    const drednotBot = await this.drednotBotFactory.create(url, logger);
    const operator = new TurretOperator(
      drednotBot,
      this.mouseService,
      onClose,
      logger
    );
    this.operators.push(operator);

    this.counter++;
  }

  private removeOperator(operator: TurretOperator) {
    const index = this.operators.indexOf(operator);
    if (index >= 0) {
      this.operators.splice(index, 1);
    }
  }
}
