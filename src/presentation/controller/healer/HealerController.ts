import { IncomingMessage, Server, ServerResponse } from "http";
import { Readable } from "stream";
import { HealerApplication } from "../../../application/healer/HealerApplication";
import { HealerClickDirection } from "../../../domain/healer/HealerClickDirection";
import { Logger } from "../../../domain/log/Logger";

interface PostBody {
  url: string;
  clickDirection: HealerClickDirection;
}

// TODO: Generalize the http routing boilerplate
export class HealerController {
  constructor(
    server: Server,
    private readonly healerApplication: HealerApplication,
    private readonly logger: Logger
  ) {
    server.on("request", this.handleRequest);
  }

  private readonly handleRequest = async (
    request: IncomingMessage,
    response: ServerResponse
  ) => {
    if (request.url !== "/healer") {
      return;
    }

    this.logger("got a request at /healer");

    switch (request.method) {
      case "GET":
        await this.handleGet(response);
        break;
      case "POST":
        await this.handlePost(request, response);
        break;
    }
  };

  private readonly handleGet = async (response: ServerResponse) => {
    const output = this.healerApplication
      .list()
      .map((healer) => ({ shipName: healer.getShipName() }));
    response
      .writeHead(200, { "Content-Type": "application/json" })
      .end(JSON.stringify(output));
  };

  private readonly handlePost = async (
    request: IncomingMessage,
    response: ServerResponse
  ) => {
    const body = (await parseStreamAsJSON(request)) as
      | Partial<PostBody>
      | undefined;
    if (
      !body ||
      !body.url ||
      !(
        body.clickDirection === "above" ||
        body.clickDirection === "left" ||
        body.clickDirection === "right"
      )
    ) {
      response.writeHead(400).end();
      return;
    }

    response.writeHead(200).end();
    await this.healerApplication.create(body.url, body.clickDirection);
  };
}

async function parseStreamAsJSON(stream: Readable) {
  const string = await convertStreamToString(stream);
  try {
    return JSON.parse(string);
  } catch {}
}

async function convertStreamToString(stream: Readable) {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}
