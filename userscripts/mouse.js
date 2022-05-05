// ==UserScript==
// @name         Irankotter mouse reporter
// @version      1.0
// @description  sends mouse events to the irankotter server over websocket
// @match        https://*.drednot.io/*
// ==/UserScript==

(function () {
  "use strict";

  const ws = new (class {
    constructor() {
      this.connection = new WebSocket("wss://localhost:4433/mouse");

      setInterval(() => {
        if (!this.isAlive()) {
          this.connection = new WebSocket(this.connection.url);
        }
      }, 5000);
    }

    isAlive() {
      return (
        this.connection.readyState === WebSocket.CONNECTING ||
        this.connection.readyState === WebSocket.OPEN
      );
    }

    send(object) {
      if (!this.isAlive()) {
        return;
      }

      this.connection.send(JSON.stringify(object));
    }
  })();

  function convertBrowserButtonToServerButton(button) {
    switch (button) {
      case 0:
        return "left";
      case 2:
        return "right";
    }
  }

  window.addEventListener("mousemove", (event) => {
    ws.send({
      type: "move",
      x: event.clientX,
      y: event.clientY,
      screenWidth: innerWidth,
      screenHeight: innerHeight,
    });
  });

  window.addEventListener("mousedown", (event) => {
    const button = convertBrowserButtonToServerButton(event.button);
    if (!button) {
      return;
    }
    ws.send({ type: "down", button });
  });

  window.addEventListener("mouseup", (event) => {
    const button = convertBrowserButtonToServerButton(event.button);
    if (!button) {
      return;
    }
    ws.send({ type: "up", button });
  });
})();
