import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`flex items-center justify-center w-9 h-9 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-all duration-200 active:scale-95 border border-slate-200 dark:border-slate-750 focus:outline-none cursor-pointer bg-neutral-50 hover:bg-neutral-100 dark:bg-slate-800/80 dark:hover:bg-slate-850 shadow-sm ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className={`transition-transform duration-300 ease-in-out ${isDark ? 'rotate-90' : 'rotate-0'}`}>
        {isDark ? (
          <FiSun className="w-4 h-4 text-amber-500" />
        ) : (
          <FiMoon className="w-4 h-4 text-slate-600" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;
