import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-slate-100 py-6 px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="text-brand-600 font-bold text-sm tracking-tight">Internshala</span>
          <span className="text-slate-300 font-light">|</span>
          <span>Job & Internship Portal MVP</span>
        </div>
        <p className="text-center md:text-right">
          &copy; {new Date().getFullYear()} Internshala. Developed as a high-fidelity frontend prototype.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
