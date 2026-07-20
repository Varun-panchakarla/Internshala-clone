import React from 'react';
import incuxaiLogo from '../../assets/incuxai-logo.jpg';

const Logo = ({ className = "h-9 w-auto", mode = "auto" }) => {
  // Determine text fill classes based on the mode:
  // - "light": force dark text (for light background)
  // - "dark": force white/light text (for dark background)
  // - "auto": use Tailwind's dark: classes to switch automatically
  let textClass = "text-slate-900 dark:text-white";
  let careersClass = "text-slate-500 dark:text-slate-400";

  if (mode === "dark") {
    textClass = "text-white";
    careersClass = "text-slate-400";
  } else if (mode === "light") {
    textClass = "text-slate-900";
    careersClass = "text-slate-500";
  }

  return (
    <div className={`flex items-center gap-2.5 select-none shrink-0 ${className}`}>
      <img
        src={incuxaiLogo}
        alt="IncuXAI Logo"
        className="h-full w-auto object-contain rounded-lg shadow-sm shrink-0"
      />
      <span className={`text-xl font-black tracking-tight leading-none ${textClass} transition-colors duration-200`}>
        IncuXAI<span className={`font-normal ${careersClass}`}> Careers</span>
      </span>
    </div>
  );
};

export default Logo;
