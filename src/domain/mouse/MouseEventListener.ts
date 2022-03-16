import { MouseButton } from "./MouseButton";
import { MouseMoveEvent } from "./MouseMoveEvent";

export interface MouseEventListener {
  onMouseMove(event: MouseMoveEvent): void;
  onMouseButtonDown(button: MouseButton): void;
  onMouseButtonUp(button: MouseButton): void;
}
