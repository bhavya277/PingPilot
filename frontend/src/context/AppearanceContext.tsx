import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from "react";

export type ThemeMode = "dark" | "light" | "system";
export type DensityMode = "standard" | "compact";
export type ResolvedTheme = "dark" | "light";

interface AppearanceContextType {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  density: DensityMode;
  setTheme: (theme: ThemeMode) => void;
  setDensity: (density: DensityMode) => void;
}

const AppearanceContext = createContext<AppearanceContextType | undefined>(
  undefined
);

const THEME_STORAGE_KEY = "pingpilot_theme";
const DENSITY_STORAGE_KEY = "pingpilot_density";

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "dark";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "dark" || stored === "light" || stored === "system") {
    return stored;
  }
  return "dark";
}

function getStoredDensity(): DensityMode {
  if (typeof window === "undefined") return "standard";
  const stored = localStorage.getItem(DENSITY_STORAGE_KEY);
  if (stored === "standard" || stored === "compact") {
    return stored;
  }
  return "standard";
}

export const AppearanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [theme, setThemeState] = useState<ThemeMode>(getStoredTheme);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);
  const [density, setDensityState] = useState<DensityMode>(getStoredDensity);

  // Listen to system changes when in 'system' mode
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  const resolvedTheme: ResolvedTheme =
    theme === "system" ? systemTheme : theme;

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // localStorage may fail in private mode
    }
  }, []);

  const setDensity = useCallback((newDensity: DensityMode) => {
    setDensityState(newDensity);
    try {
      localStorage.setItem(DENSITY_STORAGE_KEY, newDensity);
    } catch {
      // localStorage may fail in private mode
    }
  }, []);

  // Sync DOM classes and attributes whenever theme or density changes
  useEffect(() => {
    const root = document.documentElement;

    // Theme updates
    root.classList.remove("dark", "light");
    root.classList.add(resolvedTheme);
    root.setAttribute("data-theme", resolvedTheme);

    // Density updates
    root.setAttribute("data-density", density);
  }, [resolvedTheme, density]);

  return (
    <AppearanceContext.Provider
      value={{
        theme,
        resolvedTheme,
        density,
        setTheme,
        setDensity
      }}
    >
      {children}
    </AppearanceContext.Provider>
  );
};

export function useAppearance(): AppearanceContextType {
  const context = useContext(AppearanceContext);
  if (!context) {
    throw new Error("useAppearance must be used within an AppearanceProvider");
  }
  return context;
}
