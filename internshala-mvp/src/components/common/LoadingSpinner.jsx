import React from 'react';

const LoadingSpinner = ({ fullPage = false, size = 'md', text = 'Loading...' }) => {
  const spinnerSizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  const containerStyle = fullPage 
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/75 dark:bg-gray-900/80 backdrop-blur-xs'
    : 'flex flex-col items-center justify-center p-8';

  return (
    <div className={containerStyle}>
      <div className="relative">
        {/* Outer ring */}
        <div className={`rounded-full border-slate-200 dark:border-slate-600 ${spinnerSizes[size]}`}></div>
        {/* Spinning indicator */}
        <div className={`absolute top-0 left-0 rounded-full border-brand-600 border-t-transparent animate-spin ${spinnerSizes[size]}`}></div>
      </div>
      {text && (
        <p className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase animate-pulse-slow">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
