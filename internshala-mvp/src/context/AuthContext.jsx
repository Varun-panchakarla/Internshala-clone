import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { authService } from '../services/mockApi';
import { calculateProfileCompletion } from '../utils/atsScorer';

const AuthContext = createContext();

const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes

function normalizeUser(apiData) {
  if (!apiData) return null;
  const { user, profile } = apiData;
  return {
    id: user?.id,
    email: user?.email,
    name: user?.name,
    role: user?.role || 'candidate',
    profileCompleted: !!(profile && (profile.fullName || profile.skills?.length > 0)),
    profileData: profile || {},
  };
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const idleTimer = useRef(null);

  const isAuthenticated = !!currentUser;

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.logout();
      setCurrentUser(null);
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Idle timeout ────────────────────────────────────────────────────────────
  const resetIdleTimer = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (!isAuthenticated) return;
    idleTimer.current = setTimeout(() => {
      logout();
    }, IDLE_TIMEOUT);
  }, [isAuthenticated, logout]);

  useEffect(() => {
    if (!isAuthenticated) {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      return;
    }

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const onActivity = () => resetIdleTimer();
    events.forEach(e => window.addEventListener(e, onActivity, { passive: true }));

    resetIdleTimer();

    return () => {
      events.forEach(e => window.removeEventListener(e, onActivity));
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [isAuthenticated, resetIdleTimer]);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await authService.getCurrentUser();
        setCurrentUser(normalizeUser(res.data));
      } catch {
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.login(email, password);
      const user = normalizeUser(res.data);
      setCurrentUser(user);
      return user;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (credential) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.googleAuth(credential);
      const user = normalizeUser(res.data);
      setCurrentUser(user);
      return user;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.register(name, email, password);
      const user = normalizeUser(res.data);
      setCurrentUser(user);
      return user;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await authService.updateProfile(profileData);
      const profile = res.data.profile;
      setCurrentUser(prev => ({
        ...prev,
        profileCompleted: true,
        profileData: profile,
      }));
      return { profile };
    } catch (err) {
      console.error('Profile update failed', err);
      throw err;
    }
  };

  const profileCompletion = currentUser?.profileData
    ? calculateProfileCompletion(currentUser.profileData)
    : 0;

  const value = {
    currentUser,
    loading,
    error,
    isAuthenticated,
    profileCompletion,
    login,
    register,
    googleLogin,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
