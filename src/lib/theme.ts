export type Theme = "light" | "dark" | "system";
export const THEME_KEY = "educode:theme";
export const isTheme = (value: unknown): value is Theme =>
  value === "light" || value === "dark" || value === "system";

// This function is deliberately self-contained: the same synchronous bootstrap
// runs in the document head and in the standalone offline fallback.
export function bootstrapTheme() {
  const root = document.documentElement;
  let preference = "system";
  try {
    const stored = localStorage.getItem("educode:theme");
    if (["light", "dark", "system"].includes(stored || ""))
      preference = stored!;
    else if (stored === null) {
      let legacy: unknown;
      try {
        legacy = JSON.parse(
          localStorage.getItem("educode:progress:v2") || "null",
        )?.theme;
      } catch {}
      if (legacy !== "dark" && legacy !== "light")
        legacy = localStorage.getItem("edu_theme");
      if (legacy === "dark" || legacy === "light") {
        preference = legacy;
        try {
          localStorage.setItem("educode:theme", preference);
        } catch {}
      }
    }
  } catch {}
  const resolved =
    preference === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : preference;
  root.dataset.theme = resolved;
  root.dataset.themePreference = preference;
  root.style.colorScheme = resolved;
  root.style.backgroundColor = resolved === "dark" ? "#141923" : "#f7f8fa";
  document
    .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
    .forEach((meta) => {
      meta.content = resolved === "dark" ? "#141923" : "#f7f8fa";
      meta.removeAttribute("media");
    });
}
export const themeBootstrap = `(${bootstrapTheme.toString()})()`;
