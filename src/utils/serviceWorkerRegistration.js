// Service Worker Registration Utility for GreenoFig
// This file handles service worker registration, updates, and push subscription management

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export function register(config) {
  if ('serviceWorker' in navigator) {
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL(process.env.PUBLIC_URL || '', window.location.href);

    if (publicUrl.origin !== window.location.origin) {
      // Service worker won't work if PUBLIC_URL is on a different origin
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/sw.js`;

      if (isLocalhost) {
        // This is running on localhost. Check if a service worker exists.
        checkValidServiceWorker(swUrl, config);

        // Add some additional logging to localhost, pointing devs to the service worker docs
        navigator.serviceWorker.ready.then(() => {
          console.log(
            '[SW Registration] This web app is being served cache-first by a service worker. Learn more: https://bit.ly/CRA-PWA'
          );
        });
      } else {
        // Is not localhost. Register service worker
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log('[SW Registration] Service Worker registered successfully:', registration);

      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // At this point, the updated precached content has been fetched,
              // but the previous service worker will still serve the older content
              console.log('[SW Registration] New content is available; please refresh.');

              // Execute callback
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // At this point, everything has been precached.
              console.log('[SW Registration] Content is cached for offline use.');

              // Execute callback
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('[SW Registration] Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      // Ensure service worker exists, and that we really are getting a JS file.
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('[SW Registration] No internet connection found. App is running in offline mode.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
        console.log('[SW Registration] Service Worker unregistered');
      })
      .catch((error) => {
        console.error('[SW Registration] Error unregistering service worker:', error);
      });
  }
}

// Subscribe to push notifications
export async function subscribeToPushNotifications(userId) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[Push] Push notifications are not supported in this browser');
    return null;
  }

  try {
    // Wait for service worker to be ready
    const registration = await navigator.serviceWorker.ready;

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Request notification permission
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        console.warn('[Push] Notification permission denied');
        return null;
      }

      // Subscribe to push notifications
      // Note: You'll need to generate VAPID keys for your application
      // Use: npx web-push generate-vapid-keys
      const vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY || 'YOUR_PUBLIC_VAPID_KEY';

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      console.log('[Push] Subscribed to push notifications:', subscription);
    }

    // Send subscription to server
    await sendSubscriptionToServer(subscription, userId);

    return subscription;
  } catch (error) {
    console.error('[Push] Error subscribing to push notifications:', error);
    return null;
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPushNotifications(userId) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      console.log('[Push] Unsubscribed from push notifications');

      // Remove subscription from server
      await removeSubscriptionFromServer(subscription, userId);
    }
  } catch (error) {
    console.error('[Push] Error unsubscribing from push notifications:', error);
  }
}

// Get current push subscription
export async function getPushSubscription() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription;
  } catch (error) {
    console.error('[Push] Error getting push subscription:', error);
    return null;
  }
}

// Send subscription to server
async function sendSubscriptionToServer(subscription, userId) {
  try {
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        userId: userId
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send subscription to server');
    }

    console.log('[Push] Subscription sent to server successfully');
  } catch (error) {
    console.error('[Push] Error sending subscription to server:', error);
  }
}

// Remove subscription from server
async function removeSubscriptionFromServer(subscription, userId) {
  try {
    const response = await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        userId: userId
      })
    });

    if (!response.ok) {
      throw new Error('Failed to remove subscription from server');
    }

    console.log('[Push] Subscription removed from server successfully');
  } catch (error) {
    console.error('[Push] Error removing subscription from server:', error);
  }
}

// Convert VAPID key from Base64 to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Request notification permission
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('[Notifications] This browser does not support notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

// Show a test notification
export async function showTestNotification() {
  const permission = await requestNotificationPermission();

  if (permission === 'granted') {
    const registration = await navigator.serviceWorker.ready;

    await registration.showNotification('GreenoFig Test Notification', {
      body: 'Your notifications are working correctly! 🎉',
      icon: '/logo.png',
      badge: '/logo.png',
      tag: 'test-notification',
      requireInteraction: false,
      vibrate: [200, 100, 200],
      data: {
        url: '/',
        type: 'test'
      }
    });
  }
}

// Update service worker
export async function updateServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
      console.log('[SW Registration] Service Worker updated');
    } catch (error) {
      console.error('[SW Registration] Error updating service worker:', error);
    }
  }
}

// Skip waiting and activate new service worker immediately
export async function skipWaiting() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;

      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });

        // Reload page when new service worker takes over
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });
      }
    } catch (error) {
      console.error('[SW Registration] Error skipping waiting:', error);
    }
  }
}

// Clear service worker cache
export async function clearServiceWorkerCache() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;

      if (registration.active) {
        registration.active.postMessage({ type: 'CLEAR_CACHE' });
        console.log('[SW Registration] Cache cleared');
      }
    } catch (error) {
      console.error('[SW Registration] Error clearing cache:', error);
    }
  }
}

export default {
  register,
  unregister,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  getPushSubscription,
  requestNotificationPermission,
  showTestNotification,
  updateServiceWorker,
  skipWaiting,
  clearServiceWorkerCache
};
