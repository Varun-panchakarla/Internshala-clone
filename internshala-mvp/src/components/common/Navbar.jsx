import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Logo from './Logo';
import {
  FiUser, FiLogOut, FiMenu, FiX, FiSun, FiMoon, FiSettings,
  FiChevronDown, FiBell,
} from 'react-icons/fi';
import Button from './Button';

const Navbar = () => {
  const { currentUser, logout, isAuthenticated, profileCompletion } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate    = useNavigate();
  const location    = useLocation();
  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navPhotoError, setNavPhotoError]  = useState(false);
  const [scrolled, setScrolled]            = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => { setNavPhotoError(false); }, [currentUser?.profileData?.profilePhoto]);

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); setDropdownOpen(false); }, [location.pathname]);

  // Navbar shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };


  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <header
      className={`w-full bg-white dark:bg-gray-950 border-b sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'border-slate-200 dark:border-slate-800 shadow-[0_2px_20px_-4px_rgba(15,23,42,0.08)]'
          : 'border-slate-100 dark:border-slate-900'
      }`}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <Logo className="h-12 w-auto" mode="auto" />
          </Link>


          {/* ── Right Actions ─────────────────────────────────────────────── */}
          <div className="flex items-center gap-2">

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/8 hover:text-slate-800 dark:hover:text-white transition-all duration-150 focus:outline-none"
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              {isDark
                ? <FiSun className="w-4 h-4 text-amber-400" />
                : <FiMoon className="w-4 h-4" />
              }
            </button>

            {isAuthenticated ? (
              <>
                {/* Notification bell (decorative) */}
                <button className="hidden sm:flex relative items-center justify-center w-8 h-8 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/8 hover:text-slate-800 dark:hover:text-white transition-all duration-150 focus:outline-none">
                  <FiBell className="w-4 h-4" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-brand-500 rounded-full border-2 border-white dark:border-gray-950" />
                </button>

                {/* Profile dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(o => !o)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/8 transition-all duration-150 focus:outline-none"
                  >
                    {/* Avatar */}
                    {currentUser.profileData?.profilePhoto && !navPhotoError ? (
                      <img
                        src={currentUser.profileData.profilePhoto}
                        alt={currentUser.name}
                        onError={() => setNavPhotoError(true)}
                        className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white text-[11px] font-black flex items-center justify-center shadow-sm">
                        {initials}
                      </div>
                    )}
                    <div className="hidden md:block text-left">
                      <p className="text-[12px] font-semibold text-slate-800 dark:text-white leading-none">
                        {currentUser.name.split(' ')[0]}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-none mt-0.5">
                        {profileCompletion}% complete
                      </p>
                    </div>
                    <FiChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-900/10 dark:shadow-black/40 py-2 animate-scale-in z-50">
                      {/* User info header */}
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          {currentUser.profileData?.profilePhoto && !navPhotoError ? (
                            <img src={currentUser.profileData.profilePhoto} alt="" className="w-9 h-9 rounded-xl object-cover" />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white text-sm font-black flex items-center justify-center">
                              {initials}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{currentUser.email}</p>
                          </div>
                        </div>
                        {/* Profile completion bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-[10px] font-semibold text-slate-400 mb-1">
                            <span>Profile strength</span>
                            <span className={profileCompletion === 100 ? 'text-emerald-500' : 'text-brand-600'}>{profileCompletion}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${profileCompletion < 50 ? 'bg-amber-400' : profileCompletion < 80 ? 'bg-brand-500' : 'bg-emerald-500'}`}
                              style={{ width: `${profileCompletion}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="py-1">
                        <Link to="/profile" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 font-medium transition-colors">
                          <FiUser className="w-4 h-4 text-slate-400" /> My Profile
                        </Link>
                        <Link to="/manage-account" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 font-medium transition-colors">
                          <FiSettings className="w-4 h-4 text-slate-400" /> Account Settings
                        </Link>
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/15 font-medium transition-colors">
                          <FiLogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/login')}>Log In</Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/register')}>Get Started</Button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(o => !o)}
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/8 transition-all focus:outline-none"
            >
              {mobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Drawer ──────────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-gray-950 px-4 py-4 space-y-1 animate-slide-down shadow-lg">

          {/* Mobile theme toggle */}
          <div className="flex items-center justify-between px-3 py-2.5 border-t border-slate-100 dark:border-slate-800 mt-2 pt-3">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Theme</span>
            <button onClick={toggleTheme}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/8 px-3 py-1.5 rounded-lg">
              {isDark ? <><FiSun className="w-3.5 h-3.5 text-amber-400" /> Light</> : <><FiMoon className="w-3.5 h-3.5" /> Dark</>}
            </button>
          </div>

          {/* Mobile auth actions */}
          {isAuthenticated ? (
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-2 flex flex-col gap-1">
              <Link to="/profile"
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl">
                <FiUser className="w-4 h-4 text-slate-400" /> My Profile
              </Link>
              <Link to="/manage-account"
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl">
                <FiSettings className="w-4 h-4 text-slate-400" /> Account Settings
              </Link>
              <button onClick={handleLogout}
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/15 rounded-xl">
                <FiLogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          ) : (
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-2 flex flex-col gap-2">
              <Button variant="outline" onClick={() => navigate('/login')}>Log In</Button>
              <Button variant="primary" onClick={() => navigate('/register')}>Get Started Free</Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
