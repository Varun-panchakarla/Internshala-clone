import React from 'react';
import { HashRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastProvider } from './components/common/Toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { JobProvider } from './context/JobContext';
import { ResumeProvider } from './context/ResumeContext';
import { SidebarProvider } from './context/SidebarContext';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from './components/common/ScrollToTop';
import TopProgressBar from './components/common/TopProgressBar';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <HashRouter>
        <TopProgressBar />
        <ScrollToTop />
        <ToastProvider>
          <ThemeProvider>
            <AuthProvider>
              <SidebarProvider>
                <JobProvider>
                  <ResumeProvider>
                    <AppRoutes />
                  </ResumeProvider>
                </JobProvider>
              </SidebarProvider>
            </AuthProvider>
          </ThemeProvider>
        </ToastProvider>
      </HashRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
