import React from 'react';
import { FiGithub, FiLinkedin, FiInstagram, FiTwitter, FiYoutube } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 pt-12 pb-8 px-6 sm:px-8 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        
        {/* Upper Grid Layout: 4 Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-slate-100 dark:border-slate-800">
          
          {/* Column 1 — Company */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase text-slate-850 dark:text-white tracking-wider">Company</h4>
            <ul className="flex flex-col gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <li><a href="#" className="hover:text-brand-600 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">Hire Talent</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">Post a Job</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Column 2 — Platform */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase text-slate-850 dark:text-white tracking-wider">Platform</h4>
            <ul className="flex flex-col gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <li><a href="#" className="hover:text-brand-600 transition-colors">Browse Jobs</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">Browse Internships</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">Resume Builder</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">Dashboard</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">Job Alerts</a></li>
            </ul>
          </div>

          {/* Column 3 — Support */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase text-slate-850 dark:text-white tracking-wider">Support</h4>
            <ul className="flex flex-col gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <li><a href="#" className="hover:text-brand-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">Report an Issue</a></li>
            </ul>
          </div>

          {/* Column 4 — Resources */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase text-slate-850 dark:text-white tracking-wider">Resources</h4>
            <ul className="flex flex-col gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <li><a href="#" className="hover:text-brand-600 transition-colors">Companies</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">Career Tips</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">Resume Guide</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">AI Career Assistant</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">Blog</a></li>
            </ul>
          </div>

        </div>

        {/* Lower Row Layout: Socials, Connect, Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-2">
          
          {/* Left: Social media icons */}
          <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500">
            <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors" title="GitHub"><FiGithub className="w-5 h-5" /></a>
            <a href="#" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors" title="LinkedIn"><FiLinkedin className="w-5 h-5" /></a>
            <a href="#" className="hover:text-rose-500 transition-colors" title="Instagram"><FiInstagram className="w-5 h-5" /></a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors" title="X (Twitter)"><FiTwitter className="w-5 h-5" /></a>
            <a href="#" className="hover:text-red-600 transition-colors" title="YouTube"><FiYoutube className="w-5 h-5" /></a>
          </div>

          {/* Center: Stay Connected Links */}
          <div className="flex flex-col items-center gap-1.5 text-center">
            <h4 className="text-[10px] font-black uppercase text-slate-450 dark:text-slate-500 tracking-widest">Stay Connected</h4>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold">
              <a href="#" className="hover:text-brand-600 transition-colors">LinkedIn</a>
              <span className="text-slate-200 dark:text-slate-800 font-light">•</span>
              <a href="#" className="hover:text-indigo-500 transition-colors">Discord</a>
              <span className="text-slate-200 dark:text-slate-800 font-light">•</span>
              <a href="#" className="hover:text-emerald-500 transition-colors">Email Newsletter</a>
            </div>
          </div>

          {/* Right: Copyrights Statement */}
          <div className="text-center md:text-right text-xs text-slate-400 dark:text-slate-500 flex flex-col gap-1 font-medium">
            <span>&copy; {new Date().getFullYear()} IncuXAI Careers</span>
            <span className="text-[10px] font-semibold text-slate-300 dark:text-slate-700">Powered by IncuXAI</span>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;
