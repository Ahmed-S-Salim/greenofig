// Service Worker for GreenoFig Push Notifications
// Version: 8.0.0 - Network-first for HTML to fix stuck loading issues

const CACHE_NAME = 'greenofig-v9';

// Only cache static assets, NOT HTML (to prevent stale app issues)
const CRITICAL_ASSETS = [
  '/logo.png',
  '/favicon.png',
  '/offline.html'
];
const NOTIFICATION_TAG = 'greenofig-notification';
const VIDEO_CALL_TAG = 'greenofig-video-call';
const APPOINTMENT_TAG = 'greenofig-appointment';

// Badge count for app icon (PWA) - stored in IndexedDB for persistence
let badgeCount = 0;

// Initialize badge count from IndexedDB on startup
const initBadgeCount = async () => {
  try {
    const db = await openBadgeDB();
    const tx = db.transaction('badge', 'readonly');
    const store = tx.objectStore('badge');
    const request = store.get('count');

    return new Promise((resolve) => {
      request.onsuccess = () => {
        badgeCount = request.result || 0;
        console.log('[Service Worker] Loaded badge count from DB:', badgeCount);
        // Apply badge on startup
        if (badgeCount > 0 && 'setAppBadge' in navigator) {
          navigator.setAppBadge(badgeCount).catch(() => {});
        }
        resolve(badgeCount);
      };
      request.onerror = () => resolve(0);
    });
  } catch (e) {
    console.log('[Service Worker] Error loading badge count:', e);
    return 0;
  }
};

// Open or create badge database
const openBadgeDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('greenofig-badge', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('badge')) {
        db.createObjectStore('badge');
      }
    };
  });
};

// Save badge count to IndexedDB
const saveBadgeCount = async (count) => {
  try {
    const db = await openBadgeDB();
    const tx = db.transaction('badge', 'readwrite');
    const store = tx.objectStore('badge');
    store.put(count, 'count');
    console.log('[Service Worker] Saved badge count to DB:', count);
  } catch (e) {
    console.log('[Service Worker] Error saving badge count:', e);
  }
};

// Initialize on load
initBadgeCount();

// Assets to cache for offline functionality (NO HTML files to prevent stale issues)
const urlsToCache = [
  '/logo.png',
  '/offline.html',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.png',
  '/site.webmanifest'
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

// Fetch event - Network-first for HTML/navigation, cache-first for static assets
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip non-HTTP/HTTPS requests
  if (!event.request.url.startsWith('http')) return;

  const url = new URL(event.request.url);

  // Check if it's an HTML navigation request
  const isNavigation = event.request.mode === 'navigate';

  // Check if this is the main HTML document
  const isHtmlRequest = event.request.headers.get('accept')?.includes('text/html') ||
                        url.pathname === '/' ||
                        url.pathname.endsWith('.html');

  // ALWAYS use network-first for HTML/navigation to prevent stale app issues
  if (isNavigation || isHtmlRequest) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Successfully got from network - return it
          return response;
        })
        .catch(() => {
          // Network failed - show offline page
          return caches.match('/offline.html');
        })
    );
    return;
  }

  // Check if this is a critical static asset (images, icons)
  const isCritical = CRITICAL_ASSETS.some(asset =>
    url.pathname === asset || url.pathname.endsWith(asset)
  );

  if (isCritical) {
    // Cache-first for static assets like images
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request)
            .then((response) => {
              if (response && response.status === 200) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => cache.put(event.request, responseToCache));
              }
              return response;
            });
        })
    );
  } else {
    // Network-first for all other assets (JS, CSS, API calls)
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone and cache successful responses
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request);
        })
    );
  }
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
      } else if (data.type === 'video_call' || data.type === 'incoming_call') {
        // Video call - high priority with answer/decline buttons
        notificationData.tag = VIDEO_CALL_TAG;
        notificationData.requireInteraction = true;
        notificationData.vibrate = [500, 200, 500, 200, 500]; // Longer vibration pattern for calls
        notificationData.actions = [
          { action: 'answer', title: 'Answer' },
          { action: 'decline', title: 'Decline' }
        ];
        notificationData.data.callUrl = data.callUrl || data.url;
        notificationData.data.roomId = data.roomId;
        notificationData.data.callerId = data.callerId;
      } else if (data.type === 'missed_call') {
        notificationData.tag = VIDEO_CALL_TAG + '-missed';
        notificationData.actions = [
          { action: 'callback', title: 'Call Back' },
          { action: 'view', title: 'View' }
        ];
      } else if (data.type === 'appointment_scheduled' || data.type === 'appointment_updated' || data.type === 'appointment_cancelled') {
        notificationData.tag = APPOINTMENT_TAG;
        notificationData.actions = [
          { action: 'view', title: 'View Details' }
        ];
      } else if (data.type === 'appointment_reminder') {
        notificationData.tag = APPOINTMENT_TAG + '-reminder';
        notificationData.requireInteraction = true;
        notificationData.actions = [
          { action: 'view', title: 'View' },
          { action: 'join', title: 'Join Call' }
        ];
        notificationData.data.appointmentId = data.appointmentId;
      }

      // Add custom image if provided
      if (data.image) {
        notificationData.image = data.image;
      }

    } catch (error) {
      console.error('[Service Worker] Error parsing push data:', error);
    }
  }

  // Show the notification and update badge
  event.waitUntil(
    (async () => {
      // Increment badge count
      badgeCount++;

      // Save to IndexedDB for persistence
      await saveBadgeCount(badgeCount);

      // Update app badge (PWA - works on Android/iOS)
      if ('setAppBadge' in navigator) {
        try {
          await navigator.setAppBadge(badgeCount);
          console.log('[Service Worker] Badge set to:', badgeCount);
        } catch (err) {
          console.log('[Service Worker] Badge API error:', err);
        }
      }

      // Show the notification
      await self.registration.showNotification(notificationData.title, notificationData);
      console.log('[Service Worker] Notification displayed');

      // Notify all open clients about the new notification
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of clients) {
        client.postMessage({
          type: 'NEW_NOTIFICATION',
          data: notificationData.data,
          badgeCount: badgeCount
        });
      }

      // For video calls, keep trying to vibrate on mobile
      if (notificationData.data?.type === 'video_call' || notificationData.data?.type === 'incoming_call') {
        // Extended vibration for calls
        if ('vibrate' in navigator) {
          navigator.vibrate([500, 200, 500, 200, 500, 200, 500, 200, 500]);
        }
      }
    })()
  );
});

