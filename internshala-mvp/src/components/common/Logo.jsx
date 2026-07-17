import React from 'react';

const Logo = ({ className = "h-9 w-auto", mode = "auto" }) => {
  // Determine fill classes based on the mode:
  // - "light": force dark text (for light background)
  // - "dark": force white/light text (for dark background)
  // - "auto": use Tailwind's dark: classes to switch automatically
  let textClass = "fill-slate-900";
  let careersClass = "fill-slate-500";

  if (mode === "dark") {
    textClass = "fill-white";
    careersClass = "fill-slate-350";
  } else if (mode === "auto") {
    textClass = "fill-slate-900 dark:fill-white";
    careersClass = "fill-slate-555 dark:fill-slate-400";
  } else if (mode === "light") {
    textClass = "fill-slate-900";
    careersClass = "fill-slate-500";
  }

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 240 54" 
      className={`${className} transition-colors duration-250`}
    >
      {/* Icon Circle */}
      <circle cx="27" cy="27" r="18" fill="#3a82c2" />
      {/* lowercase 'i' */}
      <text 
        x="27" 
        y="35" 
        fontFamily="Outfit, Inter, system-ui, sans-serif" 
        fontWeight="900" 
        fontSize="24" 
        fill="#ffffff" 
        textAnchor="middle"
      >
        i
      </text>
      
      {/* Brand Text */}
      <text 
        x="58" 
        y="34" 
        fontFamily="Outfit, Inter, system-ui, sans-serif" 
        fontSize="21" 
        className={`${textClass} transition-colors duration-200`}
      >
        <tspan fontWeight="900">IncuXAI</tspan>
        <tspan fontWeight="400" className={careersClass}> Careers</tspan>
      </text>
    </svg>
  );
};

export default Logo;
