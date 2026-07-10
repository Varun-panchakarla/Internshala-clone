import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Pages lazy-like imports (or direct imports)
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import JobsPage from '../pages/JobsPage';
import JobDetails from '../pages/JobDetails';
import SavedJobs from '../pages/SavedJobs';
import ResumeBuilder from '../pages/ResumeBuilder';
import Profile from '../pages/Profile';
import LandingPage from '../pages/LandingPage';
import MainLayout from '../layouts/MainLayout';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage text="Securing session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
};

// Public Route (with layout option)
const PublicRoute = ({ children, useLayout = true }) => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage text="Loading portal..." />;
  }

  return useLayout ? <MainLayout>{children}</MainLayout> : children;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Root Path - Custom Professional Landing Page */}
      <Route
        path="/"
        element={
          <PublicRoute useLayout={false}>
            <LandingPage />
          </PublicRoute>
        }
      />

      {/* Auth Pages */}
      <Route
        path="/login"
        element={
          <PublicRoute useLayout={false}>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute useLayout={false}>
            <Register />
          </PublicRoute>
        }
      />

      {/* Publicly Browseable Job Pages */}
      <Route
        path="/jobs"
        element={
          <PublicRoute useLayout={true}>
            <JobsPage />
          </PublicRoute>
        }
      />
      <Route
        path="/jobs/:id"
        element={
          <PublicRoute useLayout={true}>
            <JobDetails />
          </PublicRoute>
        }
      />

      {/* Authenticated Pages */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/saved-jobs"
        element={
          <ProtectedRoute>
            <SavedJobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resume"
        element={
          <ProtectedRoute>
            <ResumeBuilder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Fallback Catch All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
