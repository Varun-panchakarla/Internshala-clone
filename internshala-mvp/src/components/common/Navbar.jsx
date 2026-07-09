import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../context/JobContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  FiBriefcase, 
  FiUser, 
  FiHeart, 
  FiFileText, 
  FiLogOut, 
  FiMenu, 
  FiX, 
  FiGrid, 
  FiSun, 
  FiMoon 
} from 'react-icons/fi';
import Button from './Button';

const Navbar = () => {
  const { currentUser, logout, isAuthenticated, profileCompletion } = useAuth();
  const { savedJobs } = useJobs();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: FiGrid, authRequired: true },
    { to: '/jobs', label: 'Browse Jobs', icon: FiBriefcase, authRequired: false },
    { to: '/saved-jobs', label: 'Saved Jobs', icon: FiHeart, authRequired: true, badge: savedJobs?.length },
    { to: '/resume', label: 'Resume Builder', icon: FiFileText, authRequired: true },
  ];

  return (
    <nav className="w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-40 transition-colors duration-250">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-brand-500/20 group-hover:scale-105 transition-transform">
                i
              </div>
              <span className="text-xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                Internshala<span className="text-brand-600 font-black">.</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              if (link.authRequired && !isAuthenticated) return null;
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {link.badge > 0 && (
                    <span className="ml-1 bg-rose-500 text-white font-bold text-[10px] px-1.5 py-0.5 rounded-full shrink-0">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Auth Trigger Buttons & Theme Selector */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Desktop Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-850 dark:hover:text-white transition-all focus:outline-none cursor-pointer"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <FiSun className="w-4 h-4 text-amber-500" /> : <FiMoon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none cursor-pointer"
                >
                  {currentUser.profileData?.profilePhoto ? (
                    <img
                      src={currentUser.profileData.profilePhoto}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-400 flex items-center justify-center font-bold text-sm">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 max-w-[100px] truncate">
                    {currentUser.name.split(' ')[0]}
                  </span>
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl py-2 z-20 animate-fade-in">
                      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{currentUser.name}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 truncate mb-2">{currentUser.email}</p>
                        
                        {/* Profile Completion micro progress */}
                        <div className="mt-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                            <span>Profile Score</span>
                            <span className={profileCompletion === 100 ? 'text-emerald-500' : 'text-brand-600'}>
                              {profileCompletion}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                profileCompletion < 50 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${profileCompletion}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
                      >
                        <FiUser className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        My Profile
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium border-t border-slate-100 dark:border-slate-800"
                      >
                        <FiLogOut className="w-4 h-4 text-rose-400" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                  Register
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none"
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-3 animate-fade-in shadow-lg">
          <div className="space-y-1">
            {navLinks.map((link) => {
              if (link.authRequired && !isAuthenticated) return null;
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-450'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge > 0 && (
                    <span className="bg-rose-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Theme Switcher Row (Mobile) */}
          <div className="flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
            <span>Theme</span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-xs"
            >
              {isDark ? (
                <>
                  <FiSun className="w-4 h-4 text-amber-500" /> Light Mode
                </>
              ) : (
                <>
                  <FiMoon className="w-4 h-4" /> Dark Mode
                </>
              )}
            </button>
          </div>

          {isAuthenticated ? (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
              >
                <FiUser className="w-4 h-4 text-slate-400" />
                <span>My Profile ({profileCompletion}% complete)</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl"
              >
                <FiLogOut className="w-4 h-4 text-rose-400" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              <Button variant="outline" onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}>
                Login
              </Button>
              <Button variant="primary" onClick={() => { setMobileMenuOpen(false); navigate('/register'); }}>
                Register
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
