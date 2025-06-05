import { createStore } from "solid-js/store";

export interface IPreferencesData {
  color?: string;
  startPage?: string;
  // orientation?: "portrait" | "landscape";
};

const [preferences, setPreferences] = createStore<IPreferencesData>({});

export function usePreferences() {
  return [preferences, setPreferences] as const;
}
