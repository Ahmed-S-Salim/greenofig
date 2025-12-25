// Service Worker for GreenoFig Push Notifications
// Version: 1.0.0

const CACHE_NAME = 'greenofig-v1';
const NOTIFICATION_TAG = 'greenofig-notification';

// Assets to cache for offline functionality (optional)
const urlsToCache = [
  '/',
  '/logo.png',
  '/offline.html'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[Service Worker] Installation complete');
        return self.skipWaiting(); // Activate immediately
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activation complete');
        return self.clients.claim(); // Take control immediately
      })
  );
});

// Fetch event - serve from cache when offline (optional)
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip non-HTTP/HTTPS requests
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response before caching
        const responseToCache = response.clone();

        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // If network fails, try to serve from cache
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }

            // If not in cache, show offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');

  let notificationData = {
    title: 'GreenoFig Notification',
    body: 'You have a new notification',
    icon: '/logo.png',
    badge: '/logo.png',
    tag: NOTIFICATION_TAG,
    requireInteraction: false,
    vibrate: [200, 100, 200]
  };

  // Parse the push event data
  if (event.data) {
    try {
      const data = event.data.json();

      notificationData = {
        title: data.title || notificationData.title,
        body: data.message || data.body || notificationData.body,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        tag: data.tag || NOTIFICATION_TAG,
        requireInteraction: data.requireInteraction || false,
        vibrate: data.vibrate || [200, 100, 200],
        data: {
          url: data.url || data.action_url || '/',
          notificationId: data.id,
          type: data.type,
          timestamp: Date.now()
        }
      };

      // Add action buttons based on notification type
      if (data.type === 'message') {
        notificationData.actions = [
          { action: 'reply', title: 'Reply', icon: '/icons/reply.png' },
          { action: 'view', title: 'View', icon: '/icons/view.png' }
        ];
      } else if (data.type === 'reminder') {
        notificationData.actions = [
          { action: 'log', title: 'Log Now', icon: '/icons/log.png' },
          { action: 'snooze', title: 'Snooze', icon: '/icons/snooze.png' }
        ];
      } else if (data.type === 'goal' || data.type === 'achievement') {
        notificationData.actions = [
          { action: 'view', title: 'View', icon: '/icons/view.png' },
          { action: 'share', title: 'Share', icon: '/icons/share.png' }
        ];
      }

      // Add custom image if provided
      if (data.image) {
        notificationData.image = data.image;
      }

    } catch (error) {
      console.error('[Service Worker] Error parsing push data:', error);
    }
  }

  // Show the notification
  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
      .then(() => {
        console.log('[Service Worker] Notification displayed');
      })
      .catch((error) => {
        console.error('[Service Worker] Error showing notification:', error);
      })
  );
});

// Notification click event - handle user interaction
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked');

  event.notification.close(); // Close the notification

  const notificationData = event.notification.data || {};
  const action = event.action;
  const url = notificationData.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Handle different actions
        if (action === 'snooze') {
          // Snooze the reminder for 15 minutes
          console.log('[Service Worker] Snoozing notification');
          return; // Don't open any window
        }

        if (action === 'reply' && notificationData.type === 'message') {
          // Open messaging interface directly
          const messageUrl = `/app/messaging?id=${notificationData.notificationId}`;

          // Try to focus existing window
          for (let client of clientList) {
            if (client.url.includes('/app/messaging') && 'focus' in client) {
              return client.focus();
            }
          }

          // Open new window if no existing one
          if (clients.openWindow) {
            return clients.openWindow(messageUrl);
          }
        }

        if (action === 'log' && notificationData.type === 'reminder') {
          // Open quick log interface
          const logUrl = `/app/user?quickLog=true`;

          if (clients.openWindow) {
            return clients.openWindow(logUrl);
          }
        }

        if (action === 'share') {
          // Share achievement (web share API)
          if (self.registration.share) {
            return self.registration.share({
              title: event.notification.title,
              text: event.notification.body,
              url: window.location.origin + url
            }).catch(err => console.log('Error sharing:', err));
          }
        }

        // Default action - open the notification URL
        // First, try to focus an existing window/tab
        for (let client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }

        // If no existing window, open a new one
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
      .catch((error) => {
        console.error('[Service Worker] Error handling notification click:', error);
      })
  );
});

// Notification close event - track dismissals
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notification closed by user');

  const notificationData = event.notification.data || {};

  // Track notification dismissal (optional analytics)
  if (notificationData.notificationId) {
    // You could send a dismissal event to your analytics here
    console.log('[Service Worker] Notification dismissed:', notificationData.notificationId);
  }
});

// Background sync event (for offline actions)
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync event:', event.tag);

  if (event.tag === 'sync-notifications') {
    event.waitUntil(
      // Sync pending notifications when back online
      syncPendingNotifications()
    );
  }
});

// Periodic background sync (requires user permission)
self.addEventListener('periodicsync', (event) => {
  console.log('[Service Worker] Periodic sync event:', event.tag);

  if (event.tag === 'check-reminders') {
    event.waitUntil(
      // Check for scheduled reminders
      checkScheduledReminders()
    );
  }
});

// Helper function to sync pending notifications
async function syncPendingNotifications() {
  try {
    // Get pending notifications from IndexedDB or localStorage
    const pendingNotifications = await getPendingNotifications();

    if (pendingNotifications.length > 0) {
      console.log(`[Service Worker] Syncing ${pendingNotifications.length} pending notifications`);

      // Send to server
      for (const notification of pendingNotifications) {
        await fetch('/api/notifications/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notification)
        });
      }

      // Clear pending notifications
      await clearPendingNotifications();
    }
  } catch (error) {
    console.error('[Service Worker] Error syncing notifications:', error);
  }
}

// Helper function to check scheduled reminders
async function checkScheduledReminders() {
  try {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];

    console.log(`[Service Worker] Checking reminders for ${currentDay} at ${currentTime}`);

    // Fetch scheduled reminders from server
    const response = await fetch(`/api/reminders/check?time=${currentTime}&day=${currentDay}`);
    const reminders = await response.json();

    if (reminders.length > 0) {
      console.log(`[Service Worker] Found ${reminders.length} reminders to trigger`);

      // Show notifications for each reminder
      for (const reminder of reminders) {
        await self.registration.showNotification(reminder.title, {
          body: reminder.message,
          icon: '/logo.png',
          badge: '/logo.png',
          tag: `reminder-${reminder.id}`,
          requireInteraction: true,
          vibrate: [200, 100, 200],
          data: {
            url: '/app/user',
            type: 'reminder',
            reminderId: reminder.id
          }
        });
      }
    }
  } catch (error) {
    console.error('[Service Worker] Error checking reminders:', error);
  }
}

// Helper function to get pending notifications (mock implementation)
async function getPendingNotifications() {
  // In a real implementation, this would fetch from IndexedDB
  return [];
}

// Helper function to clear pending notifications (mock implementation)
async function clearPendingNotifications() {
  // In a real implementation, this would clear IndexedDB
  return Promise.resolve();
}

// Message event - handle messages from the main app
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.delete(CACHE_NAME)
        .then(() => {
          console.log('[Service Worker] Cache cleared');
          return self.registration.update();
        })
    );
  }
});

console.log('[Service Worker] Script loaded');
