// ==UserScript==
// @name         Irankotter remote control
// @version      1.0
// @description  control the irankotter server remotely from the browser
// @match        https://*.drednot.io/*
// ==/UserScript==

(function () {
  "use strict";

  {
    const style = document.createElement("style");
    style.innerHTML = `
      & {
        z-index: 1000;
        position: fixed;
        left: 0.5em;
        bottom: 0.5em;
        padding: 1em;
        display: flex;
        flex-direction: column;
        gap: 1em;
      }

      &[data-hidden] {
        transform: scale(0) translateX(2147483647px);
      }

      & form {
        margin-left: 0.5em;
        display: flex;
        flex-direction: column;
        gap: 0.5em;
      }

      & form > div {
        display: flex;
        flex-direction: row;
        gap: 0.5em;
        align-items: center;
      }

      & form > input[type="submit"] {
        align-self: end;
        border-color: black;
      }

      & input[type="submit"][data-disabled] {
        cursor: not-allowed;
        filter: brightness(0.4);
      }

      & .shortcut {
        margin: 0 0.2em;
        font-family: monospace;
        font-weight: bold;
      }
    `.replace(/&/g, "#irankotter-root");
    document.head.append(style);
  }

  {
    const root = document.createElement("div");
    root.id = "irankotter-root";
    root.classList.add("dark");
    root.innerHTML = `
      <h2>Irankotter remote control</h2>
      <div>
        <h3>Healer</h3>
        <form id="irankotter-healer-form">
          <div>
            <label>Invite link</label>
            <input type="url" name="url" />
          </div>
          <div>
            <label>Count</label>
            <input type="number" name="count" min="1" max="9" value="1" />
          </div>
          <div>
            <label>Click direction</label>
            <select name="clickDirection">
              <option selected value="above">Above</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>
          <input type="submit" name="summon" form="irankotter-healer-form" class="btn btn-green btn-small" value="Summon" />
        </form>
      </div>
      <div>
        <h3>Turret operator</h3>
        <form id="irankotter-turret-operator-form">
          <div>
            <label>Invite link</label>
            <input type="url" name="url" />
          </div>
          <div>
            <label>Count</label>
            <input type="number" name="count" min="1" max="9" value="1" />
          </div>
          <input type="submit" name="summon" form="irankotter-turret-operator-form" class="btn btn-green btn-small" value="Summon" />
        </form>
      </div>
      <p style="align-self:end">
        <span class="shortcut">Alt + I</span> to show/hide this window
      </p>
    `;
    document.body.append(root);

    window.addEventListener("keydown", (event) => {
      if (event.altKey && event.code === "KeyI") {
        root.toggleAttribute("data-hidden");
      }
    });
  }

  const SERVER_BASE_URL = "https://localhost:4433";

  document
    .querySelector("#irankotter-healer-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();

      if (event.target.summon.getAttribute("data-disabled")) {
        return;
      }

      const count = +event.target.count.value;
      const url = event.target.url.value;
      const clickDirection = event.target.clickDirection.value;

      event.target.summon.setAttribute("data-disabled", true);

      for (let i = 0; i < count; i++) {
        try {
          await fetch(SERVER_BASE_URL + "/healer", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ url, clickDirection }),
          });
        } catch (error) {
          console.error(error);
        }
      }

      event.target.summon.removeAttribute("data-disabled");
    });

  document
    .querySelector("#irankotter-turret-operator-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();

      if (event.target.summon.getAttribute("data-disabled")) {
        return;
      }

      const count = +event.target.count.value;
      const url = event.target.url.value;

      event.target.summon.setAttribute("data-disabled", true);

      for (let i = 0; i < count; i++) {
        try {
          await fetch(SERVER_BASE_URL + "/turret-operator", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ url }),
          });
        } catch (error) {
          console.error(error);
        }
      }

      event.target.summon.removeAttribute("data-disabled");
    });
})();
