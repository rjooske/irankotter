import { IncomingMessage, ServerResponse } from "http";
import { createServer } from "https";
import { inspect } from "util";
import { Logger } from "../../../domain/log/Logger";
import { GetReceiver } from "./GetReceiver";
import { PostReceiver } from "./PostReceiver";

interface GetRoute {
  method: "GET";
  url: string;
  receiver: GetReceiver;
}

interface PostRoute {
  method: "POST";
  url: string;
  receiver: PostReceiver;
}

type Route = GetRoute | PostRoute;

export class HttpsServer {
  private readonly routes: Route[] = [
    {
      method: "GET",
      url: "/",
      receiver: async () => "OK",
    },
  ];

  constructor(
    certificate: string,
    key: string,
    private readonly logger: Logger
  ) {
    createServer({ cert: certificate, key }, this.handleRequest);
  }

  private readonly handleRequest = async (
    request: IncomingMessage,
    response: ServerResponse
  ) => {
    this.logger(
      `received "${request.method} ${request.url}" from ${request.headers.origin}`
    );

    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Headers", "*");
    response.setHeader("Access-Control-Allow-Methods", "*");
    response.setHeader("Access-Control-Max-Age", 3600);

    if (request.method === "OPTIONS") {
      response.writeHead(204).end();
      return;
    }

    const route = this.routes.find(
      (route) => route.method === request.method && route.url === request.url
    );
    if (!route) {
      return;
    }

    let body = "";
    try {
      if (route.method === "GET") {
        body = await route.receiver();
      } else if (route.method === "POST") {
        body = await route.receiver(""); // FIXME:
      }
    } catch (error) {
      body = inspect(error);
    }
  };

  readonly receiveGet = (url: string, receiver: GetReceiver) => {
    this.routes.push({ method: "GET", url, receiver });
  };

  readonly receivePost = (url: string, receiver: PostReceiver) => {
    this.routes.push({ method: "POST", url, receiver });
  };
}
