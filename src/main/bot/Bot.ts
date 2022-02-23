import { Browser } from "puppeteer";

export interface Bot {
  id: string;
  browser: Browser;
}
