import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Laptop } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  const getIcon = () => {
    if (theme === 'dark') return <Moon className="w-4 h-4" />;
    if (theme === 'light') return <Sun className="w-4 h-4 text-amber-500" />;
    return <Laptop className="w-4 h-4" />;
  };

  const getLabel = () => {
    if (theme === 'dark') return 'Dark Theme';
    if (theme === 'light') return 'Light Theme';
    return 'System Theme';
  };

  return (
    <button
      onClick={cycleTheme}
      title={`Theme: ${getLabel()} (Click to toggle)`}
      aria-label={`Current theme: ${getLabel()}`}
      className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors cursor-pointer"
    >
      {getIcon()}
    </button>
  );
};
