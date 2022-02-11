const puppeteer = require("puppeteer");

async function main() {
  const browser = await puppeteer.launch({ headless: false });

  const page = await browser.newPage();
  await page.goto("https://test.drednot.io/invite/esDt-6P1Ohf4H5SUiytuJd2o");

  await waitForAndClickSelector(
    page,
    "body > div.modal-container > div > div > div > button"
  );
  await waitForAndClickSelector(
    page,
    "body > div.modal-container > div > div > button"
  );

  await sleep(5 * 1000);

  await page.keyboard.press("Space", { delay: 1000 });

  await new Promise(() => {});
}

async function waitForAndClickSelector(page, selector) {
  await page.waitForSelector(selector);
  await page.click(selector);
}

function sleep(duration) {
  return new Promise((res) => setTimeout(res, duration));
}

main();
