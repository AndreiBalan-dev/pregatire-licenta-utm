"use client";

import { useCallback, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem("utm-theme") as Theme | null;
    if (stored) setThemeState(stored); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    localStorage.setItem("utm-theme", t);

    if (t === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
    } else {
      document.documentElement.setAttribute("data-theme", t);
    }
  }, []);

  useEffect(() => {
    const stored = (localStorage.getItem("utm-theme") as Theme) || "dark";
    setTheme(stored); // eslint-disable-line react-hooks/set-state-in-effect

    if (stored === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => setTheme("system");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [setTheme]);

  return { theme, setTheme };
}
