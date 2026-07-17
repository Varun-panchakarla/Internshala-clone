import React from 'react';

const Button = ({
  children,
  type     = 'button',
  variant  = 'primary',
  size     = 'md',
  onClick,
  disabled = false,
  loading  = false,
  className= '',
  icon: Icon,
}) => {
  const base = [
    'inline-flex items-center justify-center font-semibold rounded-xl',
    'transition-all duration-200 focus:outline-none',
    'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500',
    'disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
    'active:scale-[0.97]',
  ].join(' ');

  const variants = {
    primary:
      'bg-brand-600 text-white hover:bg-brand-700 shadow-sm shadow-brand-500/20 hover:shadow-md hover:shadow-brand-500/25 focus-visible:ring-brand-500',
    secondary:
      'bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600 shadow-sm focus-visible:ring-slate-700',
    outline:
      'border border-slate-200 dark:border-slate-700 bg-white dark:bg-transparent text-slate-700 dark:text-slate-300 hover:border-brand-400 dark:hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-900/10 shadow-sm focus-visible:ring-brand-500',
    light:
      'bg-brand-50 dark:bg-brand-900/25 text-brand-700 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/40 focus-visible:ring-brand-400',
    ghost:
      'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/8 hover:text-slate-900 dark:hover:text-white focus-visible:ring-slate-400',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-500/20 hover:shadow-md hover:shadow-rose-500/25 focus-visible:ring-rose-500',
    success:
      'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-500/20 focus-visible:ring-emerald-500',
  };

  const sizes = {
    xs: 'px-2.5 py-1.5 text-[11px] gap-1',
    sm: 'px-3.5 py-2 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5',
    xl: 'px-8 py-4 text-lg gap-3',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin shrink-0 w-4 h-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading…</span>
        </>
      ) : (
        <>
          {Icon && <Icon className={`shrink-0 w-4 h-4 ${children ? '' : ''}`} />}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
