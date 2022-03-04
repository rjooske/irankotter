import { Browser } from "puppeteer";
import { Joiner } from "../../join/Joiner";
import { Jumper } from "../../jump/Jumper";
import { Logger } from "../../log/Logger";

export interface Bot {
  id: string;
  browser: Browser;
  joiner: Joiner;
  jumper: Jumper;
  logger: Logger;
}
