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

// Register Service Worker for offline support and faster loading
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration.scope);

        // Check for updates every 30 seconds
        setInterval(() => {
          registration.update();
        }, 30000);
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  });

  // Listen for cache update messages
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CACHE_UPDATED') {
      console.log('Cache updated, reloading page for fresh content...');
      // Reload the page to get the latest content
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  });
}