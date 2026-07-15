import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from './Toast';
import { FaLinkedin, FaInstagram, FaXTwitter } from 'react-icons/fa6';

const Footer = () => {
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleProtectedClick = (e, targetPath, label) => {
    e.preventDefault();
    if (!isAuthenticated) {
      addToast(`Please login to access ${label}.`, 'info');
      navigate('/login');
    } else {
      if (targetPath) {
        navigate(targetPath);
      } else {
        addToast(`${label} settings are managed from your dashboard.`, 'success');
        navigate('/dashboard');
      }
    }
  };

  return (
    <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 pt-12 pb-8 px-6 sm:px-8 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        
        {/* Upper Grid Layout: 4 Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-slate-100 dark:border-slate-800">
          
          {/* Column 1 — Company */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase text-slate-850 dark:text-white tracking-wider">Company</h4>
            <ul className="flex flex-col gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <li><Link to="/about" className="hover:text-brand-600 transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-brand-600 transition-colors">Careers</Link></li>
              <li><Link to="/contact" className="hover:text-brand-600 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 2 — Platform */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase text-slate-850 dark:text-white tracking-wider">Platform</h4>
            <ul className="flex flex-col gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <li><Link to="/jobs" className="hover:text-brand-600 transition-colors">Browse Jobs</Link></li>
              <li><Link to="/jobs" state={{ filterType: 'Internship' }} className="hover:text-brand-600 transition-colors">Browse Internships</Link></li>
              <li><a href="#" onClick={(e) => handleProtectedClick(e, '/resume', 'Resume Builder')} className="hover:text-brand-600 transition-colors">Resume Builder</a></li>
              <li><a href="#" onClick={(e) => handleProtectedClick(e, '/dashboard', 'Dashboard')} className="hover:text-brand-600 transition-colors">Dashboard</a></li>
              <li><a href="#" onClick={(e) => handleProtectedClick(e, null, 'Job Alerts')} className="hover:text-brand-600 transition-colors">Job Alerts</a></li>
            </ul>
          </div>

          {/* Column 3 — Support */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase text-slate-850 dark:text-white tracking-wider">Support</h4>
            <ul className="flex flex-col gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <li><Link to="/privacy-policy" onClick={() => { if (location.pathname === '/privacy-policy') window.scrollTo(0, 0); }} className="hover:text-brand-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-brand-600 transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/help-center" onClick={() => { if (location.pathname === '/help-center') window.scrollTo(0, 0); }} className="hover:text-brand-600 transition-colors">Help Center</Link></li>
              <li><Link to="/report-issue" onClick={() => { if (location.pathname === '/report-issue') window.scrollTo(0, 0); }} className="hover:text-brand-600 transition-colors">Report an Issue</Link></li>
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
            <a href="#" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors" title="LinkedIn"><FaLinkedin className="w-5 h-5" /></a>
            <a href="#" className="hover:text-rose-500 transition-colors" title="Instagram"><FaInstagram className="w-5 h-5" /></a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors" title="X (Twitter)"><FaXTwitter className="w-5 h-5" /></a>
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
