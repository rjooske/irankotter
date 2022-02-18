document.querySelector("form").addEventListener("submit", async (event) => {
  event.preventDefault();
  await sendJSON("/summon", {
    click: event.target.click.value,
    url: event.target.url.value,
    count: parseInt(event.target.count.value),
  });
  location.reload();
});

document.querySelectorAll(".kill").forEach((a) =>
  a.addEventListener("click", async (event) => {
    event.preventDefault();
    await sendJSON("/kill", { id: a.dataset.id });
    location.reload();
  })
);

document.querySelector("#shutdown").addEventListener("click", async (event) => {
  event.preventDefault();
  await sendJSON("/shutdown");
  location.reload();
});

document.querySelector("#kill-all").addEventListener("click", async (event) => {
  event.preventDefault();
  await Promise.all(
    [...document.querySelectorAll(".kill")].map((a) =>
      sendJSON("/kill", { id: a.dataset.id })
    )
  );
  location.reload();
});

function sendJSON(url, json) {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(json),
  });
}
