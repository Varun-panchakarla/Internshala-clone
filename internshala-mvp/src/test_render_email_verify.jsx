import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';

// Mocks for browser globals under Node
global.localStorage = {
  getItem: () => 'light',
  setItem: () => null
};

global.window = {
  document: {
    documentElement: {
      classList: {
        add: () => null,
        remove: () => null
      }
    }
  },
  matchMedia: () => ({ matches: false }),
};

import { ToastProvider } from './components/common/Toast';
import { ThemeProvider } from './context/ThemeContext';
import { EmployerAuthProvider } from './context/EmployerAuthContext';
import EmployerVerifyEmail from './pages/employer/EmployerVerifyEmail';

function run() {
  console.log('Attempting to render EmployerVerifyEmail component without state...');
  try {
    const html = renderToString(
      <MemoryRouter initialEntries={['/employer/verify-email']}>
        <ToastProvider>
          <ThemeProvider>
            <EmployerAuthProvider>
              <EmployerVerifyEmail />
            </EmployerAuthProvider>
          </ThemeProvider>
        </ToastProvider>
      </MemoryRouter>
    );
    console.log('Component rendered successfully without state!');
    console.log('HTML preview length:', html.length);
  } catch (err) {
    console.error('Rendering failed with error:');
    console.error(err);
  }
}

run();
