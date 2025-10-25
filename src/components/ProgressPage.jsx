import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, Target } from 'lucide-react';

const ProgressPage = ({ user }) => {
  const achievements = [
    { id: 1, title: '7-Day Streak', description: 'Logged meals for 7 days straight', icon: '🔥', unlocked: true },
    { id: 2, title: 'First Workout', description: 'Completed your first workout', icon: '💪', unlocked: true },
    { id: 3, title: 'Hydration Hero', description: 'Met water goal for 5 days', icon: '💧', unlocked: false },
    { id: 4, title: 'Early Bird', description: 'Logged breakfast before 8 AM', icon: '🌅', unlocked: true },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">Your Progress</h1>
        <p className="text-purple-300 text-lg">Track your health journey</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-effect rounded-xl p-6 shadow-xl"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-400" />
            Weight Progress
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-purple-300">Starting Weight</span>
              <span className="text-white font-semibold text-lg">75 kg</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-300">Current Weight</span>
              <span className="text-white font-semibold text-lg">72 kg</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-300">Goal Weight</span>
              <span className="text-white font-semibold text-lg">68 kg</span>
            </div>
            <div className="mt-4 p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <p className="text-green-300 font-semibold">🎉 You've lost 3 kg!</p>
              <p className="text-sm text-green-400 mt-1">Keep up the great work!</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-effect rounded-xl p-6 shadow-xl"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-400" />
            Weekly Summary
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-purple-200">Workouts Completed</span>
                <span className="text-white font-semibold">5/5</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1 }}
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-purple-200">Nutrition Goals Met</span>
                <span className="text-white font-semibold">6/7</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '86%' }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-purple-200">Sleep Quality</span>
                <span className="text-white font-semibold">85%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '85%' }}
                  transition={{ duration: 1, delay: 0.4 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-effect rounded-xl p-6 shadow-xl"
      >
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Award className="w-6 h-6 text-yellow-400" />
          Achievements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className={`p-4 rounded-lg border ${
                achievement.unlocked
                  ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
                  : 'bg-white/5 border-white/10 opacity-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{achievement.icon}</span>
                <div>
                  <h3 className="font-semibold text-white">{achievement.title}</h3>
                  <p className="text-sm text-purple-300">{achievement.description}</p>
                  {achievement.unlocked && (
                    <span className="text-xs text-yellow-400 mt-1 inline-block">✓ Unlocked</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ProgressPage;