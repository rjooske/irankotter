import { MouseEventListener } from "../../domain/mouse/MouseEventListener";
import * as domain from "../../domain/mouse/MouseService";

export class MouseService implements domain.MouseService {
  private readonly listeners: MouseEventListener[] = [];

  constructor() {
    setInterval(() => {
      const angle = (Math.PI / 2) * (Date.now() / 1000);
      const x = 0.5 * Math.cos(angle) + 0.5;
      const y = 0.5 * Math.sin(angle) + 0.5;

      for (const listener of this.listeners) {
        listener.onMouseMove({
          x,
          y,
          screenWidth: 1,
          screenHeight: 1,
        });
      }
    }, 50);
  }

  addEventListener(listener: MouseEventListener) {
    this.listeners.push(listener);
  }

  removeEventListener(listener: MouseEventListener) {
    for (let i = 0; i < this.listeners.length; i++) {
      if (this.listeners[i] === listener) {
        this.listeners.splice(i, 1);
      }
    }
  }
}
