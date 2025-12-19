import { IGameState } from "./GameState.js";

export interface LocalGameConfig {
  gameType: "local";
  turn: IGameState["turn"];
}

export interface OnlineGameConfig {
  gameType: "online";
  player: IGameState["player"];
  turn: IGameState["turn"];
  sendGameEvent: (msg: unknown) => void;
}

export type GameConfig = LocalGameConfig | OnlineGameConfig;
