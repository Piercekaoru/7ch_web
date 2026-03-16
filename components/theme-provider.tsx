import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = '7ch_theme';
const SYSTEM_THEME_QUERY = '(prefers-color-scheme: dark)';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia(SYSTEM_THEME_QUERY).matches ? 'dark' : 'light';
};

const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'light';
};

const applyTheme = (theme: Theme): 'light' | 'dark' => {
  const resolvedTheme = theme === 'system' ? getSystemTheme() : theme;
  const root = document.documentElement;
  root.classList.toggle('dark', resolvedTheme === 'dark');
  root.dataset.theme = theme;
  root.style.colorScheme = resolvedTheme;
  return resolvedTheme;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme());
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() =>
    theme === 'system' ? getSystemTheme() : theme
  );

  useEffect(() => {
    const nextResolvedTheme = applyTheme(theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    setResolvedTheme(nextResolvedTheme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(SYSTEM_THEME_QUERY);
    const handleChange = () => {
      if (theme !== 'system') return;
      setResolvedTheme(applyTheme('system'));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme: setThemeState,
    }),
    [resolvedTheme, theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
