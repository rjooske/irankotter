const puppeteer = require("puppeteer");
const { CommandListener } = require("./CommandListener");

async function main() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 800, height: 600 },
  });

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

  await page.waitForSelector("#exit_button");

  const commandListener = new CommandListener(page);
  commandListener.on("heal-start", async () => {
    await page.mouse.move(400, 200);
    await page.mouse.down();
  });
  commandListener.on("heal-stop", async () => {
    await Promise.all([
      page.mouse.click(page.viewport().width / 2, page.viewport().height / 2, {
        button: "right",
        delay: 1000,
      }),
      page.mouse.up(),
    ]);
  });
  commandListener.listen();

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
