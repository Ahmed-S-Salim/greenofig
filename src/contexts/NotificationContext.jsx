import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Bell } from 'lucide-react';

const NotificationContext = createContext();

// Global event emitter for live notification updates across components
export const notificationEvents = {
  listeners: new Set(),
  emit(event, data) {
    this.listeners.forEach(listener => listener(event, data));
  },
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
};

// Helper function to update PWA app icon badge
const updateAppBadge = async (count) => {
  try {
    if ('setAppBadge' in navigator) {
      if (count > 0) {
        await navigator.setAppBadge(count);
      } else {
        await navigator.clearAppBadge();
      }
    }
    // Also notify service worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SET_BADGE',
        count: count
      });
    }
  } catch (err) {
    // Silently fail
  }
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { userProfile } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const notificationSoundRef = useRef(null);

  useEffect(() => {
    // Initialize notification sound - a pleasant chime
    // Create an audio context for a better notification sound
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const createNotificationSound = () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
        oscillator.frequency.setValueAtTime(1174.66, audioContext.currentTime + 0.1); // D6 note
        oscillator.frequency.setValueAtTime(1318.51, audioContext.currentTime + 0.2); // E6 note

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
      };

      // Store the function to play the sound
      notificationSoundRef.current = { play: createNotificationSound, audioContext };
    } catch (e) {
      // Fallback to simple audio
      notificationSoundRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuEzvLaizsIGmi77eamUBELTKXh8bllHAU2jdXyzn0vBSR2xe/glEILElyx6OyrWBQLRp3e8cFuJAUpgs/z3I4+CRhnvO7op1YSCEE=');
    }
  }, []);

  useEffect(() => {
    if (!userProfile?.id) return;

    const channels = [];

    // 1. NEW MESSAGES
    channels.push(supabase
      .channel('user_messages')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `recipient_id=eq.${userProfile.id}` },
        (payload) => {
          playNotificationSound();
          showNotification('💬 New Message', 'You have a new message');
          updateUnreadCount();
        }
      )
      .subscribe());

    // 2. MEAL PLAN ASSIGNMENTS
    channels.push(supabase
      .channel('user_meal_plans')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ai_meal_plans', filter: `user_id=eq.${userProfile.id}` },
        (payload) => {
          playNotificationSound();
          showNotification('🍽️ New Meal Plan', 'A new meal plan has been assigned to you!');
        }
      )
      .subscribe());

    // 3. WORKOUT PLAN ASSIGNMENTS
    channels.push(supabase
      .channel('user_workout_plans')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'workout_plans', filter: `user_id=eq.${userProfile.id}` },
        (payload) => {
          playNotificationSound();
          showNotification('💪 New Workout Plan', 'Your trainer assigned you a new workout!');
        }
      )
      .subscribe());

    // 4. ACHIEVEMENTS & BADGES
    channels.push(supabase
      .channel('user_achievements')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'user_achievements', filter: `user_id=eq.${userProfile.id}` },
        (payload) => {
          playNotificationSound();
          showNotification('🏆 Achievement Unlocked!', 'You earned a new badge!', 'success');
        }
      )
      .subscribe());

    // 5. LEVEL UPS
    channels.push(supabase
      .channel('user_levels')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'user_gamification', filter: `user_id=eq.${userProfile.id}` },
        (payload) => {
          if (payload.new.level > payload.old.level) {
            playNotificationSound();
            showNotification('⭐ Level Up!', `You reached level ${payload.new.level}!`, 'success');
          }
          if (payload.new.total_points > payload.old.total_points) {
            const pointsGained = payload.new.total_points - payload.old.total_points;
            playNotificationSound();
            showNotification('🎯 Points Earned!', `+${pointsGained} points!`);
          }
        }
      )
      .subscribe());

    // 6. GOAL ACHIEVEMENTS
    channels.push(supabase
      .channel('user_goals')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'user_goals', filter: `user_id=eq.${userProfile.id}` },
        (payload) => {
          if (payload.new.status === 'completed' && payload.old.status !== 'completed') {
            playNotificationSound();
            showNotification('🎉 Goal Completed!', `You completed: ${payload.new.goal_name}`);
          }
        }
      )
      .subscribe());

    // 7. WEIGHT LOG MILESTONES
    channels.push(supabase
      .channel('user_weight_logs')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'weight_logs', filter: `user_id=eq.${userProfile.id}` },
        (payload) => {
          playNotificationSound();
          showNotification('📊 Weight Logged', 'Great job tracking your progress!');
        }
      )
      .subscribe());

    // 8. SUBSCRIPTION UPDATES
    channels.push(supabase
      .channel('user_subscriptions')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'user_subscriptions', filter: `user_id=eq.${userProfile.id}` },
        (payload) => {
          playNotificationSound();
          showNotification('✨ Subscription Active!', `Welcome to ${payload.new.tier_name} tier!`);
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'user_subscriptions', filter: `user_id=eq.${userProfile.id}` },
        (payload) => {
          if (payload.new.status === 'cancelled' && payload.old.status === 'active') {
            playNotificationSound();
            showNotification('⚠️ Subscription Cancelled', 'Your subscription has been cancelled');
          }
        }
      )
      .subscribe());

    // 9. APPOINTMENT BOOKINGS (for nutritionists/admins)
    if (userProfile.role === 'nutritionist' || userProfile.role === 'admin' || userProfile.role === 'super_admin') {
      channels.push(supabase
        .channel('nutritionist_appointments')
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'appointments', filter: `nutritionist_id=eq.${userProfile.id}` },
          (payload) => {
            playNotificationSound();
            showNotification('📅 New Appointment', 'A client booked an appointment with you!');
          }
        )
        .subscribe());
    }

    // 9b. APPOINTMENT NOTIFICATIONS FOR CLIENTS (scheduled/updated/cancelled by nutritionist)
    if (userProfile.role === 'user') {
      // Listen for appointments assigned to this client
      channels.push(supabase
        .channel('client_appointments')
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'appointments', filter: `client_id=eq.${userProfile.id}` },
          (payload) => {
            playNotificationSound();
            showNotification('📅 New Appointment Scheduled', `Your nutritionist scheduled an appointment: ${payload.new.title || 'Consultation'}`, 'default', 'appointment');
          }
        )
        .on('postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'appointments', filter: `client_id=eq.${userProfile.id}` },
          (payload) => {
            if (payload.new.status === 'cancelled') {
              playNotificationSound();
              showNotification('❌ Appointment Cancelled', `Your appointment "${payload.new.title}" has been cancelled`, 'default', 'appointment');
            } else {
              playNotificationSound();
              showNotification('📅 Appointment Updated', `Your appointment "${payload.new.title}" has been updated`, 'default', 'appointment');
            }
          }
        )
        .on('postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'appointments', filter: `client_id=eq.${userProfile.id}` },
          (payload) => {
            playNotificationSound();
            showNotification('❌ Appointment Cancelled', 'An appointment has been cancelled by your nutritionist', 'default', 'appointment');
          }
        )
        .subscribe());
    }

    // 9c. Listen for notifications table inserts (appointment notifications, video calls, forms, etc.)
    channels.push(supabase
      .channel('user_notifications_table')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userProfile.id}` },
        (payload) => {
          playNotificationSound();
          showNotification(payload.new.title || '🔔 Notification', payload.new.message || 'You have a new notification');
          updateUnreadCount();
        }
      )
      .subscribe());

    // 9e. Listen for form assignments (real-time form notifications for clients)
    channels.push(supabase
      .channel('user_form_assignments')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'form_assignments', filter: `client_id=eq.${userProfile.id}` },
        (payload) => {
          playNotificationSound();
          showNotification('📋 New Form Assigned', 'Your nutritionist sent you a form to complete', 'default', 'form');
          updateUnreadCount();
        }
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'form_assignments', filter: `client_id=eq.${userProfile.id}` },
        (payload) => {
          playNotificationSound();
          showNotification('📋 Form Revoked', 'A form assignment has been removed', 'default', 'form');
          updateUnreadCount();
        }
      )
      .subscribe());

    // 9f. Listen for form submissions (for nutritionists)
    if (userProfile.role === 'nutritionist' || userProfile.role === 'admin' || userProfile.role === 'super_admin') {
      channels.push(supabase
        .channel('nutritionist_form_submissions')
        .on('postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'form_assignments', filter: `nutritionist_id=eq.${userProfile.id}` },
          (payload) => {
            if (payload.new.status === 'submitted' && payload.old.status !== 'submitted') {
              playNotificationSound();
              showNotification('📋 Form Submitted', 'A client has submitted their form for review', 'default', 'form');
              updateUnreadCount();
            }
          }
        )
        .subscribe());
    }

    // 9d. Listen for broadcast notifications on user's personal channel (for real-time alerts)
    channels.push(supabase
      .channel(`user-${userProfile.id}`)
      .on('broadcast', { event: 'notification' }, (payload) => {
        playNotificationSound();
        showNotification(payload.payload.title || '🔔 Notification', payload.payload.message || 'You have a new notification');
      })
      .on('broadcast', { event: 'incoming_call' }, (payload) => {
        playNotificationSound();
        showNotification('📞 Incoming Video Call', payload.payload.callerName ? `${payload.payload.callerName} is calling...` : 'You have an incoming video call!');
      })
      .subscribe());

    // 10. CLIENT SIGNUPS (for nutritionists)
    if (userProfile.role === 'nutritionist' || userProfile.role === 'admin' || userProfile.role === 'super_admin') {
      channels.push(supabase
        .channel('new_users')
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'user_profiles', filter: `role=eq.user` },
          (payload) => {
            playNotificationSound();
            showNotification('👤 New Client', 'A new user signed up!');
          }
        )
        .subscribe());
    }

    // 11. STREAK MILESTONES
    channels.push(supabase
      .channel('user_streaks')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'user_profiles', filter: `id=eq.${userProfile.id}` },
        (payload) => {
          if (payload.new.current_streak && payload.new.current_streak % 7 === 0 && payload.new.current_streak > payload.old.current_streak) {
            playNotificationSound();
            showNotification('🔥 Streak Milestone!', `${payload.new.current_streak} day streak! Keep it up!`, 'success');
          }
        }
      )
      .subscribe());

    // 12. MEAL/WORKOUT LOGGED
    channels.push(supabase
      .channel('user_meal_logs')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'meal_logs', filter: `user_id=eq.${userProfile.id}` },
        (payload) => {
          playNotificationSound();
          showNotification('🍴 Meal Logged', 'Great job tracking your nutrition!');
        }
      )
      .subscribe());

    channels.push(supabase
      .channel('user_workout_logs')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'workout_logs', filter: `user_id=eq.${userProfile.id}` },
        (payload) => {
          playNotificationSound();
          showNotification('💪 Workout Logged', 'Awesome workout! Keep pushing!');
        }
      )
      .subscribe());

    // 13. COMMENTS/FEEDBACK (nutritionist responses to client posts)
    channels.push(supabase
      .channel('user_comments')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments' },
        (payload) => {
          // Check if comment is on user's content
          playNotificationSound();
          showNotification('💬 New Comment', 'Someone commented on your post!');
        }
      )
      .subscribe());

    // 14. RECIPE SHARED
    channels.push(supabase
      .channel('shared_recipes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'shared_recipes', filter: `shared_with_user_id=eq.${userProfile.id}` },
        (payload) => {
          playNotificationSound();
          showNotification('🍳 Recipe Shared', 'Your nutritionist shared a recipe with you!');
        }
      )
      .subscribe());

    // 15. PAYMENT SUCCESS
    channels.push(supabase
      .channel('user_payments')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'payments', filter: `user_id=eq.${userProfile.id}` },
        (payload) => {
          if (payload.new.status === 'succeeded') {
            playNotificationSound();
            showNotification('✅ Payment Successful', 'Your payment was processed successfully!');
          }
        }
      )
      .subscribe());

    // Fetch initial unread count
    updateUnreadCount();

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [userProfile?.id, userProfile?.role]);

  const playNotificationSound = () => {
    if (notificationSoundRef.current) {
      try {
        if (typeof notificationSoundRef.current.play === 'function') {
          // It's either the AudioContext method or Audio element
          if (notificationSoundRef.current.audioContext) {
            // Resume audio context if suspended (browser autoplay policy)
            if (notificationSoundRef.current.audioContext.state === 'suspended') {
              notificationSoundRef.current.audioContext.resume();
            }
            // Create fresh oscillator for each play
            const audioContext = notificationSoundRef.current.audioContext;
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Pleasant notification chime (ascending notes)
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5

            gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
          } else {
            // Fallback Audio element
            notificationSoundRef.current.currentTime = 0;
            notificationSoundRef.current.play().catch(e => console.log('Sound play failed:', e));
          }
        }
      } catch (e) {
        console.log('Notification sound error:', e);
      }
    }
  };

  const showNotification = async (title, description, variant = 'default', type = 'general') => {
    // Determine URL based on notification type
    const getNotificationUrl = (notifType) => {
      switch (notifType) {
        case 'appointment':
          return '/app/user#user-appointments';
        case 'form':
          return '/app/forms';
        case 'message':
          return '/app/user#messaging-center';
        case 'call':
          return '/app/user';
        default:
          return '/app/user';
      }
    };

    const notificationUrl = getNotificationUrl(type);

    // Try service worker notification first (works even when browser is in background)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          body: description,
          icon: '/logo.png',
          badge: '/logo.png',
          vibrate: [200, 100, 200],
          tag: `greenofig-${type}-${Date.now()}`,
          requireInteraction: false,
          data: { type, url: notificationUrl }
        });
      } catch (e) {
        // Fallback to basic Notification API
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, {
            body: description,
            icon: '/logo.png',
            badge: '/logo.png',
          });
        }
      }
    } else if ('Notification' in window && Notification.permission === 'granted') {
      // Fallback to basic Notification API
      new Notification(title, {
        body: description,
        icon: '/logo.png',
        badge: '/logo.png',
      });
    }

    // Toast notification (in-app)
    toast({
      title,
      description,
      variant,
      duration: 5000,
    });

    // Emit event for other components to react (updates ring bell, etc.)
    notificationEvents.emit('notification', { title, description, type, timestamp: Date.now() });

    // Update badge count
    setUnreadCount(prev => {
      const newCount = prev + 1;
      updateAppBadge(newCount);
      return newCount;
    });
  };

  const updateUnreadCount = async () => {
    if (!userProfile?.id) return;

    try {
      // Count unread messages
      const { count: messageCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userProfile.id)
        .eq('is_read', false);

      // Count unread notifications
      const { count: notifCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userProfile.id)
        .eq('is_read', false);

      const totalCount = (messageCount || 0) + (notifCount || 0);
      setUnreadCount(totalCount);
      updateAppBadge(totalCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  };

  const value = {
    unreadCount,
    notifications,
    playNotificationSound,
    showNotification,
    requestNotificationPermission,
    updateUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
