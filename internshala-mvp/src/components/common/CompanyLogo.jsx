import { useState } from 'react';

const COLOR_MAP = {
  'bg-red-500': '#ef4444',
  'bg-indigo-600': '#4f46e5',
  'bg-purple-500': '#a855f7',
  'bg-rose-500': '#f43f5e',
  'bg-amber-500': '#f59e0b',
  'bg-emerald-500': '#10b981',
  'bg-blue-600': '#2563eb',
  'bg-orange-500': '#f97316',
  'bg-teal-500': '#14b8a6',
  'bg-cyan-500': '#06b6d4',
  'bg-pink-500': '#ec4899',
  'bg-lime-600': '#65a30d',
  'bg-slate-800': '#1e293b',
};

const SIZES = {
  xs: 'w-8 h-8 text-xs rounded-lg',
  sm: 'w-10 h-10 text-sm rounded-xl',
  md: 'w-12 h-12 text-xl rounded-xl',
  lg: 'w-16 h-16 text-2xl rounded-2xl',
};

export default function CompanyLogo({ logo, name, color, size = 'sm', className = '' }) {
  const [imgError, setImgError] = useState(false);

  const showImage = logo && !imgError;
  const initial = (name || '?').charAt(0).toUpperCase();
  const bgColor = COLOR_MAP[color] || color || '#1e293b';
  const sizeClass = SIZES[size] || SIZES.sm;

  if (showImage) {
    return (
      <img
        src={logo}
        alt={`${name} logo`}
        onError={() => setImgError(true)}
        className={`${sizeClass} object-contain bg-white border border-slate-100 shadow-sm shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex items-center justify-center font-extrabold text-white shadow-sm shrink-0 ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {initial}
    </div>
  );
}
