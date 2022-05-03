export type MouseMessage =
  | MouseMoveMessage
  | MouseButtonDownMessage
  | MouseButtonUpMessage;

export interface MouseMoveMessage {
  type: "move";
  x: number;
  y: number;
  screenWidth: number;
  screenHeight: number;
}

export interface MouseButtonDownMessage {
  type: "down";
  button: MouseButton;
}

export interface MouseButtonUpMessage {
  type: "up";
  button: MouseButton;
}

export type MouseButton = "left" | "right";
