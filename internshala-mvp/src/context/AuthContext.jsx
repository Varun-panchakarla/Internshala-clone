import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/mockApi';
import { calculateProfileCompletion } from '../utils/atsScorer';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await authService.getCurrentUser();
        setCurrentUser(res.data);
      } catch (err) {
        console.error('Failed to load user session', err);
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
      setCurrentUser(res.data);
      return res.data;
    } catch (err) {
      setError(err.message);
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
      setCurrentUser(res.data);
      return res.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setCurrentUser(null);
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    try {
      const res = await authService.updateProfile(profileData);
      setCurrentUser(res.data);
      return res.data;
    } catch (err) {
      console.error('Profile update failed', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Derive profile completion
  const profileCompletion = currentUser?.profileCompleted 
    ? calculateProfileCompletion(currentUser.profileData) 
    : 0;

  const value = {
    currentUser,
    loading,
    error,
    isAuthenticated: !!currentUser,
    profileCompletion,
    login,
    register,
    logout,
    updateProfile
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
