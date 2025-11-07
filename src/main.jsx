import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { BrowserRouter } from 'react-router-dom';
import { reportWebVitals, logWebVitals } from '@/lib/webVitals';
import { errorLogger } from '@/lib/errorLogger';

// Initialize global error logging
errorLogger.init();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);

// Start monitoring Web Vitals
reportWebVitals(logWebVitals);

// EMERGENCY FIX: Unregister old service worker that was causing caching issues
// The service worker created on Nov 3 was preventing updates from showing
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
      console.log('Service Worker unregistered:', registration.scope);
    });
  });
}