// Early inline script that applies theme-light/theme-dark from localStorage before paint (matches CSS variables).
import type { ThemeOption } from "../interfaces/i-local-web-server-settings";

export function renderThemeScript(_themeMode: ThemeOption): string {
  return `
(() => {
  const mode = window.localStorage.getItem("lws-theme-mode") || "dark";
  const root = document.body;
  root.classList.remove("theme-light", "theme-dark");
  if (mode === "dark") root.classList.add("theme-dark");
  else root.classList.add("theme-light");
})();
`;
}
