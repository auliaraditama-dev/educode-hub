"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { bootstrapTheme, isTheme, THEME_KEY, type Theme } from "@/lib/theme";
const Context = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({ theme: "system", setTheme: () => {} });
export const useTheme = () => useContext(Context);
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setState] = useState<Theme>("system");
  const apply = useCallback((value: Theme) => {
    const root = document.documentElement;
    const resolved =
      value === "system"
        ? matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : value;
    root.dataset.themePreference = value;
    root.dataset.theme = resolved;
    root.style.colorScheme = resolved;
    root.style.backgroundColor = resolved === "dark" ? "#141923" : "#f7f8fa";
    document
      .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
      .forEach((meta) => {
        meta.content = resolved === "dark" ? "#141923" : "#f7f8fa";
        meta.removeAttribute("media");
      });
    setState(value);
  }, []);
  useEffect(() => {
    bootstrapTheme();
    const initial = document.documentElement.dataset.themePreference;
    apply(isTheme(initial) ? initial : "system");
    const media = matchMedia("(prefers-color-scheme: dark)");
    const syncSystem = () => {
      if (document.documentElement.dataset.themePreference === "system")
        apply("system");
    };
    const syncStorage = (event: StorageEvent) => {
      if (event.key === THEME_KEY || event.key === null)
        apply(isTheme(event.newValue) ? event.newValue : "system");
    };
    media.addEventListener("change", syncSystem);
    window.addEventListener("storage", syncStorage);
    return () => {
      media.removeEventListener("change", syncSystem);
      window.removeEventListener("storage", syncStorage);
    };
  }, [apply]);
  const setTheme = useCallback(
    (value: Theme) => {
      apply(value);
      try {
        localStorage.setItem(THEME_KEY, value);
      } catch {
        /* Current document still works with blocked storage. */
      }
    },
    [apply],
  );
  return (
    <Context.Provider value={{ theme, setTheme }}>{children}</Context.Provider>
  );
}
