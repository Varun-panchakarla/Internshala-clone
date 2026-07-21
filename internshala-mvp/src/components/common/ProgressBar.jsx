import React from 'react';

const ProgressBar = ({
  value,
  progress,
  max = 100,
  showPercentage = true,
  size = 'md', // sm, md, lg
  height,
  colorScheme = 'dynamic' // dynamic, brand, success
}) => {
  // Support both 'value' and 'progress' props, defaulting to 0
  const rawValue = value !== undefined ? value : (progress !== undefined ? progress : 0);
  const parsedValue = typeof rawValue === 'number' ? rawValue : parseFloat(rawValue) || 0;
  const percentage = Math.min(max, Math.max(0, parsedValue));

  const sizes = {
    sm: 'h-1.5',
    md: 'h-3',
    lg: 'h-4'
  };

  // Get dynamic colors based on completion percentage
  const getDynamicColor = () => {
    if (colorScheme === 'brand') return 'bg-brand-600';
    if (colorScheme === 'success') return 'bg-emerald-500';
    
    // Dynamic scheme
    if (percentage < 40) return 'bg-rose-500';
    if (percentage < 75) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="w-full flex items-center gap-3">
      <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`${height || sizes[size]} rounded-full transition-all duration-500 ease-out ${getDynamicColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
          {percentage}%
        </span>
      )}
    </div>
  );
};

export default ProgressBar;
