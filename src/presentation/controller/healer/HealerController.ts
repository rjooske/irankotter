import { HealerApplication } from "../../../application/healer/HealerApplication";
import { HealerClickDirection } from "../../../domain/healer/HealerClickDirection";
import { Router } from "../router/Router";
import { PostRequest, Response } from "../router/types";

interface PostBody {
  url: string;
  clickDirection: HealerClickDirection;
}

export class HealerController {
  constructor(
    router: Router,
    private readonly healerApplication: HealerApplication
  ) {
    const url = "/healer";
    router.receiveGet(url, this.handleGet);
    router.receivePost(url, this.handlePost);
  }

  private readonly handleGet = async (): Promise<Response> => {
    const healers = this.healerApplication
      .list()
      .map((healer) => ({ shipName: healer.getShipName() }));

    return {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(healers),
    };
  };

  private readonly handlePost = async (
    request: PostRequest
  ): Promise<Response> => {
    const body = JSON.parse(request.body) as Partial<PostBody> | undefined;
    if (
      !body ||
      !body.url ||
      !(
        body.clickDirection === "above" ||
        body.clickDirection === "left" ||
        body.clickDirection === "right"
      )
    ) {
      return { status: 400 };
    }

    await this.healerApplication.create(body.url, body.clickDirection);

    return { status: 200 };
  };
}