// Notification click event - handle user interaction
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked');

  event.notification.close(); // Close the notification

  // Decrement badge count and update
  badgeCount = Math.max(0, badgeCount - 1);
  saveBadgeCount(badgeCount); // Save to IndexedDB

  if ('setAppBadge' in navigator) {
    if (badgeCount === 0) {
      navigator.clearAppBadge().catch(() => {});
    } else {
      navigator.setAppBadge(badgeCount).catch(() => {});
    }
  }

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

        // Handle video call actions
        if (action === 'answer' && (notificationData.type === 'video_call' || notificationData.type === 'incoming_call')) {
          const callUrl = notificationData.callUrl || `/call/${notificationData.roomId}`;

          // Try to focus existing app window
          for (let client of clientList) {
            if ('focus' in client) {
              client.focus();
              // Send message to client to answer call
              client.postMessage({
                type: 'ANSWER_CALL',
                roomId: notificationData.roomId,
                callerId: notificationData.callerId
              });
              return;
            }
          }

          // Open new window with call
          if (clients.openWindow) {
            return clients.openWindow(callUrl);
          }
        }

        if (action === 'decline' && (notificationData.type === 'video_call' || notificationData.type === 'incoming_call')) {
          // Send decline message to any open clients
          for (let client of clientList) {
            client.postMessage({
              type: 'DECLINE_CALL',
              roomId: notificationData.roomId,
              callerId: notificationData.callerId
            });
          }

          // Also try to notify the caller via fetch (so caller knows even if no open window)
          try {
            fetch('/api/call/decline', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                roomId: notificationData.roomId,
                callerId: notificationData.callerId,
                declinedAt: new Date().toISOString()
              })
            }).catch(() => {});
          } catch (e) {}

          return;
        }

        if (action === 'callback' && notificationData.type === 'missed_call') {
          const callUrl = notificationData.callUrl || `/call/${notificationData.roomId}`;
          if (clients.openWindow) {
            return clients.openWindow(callUrl);
          }
        }

        if (action === 'join' && notificationData.type === 'appointment_reminder') {
          const callUrl = `/call/gf-call-${notificationData.appointmentId}`;
          if (clients.openWindow) {
            return clients.openWindow(callUrl);
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

  // Clear badge count when user opens app
  if (event.data && event.data.type === 'CLEAR_BADGE') {
    badgeCount = 0;
    saveBadgeCount(0); // Persist the clear
    if ('clearAppBadge' in navigator) {
      navigator.clearAppBadge().catch(() => {});
    }
    console.log('[Service Worker] Badge cleared');
  }

  // Set specific badge count (sync from app)
  if (event.data && event.data.type === 'SET_BADGE') {
    badgeCount = event.data.count || 0;
    saveBadgeCount(badgeCount); // Persist to IndexedDB
    if ('setAppBadge' in navigator) {
      if (badgeCount === 0) {
        navigator.clearAppBadge().catch(() => {});
      } else {
        navigator.setAppBadge(badgeCount).catch(() => {});
      }
    }
    console.log('[Service Worker] Badge set to:', badgeCount);
  }

  // Get current badge count (for sync)
  if (event.data && event.data.type === 'GET_BADGE') {
    event.source.postMessage({
      type: 'BADGE_COUNT',
      count: badgeCount
    });
  }
});

console.log('[Service Worker] Script loaded');
