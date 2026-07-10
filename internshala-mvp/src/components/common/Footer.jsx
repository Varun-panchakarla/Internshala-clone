import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-6 px-8 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-550">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="text-brand-600 font-bold text-sm tracking-tight">IncuXAI Careers</span>
          <span className="text-slate-300 dark:text-slate-700 font-light">|</span>
          <span className="text-slate-400 dark:text-slate-500">Job & Internship Portal MVP</span>
        </div>
        <p className="text-center md:text-right text-slate-400 dark:text-slate-500">
          &copy; {new Date().getFullYear()} IncuXAI Careers. Developed as a high-fidelity frontend prototype.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
