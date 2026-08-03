import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSidebar } from '../../context/SidebarContext';
import Logo from './Logo';
import {
  FiUser, FiLogOut, FiMenu, FiX, FiSun, FiMoon, FiSettings,
  FiChevronDown, FiBell, FiFileText, FiLayout, FiZap, FiCheckCircle,
} from 'react-icons/fi';
import Button from './Button';
import { notificationService } from '../../services/mockApi';

const formatNotifTime = (iso) => {
  if (!iso) return '';
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffMins = Math.floor((now - date) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    if (diffMins < 2880) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
};

const Navbar = () => {
  const { currentUser, logout, isAuthenticated, profileCompletion } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { collapsed, toggleSidebar } = useSidebar();
  const navigate    = useNavigate();
  const location    = useLocation();
  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navPhotoError, setNavPhotoError]  = useState(false);
  const [scrolled, setScrolled]            = useState(false);
  const [notifOpen, setNotifOpen]          = useState(false);
  const [notifications, setNotifications]  = useState([]);
  const [notifUnread, setNotifUnread]      = useState(0);
  const dropdownRef = useRef(null);
  const notifRef    = useRef(null);
  const notifJsonRef = useRef('');

  useEffect(() => { setNavPhotoError(false); }, [currentUser?.profileData?.profilePhoto]);

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); setDropdownOpen(false); setNotifOpen(false); }, [location.pathname]);

  // Navbar shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isCandidate = isAuthenticated && !['admin', 'super_admin'].includes(currentUser?.role);

  // Fetch notifications without re-rendering when nothing changed
  const fetchNotifications = async (silent = false) => {
    try {
      const res = await notificationService.getNotifications();
      const list = res.data.notifications || [];
      const unread = res.data.unread || 0;
      const json = JSON.stringify(list);
      if (json === notifJsonRef.current && !silent) return;
      notifJsonRef.current = json;
      setNotifications(list);
      setNotifUnread(unread);
    } catch {
      /* ignore */
    }
  };

  // Initial fetch + light polling + refresh on tab focus
  useEffect(() => {
    if (!isCandidate) return;
    fetchNotifications();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') fetchNotifications();
    }, 20000);
    const onFocus = () => fetchNotifications();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCandidate]);

  const handleOpenNotifs = () => {
    const next = !notifOpen;
    setNotifOpen(next);
    if (next && notifUnread > 0) {
      setNotifUnread(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      notificationService.markAllRead().catch(() => {});
    }
    fetchNotifications(true);
  };

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
            <Logo className="h-10 w-auto" mode="auto" />
          </Link>


          {/* ── Right Actions ─────────────────────────────────────────────── */}
          <div className="flex items-center gap-2">

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/8 hover:text-slate-800 dark:hover:text-white transition-all duration-200 active:scale-90 focus:outline-none cursor-pointer"
              title={isDark ? 'Light Mode' : 'Dark Mode'}
            >
              <div className={`transition-transform duration-300 ease-in-out ${isDark ? 'rotate-90' : 'rotate-0'}`}>
                {isDark
                  ? <FiSun className="w-4 h-4 text-amber-400" />
                  : <FiMoon className="w-4 h-4" />
                }
              </div>
            </button>

            {isAuthenticated ? (
              <>
                {/* Admin Portal Header Link */}
                {['admin', 'super_admin'].includes(currentUser?.role) && (
                  <Link to="/admin" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-700 dark:text-brand-400 font-bold text-xs transition-all shadow-sm">
                    <FiZap className="w-3.5 h-3.5 text-brand-500" /> Admin Portal
                  </Link>
                )}

                {/* Notification bell */}
                {isCandidate && (
                  <div className="relative" ref={notifRef}>
                    <button
                      onClick={handleOpenNotifs}
                      className="hidden sm:flex relative items-center justify-center w-8 h-8 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/8 hover:text-slate-800 dark:hover:text-white transition-all duration-150 focus:outline-none cursor-pointer"
                      title="Notifications"
                    >
                      <FiBell className="w-4 h-4" />
                      {notifUnread > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-gray-950 leading-none">
                          {notifUnread > 9 ? '9+' : notifUnread}
                        </span>
                      )}
                    </button>

                    {notifOpen && (
                      <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-900/10 dark:shadow-black/40 py-2 animate-scale-in z-50">
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <span className="text-sm font-extrabold text-slate-800 dark:text-white">Notifications</span>
                          <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            {notifications.length} total
                          </span>
                        </div>
                        <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/60">
                          {notifications.length === 0 ? (
                            <div className="text-center py-10 px-6">
                              <FiCheckCircle className="w-7 h-7 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                              <p className="text-xs font-bold text-slate-400">No notifications yet</p>
                              <p className="text-[10px] text-slate-400 font-medium mt-1">
                                Interview and application updates will show up here.
                              </p>
                            </div>
                          ) : (
                            notifications.map(n => (
                              <button
                                key={n.id}
                                onClick={() => {
                                  setNotifOpen(false);
                                  navigate('/applied');
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer border-none"
                              >
                                <div className="flex items-start gap-2.5">
                                  <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${n.read ? 'bg-transparent' : 'bg-brand-500'}`} />
                                  <div className="min-w-0">
                                    <p className="text-xs font-extrabold text-slate-800 dark:text-white">{n.title}</p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-snug">{n.message}</p>
                                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-1 block">
                                      {formatNotifTime(n.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                        <Link to="/applied" onClick={() => setNotifOpen(false)}
                          className="block text-center text-xs font-bold text-brand-600 dark:text-brand-400 py-2.5 border-t border-slate-100 dark:border-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950/10 transition-colors">
                          View all updates
                        </Link>
                      </div>
                    )}
                  </div>
                )}

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
                        <Link to="/resume" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 font-medium transition-colors">
                          <FiFileText className="w-4 h-4 text-slate-400" /> Resume Builder
                        </Link>
                        <Link to="/resume-templates" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 font-medium transition-colors">
                          <FiLayout className="w-4 h-4 text-slate-400" /> Templates
                        </Link>
                        <Link to="/profile" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 font-medium transition-colors">
                          <FiUser className="w-4 h-4 text-slate-400" /> My Profile
                        </Link>
                        <Link to="/manage-account" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 font-medium transition-colors">
                          <FiSettings className="w-4 h-4 text-slate-400" /> Account Settings
                        </Link>
                        {['admin', 'super_admin'].includes(currentUser?.role) && (
                          <Link to="/admin" onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-brand-650 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/20 font-bold transition-colors">
                            <FiZap className="w-4 h-4 text-brand-500" /> Admin Portal
                          </Link>
                        )}
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
              <Link to="/resume"
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl">
                <FiFileText className="w-4 h-4 text-slate-400" /> Resume Builder
              </Link>
              <Link to="/resume-templates"
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl">
                <FiLayout className="w-4 h-4 text-slate-400" /> Templates
              </Link>
              <Link to="/profile"
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl">
                <FiUser className="w-4 h-4 text-slate-400" /> My Profile
              </Link>
              <Link to="/manage-account"
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl">
                <FiSettings className="w-4 h-4 text-slate-400" /> Account Settings
              </Link>
              {['admin', 'super_admin'].includes(currentUser?.role) && (
                <Link to="/admin"
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-bold text-brand-650 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/20 rounded-xl">
                  <FiZap className="w-4 h-4 text-brand-500" /> Admin Portal
                </Link>
              )}
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
