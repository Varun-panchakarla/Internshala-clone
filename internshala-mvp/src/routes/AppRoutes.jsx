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
import ResumeTemplates from '../pages/ResumeTemplates';
import Profile from '../pages/Profile';
import LandingPage from '../pages/LandingPage';
import ForgotPassword from '../pages/ForgotPassword';
import ManageAccount from '../pages/ManageAccount';
import TermsPage from '../pages/TermsPage';
import HelpCentre from '../pages/HelpCentre';
import ReportIssue from '../pages/ReportIssue';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import AboutUs from '../pages/AboutUs';
import ContactUs from '../pages/ContactUs';
import Careers from '../pages/Careers';
import MainLayout from '../layouts/MainLayout';
import Onboarding from '../pages/Onboarding';
import OnboardingStep2 from '../pages/OnboardingStep2';
import OnboardingStep3 from '../pages/OnboardingStep3';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowOnboardingIncomplete = false, hideSidebar = false }) => {
  const { isAuthenticated, loading, currentUser } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage text="Securing session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const onboardingCompleted = localStorage.getItem(`onboarding_completed_${currentUser?.id}`) === 'true';

  if (!onboardingCompleted && !allowOnboardingIncomplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return <MainLayout hideSidebar={hideSidebar}>{children}</MainLayout>;
};

// Public Route (with layout option)
const PublicRoute = ({ children, useLayout = true, hideSidebar = false }) => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage text="Loading portal..." />;
  }

  return useLayout ? <MainLayout hideSidebar={hideSidebar}>{children}</MainLayout> : children;
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
      <Route
        path="/forgot-password"
        element={
          <PublicRoute useLayout={false}>
            <ForgotPassword />
          </PublicRoute>
        }
      />
      <Route
        path="/terms"
        element={
          <PublicRoute useLayout={true} hideSidebar={true}>
            <TermsPage />
          </PublicRoute>
        }
      />
      <Route
        path="/help-center"
        element={
          <PublicRoute useLayout={true} hideSidebar={true}>
            <HelpCentre />
          </PublicRoute>
        }
      />
      <Route
        path="/report-issue"
        element={
          <PublicRoute useLayout={true} hideSidebar={true}>
            <ReportIssue />
          </PublicRoute>
        }
      />
      <Route
        path="/privacy-policy"
        element={
          <PublicRoute useLayout={true} hideSidebar={true}>
            <PrivacyPolicy />
          </PublicRoute>
        }
      />
      <Route
        path="/about"
        element={
          <PublicRoute useLayout={true} hideSidebar={true}>
            <AboutUs />
          </PublicRoute>
        }
      />
      <Route
        path="/contact"
        element={
          <PublicRoute useLayout={true} hideSidebar={true}>
            <ContactUs />
          </PublicRoute>
        }
      />
      <Route
        path="/careers"
        element={
          <PublicRoute useLayout={true} hideSidebar={true}>
            <Careers />
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

      {/* Onboarding Pages */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute allowOnboardingIncomplete={true} hideSidebar={true}>
            <Onboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding/step2"
        element={
          <ProtectedRoute allowOnboardingIncomplete={true} hideSidebar={true}>
            <OnboardingStep2 />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding/step3"
        element={
          <ProtectedRoute allowOnboardingIncomplete={true} hideSidebar={true}>
            <OnboardingStep3 />
          </ProtectedRoute>
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
        path="/resume-templates"
        element={
          <ProtectedRoute>
            <ResumeTemplates />
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
      <Route
        path="/manage-account"
        element={
          <ProtectedRoute>
            <ManageAccount />
          </ProtectedRoute>
        }
      />

      {/* Fallback Catch All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;