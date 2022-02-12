import { Healer } from "./Healer";

async function main() {
  const healers = await Promise.all(
    new Array(3)
      .fill(0)
      .map(() =>
        Healer.join("https://test.drednot.io/invite/esDt-6P1Ohf4H5SUiytuJd2o")
      )
  );

  await new Promise((res) => process.on("SIGINT", res));

  await Promise.all(healers.map((healer) => healer.leave()));
}

main();
