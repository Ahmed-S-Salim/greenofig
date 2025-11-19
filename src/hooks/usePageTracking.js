import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to track page views with Google Analytics
 * Automatically tracks route changes in React Router
 */
export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Check if gtag is available (Google Analytics loaded)
    if (typeof window.gtag !== 'undefined') {
      // Track page view
      window.gtag('config', 'G-PELCKN5T5Q', {
        page_path: location.pathname + location.search,
        page_title: document.title,
      });

      // Optional: Track as event for additional insights
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
        page_title: document.title,
        page_location: window.location.href,
      });
    }

    // Check if dataLayer is available (Google Tag Manager loaded)
    if (typeof window.dataLayer !== 'undefined') {
      window.dataLayer.push({
        event: 'page_view',
        page: {
          path: location.pathname + location.search,
          title: document.title,
          url: window.location.href,
        },
      });
    }
  }, [location]);
};

/**
 * Track custom events with Google Analytics
 * @param {string} eventName - Name of the event
 * @param {object} eventParams - Additional parameters for the event
 */
export const trackEvent = (eventName, eventParams = {}) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', eventName, eventParams);
  }

  if (typeof window.dataLayer !== 'undefined') {
    window.dataLayer.push({
      event: eventName,
      ...eventParams,
    });
  }
};

/**
 * Track button clicks
 * @param {string} buttonName - Name/label of the button
 * @param {string} category - Category of the button (e.g., 'CTA', 'Navigation')
 */
export const trackButtonClick = (buttonName, category = 'Button') => {
  trackEvent('button_click', {
    event_category: category,
    event_label: buttonName,
  });
};

/**
 * Track form submissions
 * @param {string} formName - Name of the form
 * @param {boolean} success - Whether submission was successful
 */
export const trackFormSubmit = (formName, success = true) => {
  trackEvent('form_submit', {
    event_category: 'Form',
    event_label: formName,
    success: success,
  });
};

/**
 * Track user signups/registrations
 * @param {string} method - Method used for signup (e.g., 'email', 'google')
 */
export const trackSignup = (method = 'email') => {
  trackEvent('sign_up', {
    method: method,
  });
};

/**
 * Track user logins
 * @param {string} method - Method used for login
 */
export const trackLogin = (method = 'email') => {
  trackEvent('login', {
    method: method,
  });
};

/**
 * Track purchases/subscriptions
 * @param {string} planName - Name of the plan purchased
 * @param {number} value - Price of the purchase
 * @param {string} currency - Currency code (default: 'USD')
 */
export const trackPurchase = (planName, value, currency = 'USD') => {
  trackEvent('purchase', {
    transaction_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    value: value,
    currency: currency,
    items: [
      {
        item_name: planName,
        price: value,
      },
    ],
  });
};
