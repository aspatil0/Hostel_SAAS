import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export interface ThemeToggleProps {
  variant?: 'segmented' | 'icon';
  className?: string;
  showLabels?: boolean;
}

export function ThemeToggle({
  variant = 'segmented',
  className = '',
  showLabels = true,
}: ThemeToggleProps) {
  const { theme, setTheme, toggleTheme, isDark } = useTheme();

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Switch to ${isDark ? 'White' : 'Black'} theme`}
        title={`Current: ${isDark ? 'Black' : 'White'} theme. Click to switch.`}
        className={`flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white shadow-2xs transition-all hover:bg-white/20 cursor-pointer ${className}`}
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-amber-300 animate-in spin-in-180 duration-200" />
        ) : (
          <Sun className="h-4 w-4 text-amber-400 animate-in spin-in-180 duration-200" />
        )}
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label="Theme options: Black and White"
      className={`inline-flex items-center rounded-xl border border-white/10 bg-black/25 p-1 dark:border-white/10 dark:bg-black/40 ${className}`}
    >
      {/* White (Light) Option */}
      <button
        type="button"
        onClick={() => setTheme('light')}
        aria-pressed={theme === 'light'}
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
          theme === 'light'
            ? 'bg-white text-[#172B45] shadow-xs'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <Sun
          className={`h-3.5 w-3.5 ${
            theme === 'light' ? 'text-amber-500' : 'text-slate-400'
          }`}
        />
        {showLabels && <span>White</span>}
      </button>

      {/* Black (Dark) Option */}
      <button
        type="button"
        onClick={() => setTheme('dark')}
        aria-pressed={theme === 'dark'}
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
          theme === 'dark'
            ? 'bg-indigo-600 text-white shadow-xs'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <Moon
          className={`h-3.5 w-3.5 ${
            theme === 'dark' ? 'text-amber-300' : 'text-slate-400'
          }`}
        />
        {showLabels && <span>Black</span>}
      </button>
    </div>
  );
}
