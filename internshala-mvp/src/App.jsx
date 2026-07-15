import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastProvider } from './components/common/Toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { JobProvider } from './context/JobContext';
import { ResumeProvider } from './context/ResumeContext';
import AppRoutes from './routes/AppRoutes';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <ToastProvider>
          <ThemeProvider>
            <AuthProvider>
              <JobProvider>
                <ResumeProvider>
                  <AppRoutes />
                </ResumeProvider>
              </JobProvider>
            </AuthProvider>
          </ThemeProvider>
        </ToastProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
