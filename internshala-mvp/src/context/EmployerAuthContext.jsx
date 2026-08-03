import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { employerService } from '../services/mockApi';

const EmployerAuthContext = createContext();

function normalizeEmployer(apiData) {
  if (!apiData) return null;
  const { employer, profile } = apiData;
  return {
    id: employer?.id,
    email: employer?.email,
    recruiterName: employer?.recruiterName,
    companyName: employer?.companyName,
    role: 'employer',
    onboardingCompleted: profile?.onboardingCompleted === true,
    profileData: profile || {},
  };
}

export const EmployerAuthProvider = ({ children }) => {
  const [currentEmployer, setCurrentEmployer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAuthenticated = !!currentEmployer;

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await employerService.logout();
      setCurrentEmployer(null);
    } catch (err) {
      console.error('Employer logout failed', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await employerService.getCurrentEmployer();
        setCurrentEmployer(normalizeEmployer(res.data));
      } catch {
        setCurrentEmployer(null);
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
      const res = await employerService.login(email, password);
      const employer = normalizeEmployer(res.data);
      setCurrentEmployer(employer);
      return employer;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await employerService.register(data);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailOtp = async (email, otp) => {
    setLoading(true);
    setError(null);
    try {
      const res = await employerService.verifyOtp(email, otp);
      const employer = normalizeEmployer(res.data);
      setCurrentEmployer(employer);
      return employer;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEmployerProfile = async (profileData) => {
    try {
      const res = await employerService.updateProfile(profileData);
      const profile = res.data.profile;
      const employer = res.data.employer;
      setCurrentEmployer(prev => {
        if (!prev) return null;
        return {
          ...prev,
          recruiterName: employer?.recruiterName || prev.recruiterName,
          companyName: employer?.companyName || prev.companyName,
          onboardingCompleted: profile.onboardingCompleted === true,
          profileData: profile,
        };
      });
      return { profile };
    } catch (err) {
      console.error('Employer profile update failed', err);
      throw err;
    }
  };

  const forgotPassword = async (email) => {
    setLoading(true);
    try {
      const res = await employerService.forgotPassword(email);
      return res.data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, password) => {
    setLoading(true);
    try {
      const res = await employerService.resetPassword(token, password);
      return res.data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentEmployer,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    verifyEmailOtp,
    updateEmployerProfile,
    forgotPassword,
    resetPassword,
    logout,
  };

  return <EmployerAuthContext.Provider value={value}>{children}</EmployerAuthContext.Provider>;
};

export const useEmployerAuth = () => {
  const context = useContext(EmployerAuthContext);
  if (!context) {
    throw new Error('useEmployerAuth must be used within an EmployerAuthProvider');
  }
  return context;
};
