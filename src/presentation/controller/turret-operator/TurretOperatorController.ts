import { TurretOperatorApplication } from "../../../application/turret/TurretOperatorApplication";
import { Router } from "../router/Router";
import { PostRequest, Response } from "../router/types";

interface PostBody {
  url: string;
}

export class TurretOperatorController {
  constructor(
    router: Router,
    private readonly turretOperatorApplication: TurretOperatorApplication
  ) {
    const url = "/turret-operator";
    router.receiveGet(url, this.handleGet);
    router.receivePost(url, this.handlePost);
  }

  private readonly handleGet = async (): Promise<Response> => {
    const operators = this.turretOperatorApplication
      .list()
      .map((operator) => ({ shipName: operator.getShipName() }));

    return {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(operators),
    };
  };

  private readonly handlePost = async (
    request: PostRequest
  ): Promise<Response> => {
    const body = JSON.parse(request.body) as Partial<PostBody> | undefined;
    if (!body || !body.url) {
      return { status: 400 };
    }

    await this.turretOperatorApplication.create(body.url);

    return { status: 200 };
  };
}
