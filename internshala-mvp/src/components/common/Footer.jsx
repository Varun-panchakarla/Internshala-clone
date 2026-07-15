import React from 'react';
<<<<<<< HEAD
import { Link } from 'react-router-dom';
import {
  FiGithub, FiLinkedin, FiInstagram, FiTwitter,
  FiMail, FiBriefcase, FiArrowUpRight,
} from 'react-icons/fi';

const footerLinks = {
  Product: [
    { label: 'Browse Jobs',         href: '/jobs' },
    { label: 'Resume Builder',      href: '/resume' },
    { label: 'Resume Templates',    href: '/resume-templates' },
    { label: 'Dashboard',           href: '/dashboard' },
    { label: 'Saved Jobs',          href: '/saved-jobs' },
  ],
  Company: [
    { label: 'About Us',    href: '#' },
    { label: 'Careers',     href: '#' },
    { label: 'Hire Talent', href: '#' },
    { label: 'Post a Job',  href: '#' },
    { label: 'Contact',     href: '#' },
  ],
  Resources: [
    { label: 'Career Tips',       href: '#' },
    { label: 'Resume Guide',      href: '#' },
    { label: 'AI Career Coach',   href: '#' },
    { label: 'Interview Prep',    href: '#' },
    { label: 'Blog',              href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy',    href: '#' },
    { label: 'Terms of Service',  href: '#' },
    { label: 'Cookie Policy',     href: '#' },
    { label: 'Help Center',       href: '#' },
    { label: 'Report an Issue',   href: '#' },
  ],
=======
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
              <li><a href="#" className="hover:text-brand-600 transition-colors">Careers</a></li>
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
>>>>>>> main
};

const socialLinks = [
  { icon: FiGithub,   href: '#', label: 'GitHub',   hover: 'hover:text-slate-900 dark:hover:text-white' },
  { icon: FiLinkedin, href: '#', label: 'LinkedIn',  hover: 'hover:text-brand-600 dark:hover:text-brand-400' },
  { icon: FiInstagram,href: '#', label: 'Instagram', hover: 'hover:text-pink-600 dark:hover:text-pink-400' },
  { icon: FiTwitter,  href: '#', label: 'Twitter',   hover: 'hover:text-sky-500' },
  { icon: FiMail,     href: '#', label: 'Email',     hover: 'hover:text-emerald-500' },
];

const Footer = () => (
  <footer className="bg-white dark:bg-gray-950 border-t border-slate-100 dark:border-slate-800/60 mt-auto">
    {/* Top decorative gradient strip */}
    <div className="h-0.5 bg-gradient-to-r from-brand-500 via-violet-500 to-indigo-500" />

    <div className="max-w-screen-xl mx-auto px-6 sm:px-8 py-12">

      {/* Main grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">

        {/* Brand column */}
        <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md shadow-brand-500/25">
              <span className="text-white font-black text-sm">i</span>
            </div>
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white text-[14px] tracking-tight leading-none">
                IncuXAI<span className="text-brand-600">.</span>
              </span>
              <div className="text-[9px] font-semibold text-slate-400 tracking-widest uppercase">Careers</div>
            </div>
          </Link>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed">
            AI-powered job matching and professional resume building — designed for the next generation of talent.
          </p>
          {/* Social icons */}
          <div className="flex items-center gap-3 mt-1">
            {socialLinks.map(({ icon: Icon, href, label, hover }) => (
              <a key={label} href={href} title={label}
                className={`w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/8 flex items-center justify-center text-slate-400 dark:text-slate-500 ${hover} transition-all duration-150 hover:scale-110`}>
                <Icon className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([heading, links]) => (
          <div key={heading} className="flex flex-col gap-3">
            <h4 className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.1em]">
              {heading}
            </h4>
            <ul className="flex flex-col gap-2">
              {links.map(({ label, href }) => (
                <li key={label}>
                  {href.startsWith('/') ? (
                    <Link to={href}
                      className="text-[12px] text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors duration-150">
                      {label}
                    </Link>
                  ) : (
                    <a href={href}
                      className="text-[12px] text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors duration-150 inline-flex items-center gap-1 group">
                      {label}
                      <FiArrowUpRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 dark:border-slate-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
          <FiBriefcase className="w-3.5 h-3.5" />
          <span>© {new Date().getFullYear()} IncuXAI Careers. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-400 dark:text-slate-500">
          <a href="#" className="hover:text-brand-600 transition-colors font-medium">Privacy</a>
          <span className="text-slate-200 dark:text-slate-700">·</span>
          <a href="#" className="hover:text-brand-600 transition-colors font-medium">Terms</a>
          <span className="text-slate-200 dark:text-slate-700">·</span>
          <a href="#" className="hover:text-brand-600 transition-colors font-medium">Cookies</a>
          <span className="text-slate-200 dark:text-slate-700">·</span>
          <span className="text-slate-300 dark:text-slate-600">Powered by IncuXAI</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
