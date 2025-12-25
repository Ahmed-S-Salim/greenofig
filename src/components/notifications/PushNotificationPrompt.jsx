import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellRing, X, Smartphone, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const PushNotificationPrompt = () => {
  const { userProfile } = useAuth();
  const {
    isSupported,
    permission,
    subscription,
    requestPermission,
    subscribeToPush
  } = usePushNotifications();

  const [showPrompt, setShowPrompt] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Only show prompt if:
    // 1. User is logged in
    // 2. Push is supported
    // 3. Permission not yet granted
    // 4. Not already subscribed
    // 5. Not dismissed this session
    // 6. Not dismissed permanently (localStorage)
    const permanentlyDismissed = localStorage.getItem('pushPromptDismissed');
    const lastDismissed = localStorage.getItem('pushPromptDismissedAt');

    // Show again after 7 days if dismissed
    const shouldShowAgain = lastDismissed
      ? (Date.now() - parseInt(lastDismissed)) > 7 * 24 * 60 * 60 * 1000
      : true;

    if (
      userProfile?.id &&
      isSupported &&
      permission !== 'granted' &&
      !subscription &&
      !dismissed &&
      !permanentlyDismissed &&
      shouldShowAgain
    ) {
      // Delay showing prompt by 3 seconds after page load
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [userProfile?.id, isSupported, permission, subscription, dismissed]);

  const handleEnable = async () => {
    setIsEnabling(true);
    try {
      const granted = await requestPermission();
      if (granted) {
        await subscribeToPush();
        setShowPrompt(false);
        // Show success feedback
      }
    } catch (error) {
      console.error('Error enabling push:', error);
    } finally {
      setIsEnabling(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowPrompt(false);
    localStorage.setItem('pushPromptDismissedAt', Date.now().toString());
  };

  const handleNeverShow = () => {
    setDismissed(true);
    setShowPrompt(false);
    localStorage.setItem('pushPromptDismissed', 'true');
  };

  // Don't render if permission already granted or not supported
  if (!isSupported || permission === 'granted' || subscription) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
        >
          <div className="bg-gradient-to-br from-primary/95 to-primary rounded-2xl shadow-2xl border border-primary-foreground/20 overflow-hidden">
            {/* Animated Bell Icon */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-3xl" />

            <div className="relative p-5">
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/20 transition-colors text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-4">
                {/* Animated Bell */}
                <motion.div
                  animate={{
                    rotate: [0, -10, 10, -10, 10, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                  className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center"
                >
                  <BellRing className="w-7 h-7 text-white" />
                </motion.div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white mb-1">
                    Stay Updated!
                  </h3>
                  <p className="text-sm text-white/80 mb-4">
                    Get instant notifications for messages, appointments, and health reminders - even when the app is closed.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={handleEnable}
                      disabled={isEnabling}
                      className="flex-1 bg-white text-primary hover:bg-white/90 font-semibold"
                    >
                      {isEnabling ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full mr-2"
                          />
                          Enabling...
                        </>
                      ) : (
                        <>
                          <Bell className="w-4 h-4 mr-2" />
                          Enable Notifications
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleDismiss}
                      variant="ghost"
                      className="text-white/80 hover:text-white hover:bg-white/10"
                    >
                      Later
                    </Button>
                  </div>

                  <button
                    onClick={handleNeverShow}
                    className="mt-3 text-xs text-white/50 hover:text-white/70 transition-colors"
                  >
                    Don't show again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PushNotificationPrompt;
