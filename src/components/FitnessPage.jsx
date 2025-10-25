import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Dumbbell, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const FitnessPage = ({ user }) => {
  const workouts = [
    { id: 1, name: 'Morning Cardio', duration: '30 min', calories: 250, type: 'Cardio' },
    { id: 2, name: 'Upper Body Strength', duration: '45 min', calories: 320, type: 'Strength' },
    { id: 3, name: 'Yoga & Stretching', duration: '20 min', calories: 80, type: 'Flexibility' },
  ];

  const handleStartWorkout = () => {
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">Fitness Tracker</h1>
        <p className="text-purple-300 text-lg">Your personalized workout routines</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-xl p-6 shadow-xl"
        >
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-sm text-purple-300 mb-1">Workouts This Week</h3>
          <p className="text-3xl font-bold">5</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-effect rounded-xl p-6 shadow-xl"
        >
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-sm text-purple-300 mb-1">Calories Burned</h3>
          <p className="text-3xl font-bold">1,850</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-xl p-6 shadow-xl"
        >
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mb-4">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-sm text-purple-300 mb-1">Active Minutes</h3>
          <p className="text-3xl font-bold">245</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-effect rounded-xl p-6 shadow-xl"
      >
        <h2 className="text-2xl font-bold mb-6">Recommended Workouts</h2>
        <div className="space-y-4">
          {workouts.map((workout, index) => (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold text-white text-lg mb-1">{workout.name}</h3>
                <div className="flex gap-4 text-sm">
                  <span className="text-purple-300">Duration: <span className="text-white font-semibold">{workout.duration}</span></span>
                  <span className="text-purple-300">Calories: <span className="text-white font-semibold">{workout.calories}</span></span>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">{workout.type}</span>
                </div>
              </div>
              <Button
                onClick={handleStartWorkout}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <Play className="w-4 h-4 mr-2" />
                Start
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default FitnessPage;