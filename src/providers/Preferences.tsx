import { createPrefersDark } from "@solid-primitives/media";
import { makePersisted } from "@solid-primitives/storage";
import {
  type Accessor,
  type Component,
  createContext,
  type ParentProps,
  useContext,
} from "solid-js";
import { createStore, type SetStoreFunction } from "solid-js/store";

import type { BoardRotation } from "../components/Game.context.js";

export type Theme = "light" | "dark";

export interface Preferences {
  // unset follows the system color scheme
  theme?: Theme;
  uprightNumbers: boolean;
  uprightPieces: boolean;
  boardRotation: {
    // clockwise quarter turns; at 0 red's home row is on top
    local: BoardRotation;
    // quarter turns from the default view with the player's own pieces at the bottom
    online: BoardRotation;
  };
}

export const PREFERENCES_KEY = "preferences";
const LEGACY_KEYS = ["theme", "boardRotation", "uprightNumbers"] as const;

export const isBoardRotation = (n: unknown): n is BoardRotation =>
  typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= 3;

const isTheme = (t: unknown): t is Theme => t === "light" || t === "dark";

const defaultPreferences = (): Preferences => ({
  uprightNumbers: false,
  uprightPieces: false,
  boardRotation: { local: 0, online: 0 },
});

/** Builds preferences from untrusted storage data, keeping defaults for anything invalid. */
export function parsePreferences(raw: unknown): Preferences {
  const prefs = defaultPreferences();
  if (typeof raw !== "object" || raw === null) return prefs;
  const r = raw as Record<string, unknown>;
  if (isTheme(r.theme)) prefs.theme = r.theme;
  if (typeof r.uprightNumbers === "boolean")
    prefs.uprightNumbers = r.uprightNumbers;
  if (typeof r.uprightPieces === "boolean")
    prefs.uprightPieces = r.uprightPieces;
  const rotation = r.boardRotation as Record<string, unknown> | undefined;
  if (isBoardRotation(rotation?.local))
    prefs.boardRotation.local = rotation.local;
  if (isBoardRotation(rotation?.online))
    prefs.boardRotation.online = rotation.online;
  return prefs;
}

// moves settings saved under their own keys by older versions into PREFERENCES_KEY
function migrateLegacyKeys() {
  if (localStorage.getItem(PREFERENCES_KEY) !== null) return;
  if (LEGACY_KEYS.every((key) => localStorage.getItem(key) === null)) return;
  const prefs = parsePreferences({
    theme: localStorage.getItem("theme"),
    uprightNumbers: localStorage.getItem("uprightNumbers") === "true",
    boardRotation: { local: Number(localStorage.getItem("boardRotation")) },
  });
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
  for (const key of LEGACY_KEYS) localStorage.removeItem(key);
}

interface PreferencesContextValue {
  preferences: Preferences;
  setPreferences: SetStoreFunction<Preferences>;
  theme: Accessor<Theme>;
  toggleDarkMode: () => void;
  // forced on while uprightPieces is on
  uprightNumbers: Accessor<boolean>;
}

const PreferencesContext = createContext<PreferencesContextValue>();

export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error("can't find PreferencesContext");
  return context;
}

const PreferencesProvider: Component<ParentProps> = (props) => {
  migrateLegacyKeys();
  const [preferences, setPreferences] = makePersisted<
    Preferences,
    [Preferences, SetStoreFunction<Preferences>]
  >(createStore(defaultPreferences()), {
    name: PREFERENCES_KEY,
    deserialize: (data) => parsePreferences(JSON.parse(data)),
  });
  const prefersDark = createPrefersDark();

  const theme = () => preferences.theme ?? (prefersDark() ? "dark" : "light");

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        setPreferences,
        theme,
        toggleDarkMode: () => {
          setPreferences("theme", theme() === "dark" ? "light" : "dark");
        },
        uprightNumbers: () =>
          preferences.uprightPieces || preferences.uprightNumbers,
      }}
    >
      {props.children}
    </PreferencesContext.Provider>
  );
};

export default PreferencesProvider;
