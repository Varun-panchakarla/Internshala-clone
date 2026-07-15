import React from 'react';
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
