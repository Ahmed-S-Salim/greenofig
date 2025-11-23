import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Trophy, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

const AchievementNotifications = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    if (user?.id) {
      // Subscribe to new achievements
      const channel = supabase
        .channel(`achievements-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'user_achievements',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            handleNewAchievement(payload.new);
          }
        )
        .subscribe();

      setSubscription(channel);

      return () => {
        if (subscription) {
          supabase.removeChannel(subscription);
        }
      };
    }
  }, [user]);

  const handleNewAchievement = (achievement) => {
    // Add to notifications queue
    setAchievements(prev => [...prev, { ...achievement, id: achievement.id || Date.now() }]);

    // Trigger confetti
    triggerCelebration(achievement.tier);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeAchievement(achievement.id || Date.now());
    }, 5000);
  };

  const triggerCelebration = (tier) => {
    const colors = {
      bronze: ['#CD7F32', '#8B4513'],
      silver: ['#C0C0C0', '#808080'],
      gold: ['#FFD700', '#FFA500'],
      platinum: ['#E5E4E2', '#9370DB']
    };

    const tierColors = colors[tier] || colors.gold;

    // Fire confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: tierColors
    });

    // Play celebration sound (optional)
    try {
      const audio = new Audio('/sounds/achievement-unlock.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Silent fail if sound doesn't exist
      });
    } catch (error) {
      // Silent fail
    }
  };

  const removeAchievement = (id) => {
    setAchievements(prev => prev.filter(a => a.id !== id));
  };

  const getTierGradient = (tier) => {
    switch (tier) {
      case 'bronze':
        return 'from-amber-600 to-amber-800';
      case 'silver':
        return 'from-gray-400 to-gray-600';
      case 'gold':
        return 'from-yellow-400 to-yellow-600';
      case 'platinum':
        return 'from-purple-400 to-purple-600';
      default:
        return 'from-blue-500 to-purple-600';
    }
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'bronze':
        return <Star className="w-6 h-6" />;
      case 'silver':
        return <Trophy className="w-6 h-6" />;
      case 'gold':
        return <Sparkles className="w-6 h-6" />;
      case 'platinum':
        return <Zap className="w-6 h-6" />;
      default:
        return <Trophy className="w-6 h-6" />;
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, x: 300, scale: 0.3 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.5 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20
            }}
            className="pointer-events-auto"
            style={{ zIndex: 50 + index }}
          >
            <div
              className={`relative overflow-hidden rounded-xl shadow-2xl bg-gradient-to-r ${getTierGradient(achievement.tier)} p-6 text-white`}
            >
              {/* Animated background effect */}
              <motion.div
                className="absolute inset-0 bg-white/10"
                animate={{
                  x: ['-100%', '100%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />

              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-white hover:bg-white/20 h-6 w-6"
                onClick={() => removeAchievement(achievement.id)}
              >
                <X className="w-4 h-4" />
              </Button>

              {/* Content */}
              <div className="relative flex items-start gap-4">
                {/* Icon */}
                <motion.div
                  className="flex-shrink-0 p-3 bg-white/20 rounded-full backdrop-blur-sm"
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 0.6,
                    times: [0, 0.5, 1]
                  }}
                >
                  {achievement.achievement_icon ? (
                    <span className="text-4xl">{achievement.achievement_icon}</span>
                  ) : (
                    getTierIcon(achievement.tier)
                  )}
                </motion.div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4" />
                    <p className="text-xs font-medium uppercase tracking-wider opacity-90">
                      Achievement Unlocked!
                    </p>
                  </div>

                  <h3 className="font-bold text-lg mb-1 truncate">
                    {achievement.achievement_name}
                  </h3>

                  <p className="text-sm opacity-90 mb-2 line-clamp-2">
                    {achievement.achievement_description}
                  </p>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm font-semibold">
                      <Zap className="w-4 h-4" />
                      <span>+{achievement.points_earned} XP</span>
                    </div>

                    <div className="flex items-center gap-1 text-xs uppercase tracking-wide font-medium bg-white/20 px-2 py-0.5 rounded">
                      {getTierIcon(achievement.tier)}
                      <span>{achievement.tier}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress bar animation */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 bg-white/50"
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 5, ease: 'linear' }}
                style={{ transformOrigin: 'left' }}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AchievementNotifications;
