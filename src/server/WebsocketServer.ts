import { connection, Message, request, server } from "websocket";
import { Logger } from "../log/Logger";
import { WebsocketMessageReceiver } from "./WebsocketMessageReceiver";

export class WebsocketServer {
  private connection?: connection; // TODO: Support multiple connections

  constructor(
    server: server,
    private readonly path: string,
    private readonly receiver: WebsocketMessageReceiver,
    private readonly logger: Logger
  ) {
    server.on("request", this.handleRequest.bind(this));
  }

  private handleRequest(req: request) {
    if (this.connection || req.httpRequest.url !== this.path) {
      req.reject();
      return;
    }

    const connection = req.accept(null, req.origin);
    connection.on("message", this.handleConnectionMessage.bind(this));
    connection.on("close", this.handleConnectionClose.bind(this));
    this.connection = connection;

    this.logger.log("connected");
  }

  private handleConnectionMessage(message: Message) {
    if (message.type !== "utf8") {
      return;
    }

    this.logger.log("received", message.utf8Data);
    this.receiver(message.utf8Data);
  }

  private handleConnectionClose(code: number, description: string) {
    this.connection = undefined;
    this.logger.log(`closed (${code} ${description})`);
  }
}
