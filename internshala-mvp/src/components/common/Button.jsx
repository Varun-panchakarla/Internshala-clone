import React from 'react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  className = '',
  icon: Icon
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const variants = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm focus:ring-brand-500 hover:shadow',
    secondary: 'bg-slate-800 hover:bg-slate-950 text-white focus:ring-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600',
    outline: 'border border-slate-200 hover:border-brand-500 bg-white text-slate-700 hover:text-brand-600 focus:ring-brand-500 shadow-sm dark:border-slate-600 dark:bg-transparent dark:text-slate-300 dark:hover:border-brand-400 dark:hover:text-brand-400',
    light: 'bg-brand-50 hover:bg-brand-100 text-brand-700 focus:ring-brand-500 dark:bg-brand-900/30 dark:hover:bg-brand-900/50 dark:text-brand-400',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </>
      ) : (
        <>
          {Icon && <Icon className={`shrink-0 ${children ? 'mr-2' : ''} w-4 h-4`} />}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
