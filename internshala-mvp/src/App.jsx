import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './components/common/Toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { JobProvider } from './context/JobContext';
import { ResumeProvider } from './context/ResumeContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
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
  );
}

export default App;
