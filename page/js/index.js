document.querySelector("form").addEventListener("submit", async (event) => {
  event.preventDefault();
  await postJSON("/summon", {
    click: event.target.click.value,
    url: event.target.url.value,
    count: parseInt(event.target.count.value),
  });
  event.target.querySelectorAll("input").forEach((input) => (input.value = ""));
  forceUpdate?.();
});

document.querySelector("#shutdown").addEventListener("click", async (event) => {
  event.preventDefault();
  await postJSON("/shutdown");
  location.reload();
});

document.querySelector("#kill-all").addEventListener("click", async (event) => {
  event.preventDefault();
  await Promise.all(
    [...document.querySelectorAll(".kill")].map((a) =>
      postJSON("/kill", { id: a.dataset.id })
    )
  );
  forceUpdate?.();
});

function postJSON(url, json) {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(json),
  });
}

let forceUpdate;

async function updateHealerElements() {
  const ul = document.querySelector("ul");

  while (true) {
    const response = await fetch("/healers", { method: "POST" });
    const healers = await response.json();
    for (const child of [...ul.children]) {
      child.remove();
    }
    for (const healer of healers) {
      ul.append(createHealerElement(healer.id, healer.shipName));
    }

    await new Promise((resolve) => {
      forceUpdate = resolve;
      setTimeout(resolve, 1000);
    });
    forceUpdate = undefined;
  }
}

function createHealerElement(id, shipName) {
  const label = document.createElement("span");
  label.className = "label";
  label.innerText = shipName ?? "Booting up...";

  const kill = document.createElement("span");
  kill.className = "kill";
  kill.dataset.id = id;
  kill.innerText = "Kill";
  kill.addEventListener("click", async (event) => {
    event.preventDefault();
    await postJSON("/kill", { id });
    forceUpdate?.();
  });

  const li = document.createElement("li");
  li.classList.add("round-left");
  li.classList.add(shipName ? "up" : "boot");
  li.append(label, kill);

  return li;
}

updateHealerElements();
