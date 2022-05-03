import { Server } from "https";
import {
  request as WebSocketRequest,
  server as WebSocketServer,
} from "websocket";
import { MouseEventListener } from "../../domain/mouse/MouseEventListener";
import { MouseService as DomainMouseService } from "../../domain/mouse/MouseService";
import { MouseMessage } from "./message";

export class MouseService implements DomainMouseService {
  private readonly listeners: MouseEventListener[] = [];

  constructor(server: Server) {
    new WebSocketServer({
      httpServer: server,
    }).on("request", this.handleRequest);
  }

  private readonly handleRequest = (request: WebSocketRequest) => {
    request.accept("echo-protocol", request.origin).on("message", (message) => {
      if (message.type !== "utf8") {
        return;
      }

      const data = JSON.parse(message.utf8Data);
      this.handleMouseMessage(data);
    });
  };

  private readonly handleMouseMessage = (message: MouseMessage) => {
    if (message.type === "move") {
      for (const listener of this.listeners) {
        listener.onMouseMove(message);
      }
    } else if (message.type === "down") {
      for (const listener of this.listeners) {
        listener.onMouseButtonDown(message.button);
      }
    } else if (message.type === "up") {
      for (const listener of this.listeners) {
        listener.onMouseButtonUp(message.button);
      }
    }
  };

  readonly addEventListener = (listener: MouseEventListener) => {
    this.listeners.push(listener);
  };

  readonly removeEventListener = (listener: MouseEventListener) => {
    const index = this.listeners.indexOf(listener);
    if (index >= 0) {
      this.listeners.splice(index, 1);
    }
  };
}
