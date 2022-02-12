import { Healer } from "./Healer";

async function main() {
  const healers = await Promise.all(
    new Array(3).fill(0).map(async (_, i) => {
      const healer = new Healer(
        "https://test.drednot.io/invite/esDt-6P1Ohf4H5SUiytuJd2o",
        i / 3
      );
      await healer.join();
      return healer;
    })
  );

  await new Promise((res) => process.on("SIGINT", res));

  await Promise.all(healers.map((healer) => healer.leave()));
}

main();
