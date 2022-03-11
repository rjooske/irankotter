import { DrednotChatRole } from "./DrednotChatRole";

export interface DrednotChat {
  role?: DrednotChatRole;
  name: string;
  text: string;
}
