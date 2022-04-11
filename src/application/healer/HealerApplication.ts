import { HealerClickDirection } from "../../domain/healer/HealerClickDirection";
import { HealerGroup } from "../../domain/healer/HealerGroup";

export class HealerApplication {
  constructor(private readonly healerGroup: HealerGroup) {}

  readonly list = () => {
    return this.healerGroup.healers;
  };

  readonly create = async (
    url: string,
    clickDirection: HealerClickDirection
  ) => {
    await this.healerGroup.create(url, clickDirection);
  };
}
