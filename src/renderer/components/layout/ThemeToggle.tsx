import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun, Laptop } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  const getIcon = () => {
    if (theme === 'dark') return <Moon className="w-4 h-4 text-sky-400" />;
    if (theme === 'light') return <Sun className="w-4 h-4 text-amber-400" />;
    return <Laptop className="w-4 h-4 text-slate-300" />;
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
      className="p-2.5 rounded-xl text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/10 transition-all duration-200 cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
    >
      {getIcon()}
    </button>
  );
};
