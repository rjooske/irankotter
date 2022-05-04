// ==UserScript==
// @name         Irankotter mouse reporter
// @version      1.0
// @description  sends mouse events to the irankotter server over websocket
// @match        https://*.drednot.io/*
// ==/UserScript==

(function () {
  "use strict";

  const ws = new WebSocket("wss://localhost:4433/mouse");

  function sendAsJson(object) {
    ws.send(JSON.stringify(object));
  }

  function convertBrowserButtonToServerButton(button) {
    switch (button) {
      case 0:
        return "left";
      case 2:
        return "right";
    }
  }

  window.addEventListener("mousemove", (event) => {
    sendAsJson({
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
    sendAsJson({ type: "down", button });
  });

  window.addEventListener("mouseup", (event) => {
    const button = convertBrowserButtonToServerButton(event.button);
    if (!button) {
      return;
    }
    sendAsJson({ type: "up", button });
  });
})();
