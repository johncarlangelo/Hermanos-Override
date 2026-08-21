import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AppSettings } from '../../shared/types';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'dark' | 'light';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');

  // Load initial setting from electronAPI if available
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getSettings().then((settings: AppSettings) => {
        if (settings?.theme) {
          setThemeState(settings.theme);
        }
      }).catch((err) => {
        console.error('Failed to load theme settings:', err);
      });
    }
  }, []);

  // Update resolved theme whenever theme changes or system changes
  useEffect(() => {
    const root = document.documentElement;
    let actualTheme: 'dark' | 'light' = 'dark';

    if (theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      actualTheme = systemDark ? 'dark' : 'light';
    } else {
      actualTheme = theme;
    }

    setResolvedTheme(actualTheme);

    if (actualTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    if (window.electronAPI?.setTitleBarTheme) {
      window.electronAPI.setTitleBarTheme(actualTheme);
    }
  }, [theme]);

  // Listen for system theme changes if set to system
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const root = document.documentElement;
      const actualTheme = e.matches ? 'dark' : 'light';
      setResolvedTheme(actualTheme);
      if (actualTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (window.electronAPI) {
      window.electronAPI.updateSettings({ theme: newTheme }).catch((err) => {
        console.error('Failed to persist theme setting:', err);
      });
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
