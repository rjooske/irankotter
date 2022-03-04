import { Page } from "puppeteer";

export function getPageWidth(page: Page) {
  return page.viewport()?.width ?? 0;
}

export function getPageHeight(page: Page) {
  return page.viewport()?.height ?? 0;
}
