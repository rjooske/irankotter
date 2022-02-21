import { EventEmitter } from "events";
import { Page } from "puppeteer";
import TypedEmitter from "typed-emitter";
import { Chat } from "./chat/Chat";
import { ChatReader } from "./chat/ChatReader";

type Events = {
  "heal-start": () => void;
  "heal-stop": () => void;
  "use-up": () => void;
};

const commandToEventName: { [key: string]: keyof Events } = {
  heal: "heal-start",
  "no heal": "heal-stop",
  "use up": "use-up",
};

export class CommandListener extends (EventEmitter as new () => TypedEmitter<Events>) {
  private readonly chatReader: ChatReader;

  constructor(page: Page) {
    super();
    this.chatReader = new ChatReader(page, this.handleChat.bind(this));
  }

  async start() {
    await this.chatReader.start();
  }

  private handleChat(chat: Chat) {
    if (chat.role !== "Captain") {
      return;
    }

    const command = chat.text.toLowerCase();
    const eventName = commandToEventName[command];
    if (!eventName) {
      return;
    }

    this.emit(eventName);
  }
}
