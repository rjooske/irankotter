import { HealerState } from "./HealerState";

export type HealerStateChangeReceiver = (state: HealerState) => void;
