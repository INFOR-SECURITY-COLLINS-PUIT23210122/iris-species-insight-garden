// Light/dark theme: the class on <html> is the source of truth, persisted in localStorage.
import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";
export const THEME_STORAGE_KEY = "iris-theme";

// Kept in sync with the theme-color <meta> so a phone's status bar matches the app.
export const THEME_COLOR: Record<Theme, string> = { light: "#faf6ee", dark: "#0a140f" };

function applyThemeColor(t: Theme) {
  const meta = document.head.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", THEME_COLOR[t]);
}

/** Inline script run before paint so the saved theme applies without a flash. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}})();`;

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const initial: Theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    setThemeState(initial);
    applyThemeColor(initial);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    document.documentElement.classList.toggle("dark", t === "dark");
    applyThemeColor(t);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, t);
    } catch {
      // storage unavailable (private mode) — theme still applies for this session
    }
    setThemeState(t);
  }, []);

  return { theme, setTheme, toggle: () => setTheme(theme === "dark" ? "light" : "dark") };
}
