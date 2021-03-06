import { IncomingMessage, ServerResponse } from "http";
import { Server } from "https";
import { Readable } from "stream";
import { inspect } from "util";
import { GetReceiver, PostReceiver } from "./types";

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

export class Router {
  private readonly routes: Route[] = [];

  constructor(server: Server) {
    server.on("request", this.handleRequest);
  }

  private readonly handleRequest = async (
    request: IncomingMessage,
    response: ServerResponse
  ) => {
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
      response.writeHead(404).end("Not Found");
      return;
    }

    try {
      const { status, headers, body } = await callRouteReceiver(route, request);
      response.writeHead(status, headers).end(body);
    } catch (error) {
      response.writeHead(500).end(inspect(error));
    }
  };

  readonly receiveGet = (url: string, receiver: GetReceiver) => {
    this.routes.push({ method: "GET", url, receiver });
  };

  readonly receivePost = (url: string, receiver: PostReceiver) => {
    this.routes.push({ method: "POST", url, receiver });
  };
}

async function callRouteReceiver(route: Route, request: IncomingMessage) {
  const url = request.url ?? "";
  const headers = request.headers;

  switch (route.method) {
    case "GET":
      return await route.receiver({ url, headers });
    case "POST":
      const body = await convertStreamToString(request);
      return await route.receiver({ url, headers, body });
  }
}

async function convertStreamToString(stream: Readable) {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}
