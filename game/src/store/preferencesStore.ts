import { createStore } from "solid-js/store";

export interface IPreferencesData {
  color?: string;
  startPage?: string;
  orientation?: "player-top" | "player-left" | "player-right" | "player-bottom";
};

const [preferences, setPreferences] = createStore<IPreferencesData>({});

export function usePreferences() {
  return [preferences, setPreferences] as const;
}
