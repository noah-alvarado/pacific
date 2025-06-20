import {
  Accessor,
  Component,
  createContext,
  createSignal,
  ParentProps,
  Setter,
  useContext,
} from "solid-js";

export type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Accessor<Theme>;
  setTheme: Setter<Theme>;
  toggleDarkMode: () => void;
}>();

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error(`can't find ThemeContext`);
  }
  return context;
}

const ThemeProvider: Component<ParentProps> = (props) => {
  const [theme, setTheme] = createSignal<Theme>(
    (localStorage.getItem("theme") as Theme | undefined) ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"),
  );

  function toggleDarkMode() {
    const newTheme = theme() === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleDarkMode }}>
      {props.children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
