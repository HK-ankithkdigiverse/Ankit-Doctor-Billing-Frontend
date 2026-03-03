import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { STORAGE_KEYS } from "../constants";

export type ThemeMode = "light" | "dark";

type ThemeModeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);

const resolveInitialMode = (): ThemeMode => {
  if (typeof window === "undefined") return "light";
  const initial: ThemeMode = "light";
  document.documentElement.setAttribute("data-theme", initial);
  localStorage.setItem(STORAGE_KEYS.THEME_MODE, initial);
  return initial;
};

export const ThemeModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => resolveInitialMode());

  useEffect(() => {
    // Light mode only
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem(STORAGE_KEYS.THEME_MODE, "light");
    if (mode !== "light") {
      setModeState("light");
    }
  }, [mode]);

  const setMode = useCallback((_nextMode: ThemeMode) => {
    setModeState("light");
  }, []);

  const toggleMode = useCallback(() => {
    setModeState("light");
  }, []);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      toggleMode,
    }),
    [mode, setMode, toggleMode]
  );

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
};

export const useThemeMode = () => {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) {
    throw new Error("useThemeMode must be used within ThemeModeProvider");
  }
  return ctx;
};
