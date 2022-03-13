import { MouseMoveEvent } from "./MouseMoveEvent";

export interface MouseEventListener {
  onMouseMove(event: MouseMoveEvent): void;
  onMouseButtonDown(): void;
  onMouseButtonUp(): void;
}
