import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

// VAPID public key for Web Push - this is safe to include in client code
// Private key is stored securely in Supabase Edge Function secrets
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BMB4AwUd3VqZ0NDGjvB4-4Cnih6wXeEeajXOvIKcvbk-mZF6cLoJFT0V1u5R6UU_eaRyi2PjHHoOQOFU_MtJ4n8';

export const usePushNotifications = () => {
  const { user, userProfile } = useAuth();
  const [permission, setPermission] = useState('default');
  const [subscription, setSubscription] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState(null);

  // Check if push notifications are supported
  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  // Register service worker
  useEffect(() => {
    if (!isSupported) return;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        console.log('Service Worker registered:', registration);
        setServiceWorkerRegistration(registration);

        // Check for existing subscription
        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
          setSubscription(existingSubscription);
        }
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    registerSW();
  }, [isSupported]);

  // Listen for messages from service worker
  useEffect(() => {
    if (!isSupported) return;

    const handleMessage = (event) => {
      const { data } = event;

      if (data.type === 'ANSWER_CALL') {
        // Dispatch custom event for the app to handle
        window.dispatchEvent(new CustomEvent('answerCall', {
          detail: { roomId: data.roomId, callerId: data.callerId }
        }));
      }

      if (data.type === 'DECLINE_CALL') {
        window.dispatchEvent(new CustomEvent('declineCall', {
          detail: { roomId: data.roomId, callerId: data.callerId }
        }));
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [isSupported]);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async () => {
    if (!isSupported || !serviceWorkerRegistration) {
      return null;
    }

    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return null;
    }

    try {
      // If VAPID key is not set, use local notifications only
      if (!VAPID_PUBLIC_KEY) {
        console.log('VAPID key not configured - using local notifications only');
        return null;
      }

      const pushSubscription = await serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      setSubscription(pushSubscription);

      // Save subscription to server with proper structure
      if (user?.id) {
        const subscriptionJson = pushSubscription.toJSON();
        await supabase
          .from('push_subscriptions')
          .upsert({
            user_id: user.id,
            endpoint: subscriptionJson.endpoint,
            p256dh: subscriptionJson.keys?.p256dh || '',
            auth: subscriptionJson.keys?.auth || '',
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,endpoint'
          });
        console.log('Push subscription saved successfully');
      }

      return pushSubscription;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      return null;
    }
  }, [isSupported, serviceWorkerRegistration, permission, requestPermission, user?.id]);

  // Show a local notification (works even without push subscription)
  const showLocalNotification = useCallback(async (title, options = {}) => {
    if (!isSupported) return false;

    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    try {
      if (serviceWorkerRegistration) {
        await serviceWorkerRegistration.showNotification(title, {
          icon: '/logo.png',
          badge: '/logo.png',
          vibrate: [200, 100, 200],
          ...options
        });
        return true;
      } else {
        // Fallback to basic Notification API
        new Notification(title, {
          icon: '/logo.png',
          ...options
        });
        return true;
      }
    } catch (error) {
      console.error('Error showing notification:', error);
      return false;
    }
  }, [isSupported, permission, requestPermission, serviceWorkerRegistration]);

  // Show incoming call notification
  const showIncomingCallNotification = useCallback(async (callerName, roomId, callerId) => {
    return showLocalNotification(`Incoming Call from ${callerName}`, {
      body: 'Tap to answer the video call',
      tag: 'greenofig-video-call',
      requireInteraction: true,
      vibrate: [500, 200, 500, 200, 500, 200, 500],
      actions: [
        { action: 'answer', title: 'Answer' },
        { action: 'decline', title: 'Decline' }
      ],
      data: {
        type: 'incoming_call',
        roomId,
        callerId,
        callUrl: `/call/${roomId}`
      }
    });
  }, [showLocalNotification]);

  // Show missed call notification
  const showMissedCallNotification = useCallback(async (callerName, roomId) => {
    return showLocalNotification(`Missed Call from ${callerName}`, {
      body: 'You missed a video call. Tap to call back.',
      tag: 'greenofig-video-call-missed',
      actions: [
        { action: 'callback', title: 'Call Back' },
        { action: 'view', title: 'View' }
      ],
      data: {
        type: 'missed_call',
        roomId,
        callUrl: `/call/${roomId}`
      }
    });
  }, [showLocalNotification]);

  // Show appointment reminder notification
  const showAppointmentReminder = useCallback(async (appointment, minutesBefore = 15) => {
    const appointmentTime = new Date(appointment.appointment_date);
    const formattedTime = appointmentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return showLocalNotification(`Appointment in ${minutesBefore} minutes`, {
      body: `${appointment.title} at ${formattedTime}`,
      tag: 'greenofig-appointment-reminder',
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'View' },
        { action: 'join', title: 'Join Call' }
      ],
      data: {
        type: 'appointment_reminder',
        appointmentId: appointment.id,
        url: '/app/user'
      }
    });
  }, [showLocalNotification]);

  // Show appointment notification (scheduled, updated, cancelled)
  const showAppointmentNotification = useCallback(async (type, title, message, appointmentId) => {
    return showLocalNotification(title, {
      body: message,
      tag: 'greenofig-appointment',
      actions: [
        { action: 'view', title: 'View Details' }
      ],
      data: {
        type,
        appointmentId,
        url: '/app/user'
      }
    });
  }, [showLocalNotification]);

  // Auto-subscribe when user is logged in and permission is granted
  useEffect(() => {
    if (user?.id && permission === 'granted' && serviceWorkerRegistration && !subscription) {
      subscribeToPush();
    }
  }, [user?.id, permission, serviceWorkerRegistration, subscription, subscribeToPush]);

  // Send push notification to a user via Edge Function (for server-initiated notifications)
  const sendPushToUser = useCallback(async (targetUserId, title, body, options = {}) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          userId: targetUserId,
          title,
          body,
          ...options
        }
      });

      if (error) {
        console.error('Error sending push notification:', error);
        return false;
      }

      console.log('Push notification sent:', data);
      return true;
    } catch (error) {
      console.error('Error invoking push function:', error);
      return false;
    }
  }, []);

  return {
    isSupported,
    permission,
    subscription,
    requestPermission,
    subscribeToPush,
    showLocalNotification,
    showIncomingCallNotification,
    showMissedCallNotification,
    showAppointmentReminder,
    showAppointmentNotification,
    sendPushToUser
  };
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default usePushNotifications;
