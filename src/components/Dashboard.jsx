import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Utensils, TrendingUp, Heart, Droplet, Moon, Gift } from 'lucide-react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import AdContainer from '@/components/ads/AdContainer';
import VideoAd from '@/components/ads/VideoAd';
import { Button } from '@/components/ui/button';

const Dashboard = ({ user }) => {
  const { hasAds } = useFeatureAccess();
  const [showVideoAd, setShowVideoAd] = useState(false);
  const [bonusMessages, setBonusMessages] = useState(0);

  const handleRewardEarned = () => {
    setBonusMessages(prev => prev + 1);
  };

  const stats = [
    { label: 'Calories Today', value: '1,850', target: '2,200', icon: Utensils, color: 'from-orange-500 to-red-500' },
    { label: 'Steps', value: '8,432', target: '10,000', icon: Activity, color: 'from-green-500 to-emerald-500' },
    { label: 'Water Intake', value: '6', target: '8 glasses', icon: Droplet, color: 'from-blue-500 to-cyan-500' },
    { label: 'Sleep', value: '7.5h', target: '8h', icon: Moon, color: 'from-purple-500 to-indigo-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Top Banner Ad - Only for Basic (free) users */}
      {hasAds && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <AdContainer placementName="top_banner" />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2" role="heading" aria-level="1">
          Welcome back, {user?.full_name || 'Friend'}!
        </h1>
        <p className="text-purple-300 text-lg">Here's your health overview for today</p>
        {bonusMessages > 0 && (
          <p className="text-green-400 text-sm mt-1">
            🎁 You have {bonusMessages} bonus AI message{bonusMessages > 1 ? 's' : ''} from watching ads!
          </p>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-effect rounded-xl p-6 shadow-xl transition-all duration-200"
              role="article"
              aria-label={`${stat.label}: ${stat.value} of ${stat.target}`}
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`} aria-hidden="true">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm text-purple-300 mb-1">{stat.label}</h3>
              <p className="text-3xl font-bold mb-1">{stat.value}</p>
              <p className="text-xs text-purple-400">Target: {stat.target}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Rewarded Video Ad Button - Only for Basic users */}
      {hasAds && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="glass-effect rounded-xl p-4 border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gift className="w-8 h-8 text-yellow-400" />
                <div>
                  <h3 className="font-semibold text-white">Earn Bonus Features!</h3>
                  <p className="text-sm text-yellow-200/80">Watch a short video to get +1 extra AI message</p>
                </div>
              </div>
              <Button
                onClick={() => setShowVideoAd(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
              >
                Watch Ad
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-effect rounded-xl p-6 shadow-xl"
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Heart className="w-6 h-6 text-pink-400" />
            Today's Goals
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-purple-200">Calorie Goal</span>
                <span className="text-white font-semibold">84%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '84%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-purple-200">Activity Goal</span>
                <span className="text-white font-semibold">84%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '84%' }}
                  transition={{ duration: 1, delay: 0.7 }}
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-purple-200">Hydration Goal</span>
                <span className="text-white font-semibold">75%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '75%' }}
                  transition={{ duration: 1, delay: 0.9 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-effect rounded-xl p-6 shadow-xl"
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-400" />
            Quick Actions
          </h2>
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              className="w-full p-4 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-lg text-left hover:from-purple-500/30 hover:to-indigo-500/30 transition-all duration-200 border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-background"
              aria-label="Log a meal to track your nutrition"
            >
              <p className="font-semibold text-white">Log a Meal</p>
              <p className="text-sm text-purple-300">Track your nutrition</p>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              className="w-full p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg text-left hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-200 border border-green-500/30 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2 focus:ring-offset-background"
              aria-label="Start workout to begin your exercise routine"
            >
              <p className="font-semibold text-white">Start Workout</p>
              <p className="text-sm text-green-300">Begin your exercise routine</p>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              className="w-full p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg text-left hover:from-blue-500/30 hover:to-cyan-500/30 transition-all duration-200 border border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-background"
              aria-label="Log water intake to stay hydrated"
            >
              <p className="font-semibold text-white">Log Water</p>
              <p className="text-sm text-blue-300">Stay hydrated</p>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Sidebar Ad - Only for Basic users */}
      {hasAds && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <AdContainer placementName="dashboard_sidebar" />
        </motion.div>
      )}

      {/* Video Ad Modal */}
      {showVideoAd && (
        <VideoAd
          placementName="rewarded_video"
          onClose={() => setShowVideoAd(false)}
          onRewardEarned={handleRewardEarned}
          rewardDescription="Get +1 bonus AI message"
        />
      )}
    </div>
  );
};

export default Dashboard;