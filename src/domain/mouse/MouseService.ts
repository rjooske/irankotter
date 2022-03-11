import { MouseEventListener } from "./MouseEventListener";

export interface MouseService {
  addEventListener(listener: MouseEventListener): void;
  removeEventListener(listener: MouseEventListener): void;
}
