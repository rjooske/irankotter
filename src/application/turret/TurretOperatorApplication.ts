import { TurretOperatorGroup } from "../../domain/turret/TurretOperatorGroup";

export class TurretOperatorApplication {
  constructor(private readonly turretOperatorGroup: TurretOperatorGroup) {}

  readonly list = () => {
    return this.turretOperatorGroup.operators;
  };

  readonly create = async (url: string) => {
    await this.turretOperatorGroup.create(url);
  };
}
