import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import '@/index.css';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { BrowserRouter } from 'react-router-dom';
import { reportWebVitals, logWebVitals } from '@/lib/webVitals';

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