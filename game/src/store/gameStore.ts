import { createStore } from "solid-js/store";

export interface IGameData {
  gameId?: string;
  status?: string;
};

const [game, setGame] = createStore<IGameData>({});

export function useGame() {
  return [game, setGame] as const;
}
