import React from 'react';

export const statusStyles = {
  Pending: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  Applied: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  Shortlisted: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40',
  Interview: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-brand-950/30 dark:text-brand-400 dark:border-brand-900/40',
  Offer: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-900/40',
  Selected: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-900/40',
  Rejected: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40',
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40',
  Closed: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  Expired: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40',
  Scheduled: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-brand-950/30 dark:text-brand-400 dark:border-brand-900/40',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40',
  Cancelled: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40'
};

export function StatusPill({ status, className = '' }) {
  const cls = statusStyles[status] || statusStyles.Pending;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border whitespace-nowrap ${cls} ${className}`}>
      {status || 'Pending'}
    </span>
  );
}

export function Avatar({ name, size = 'md' }) {
  const initials = String(name || '?')
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
  return (
    <div className={`${sizes[size]} rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center font-bold shrink-0`}>
      {initials}
    </div>
  );
}

export function Card({ children, className = '', padded = true }) {
  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm ${padded ? 'p-5' : ''} ${className}`}>
      {children}
    </div>
  );
}

export function SectionHeader({ icon: Icon, title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 flex items-center justify-center">
          {Icon && <Icon className="w-4.5 h-4.5" />}
        </div>
        <div>
          <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 leading-tight">{title}</h2>
          {subtitle && <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="sm:ml-auto flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
      {Icon && <Icon className="w-8 h-8 mx-auto mb-2 opacity-40" />}
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{title}</p>
      {subtitle && <p className="text-[11px] text-slate-400 mt-1">{subtitle}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
        fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-800 dark:text-slate-100 font-medium"
      />
    </div>
  );
}

export function IconBtn({ children, onClick, title, className = '', danger = false, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${danger ? 'hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

export function KpiCard({ label, value, trend, icon: Icon, accent = 'sky' }) {
  const accents = {
    sky: 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/30 border-brand-100 dark:border-brand-900/40',
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40',
    indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/40',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/40'
  };
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
      <div className="text-left min-w-0">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-slate-800 dark:text-white mt-1 leading-none">{value}</p>
        {trend && <p className="text-[10px] font-semibold text-slate-400 mt-1.5 truncate">{trend}</p>}
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${accents[accent] || accents.sky}`}>
        {Icon && <Icon className="w-5 h-5" />}
      </div>
    </div>
  );
}

export function FilterSelect({ value, onChange, options, className = '' }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer font-semibold ${className}`}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

export function Modal({ isOpen, onClose, title, children, wide = false }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onMouseDown={onClose}>
      <div
        className={`w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-up border border-slate-200 dark:border-slate-800`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children, required = false }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export const inputCls =
  'w-full px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium';

export const textareaCls =
  'w-full px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium resize-none';

export function timeAgo(iso) {
  if (!iso) return '';
  const diffMs = new Date() - new Date(iso);
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

export function formatDateTime(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString([], {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return '';
  }
}

export function formatDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}

export function toDatetimeLocal(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
}
