import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Utensils, Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const NutritionPage = ({ user }) => {
  const [meals, setMeals] = useState([
    { id: 1, name: 'Oatmeal with Berries', calories: 350, protein: 12, carbs: 58, fats: 8, time: 'Breakfast' },
    { id: 2, name: 'Grilled Chicken Salad', calories: 420, protein: 35, carbs: 25, fats: 18, time: 'Lunch' },
  ]);

  const handleAddMeal = () => {
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex justify-between items-center"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2">Nutrition Tracker</h1>
          <p className="text-purple-300 text-lg">Track your meals and macros</p>
        </div>
        <Button
          onClick={handleAddMeal}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Meal
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-xl p-6 shadow-xl"
        >
          <h3 className="text-sm text-purple-300 mb-2">Calories</h3>
          <p className="text-3xl font-bold mb-1">1,850</p>
          <p className="text-sm text-purple-400">of 2,200 kcal</p>
          <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '84%' }}
              transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-orange-500 to-red-500"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-effect rounded-xl p-6 shadow-xl"
        >
          <h3 className="text-sm text-purple-300 mb-2">Protein</h3>
          <p className="text-3xl font-bold mb-1">47g</p>
          <p className="text-sm text-purple-400">of 150g</p>
          <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '31%' }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-gradient-to-r from-pink-500 to-rose-500"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-xl p-6 shadow-xl"
        >
          <h3 className="text-sm text-purple-300 mb-2">Carbs</h3>
          <p className="text-3xl font-bold mb-1">83g</p>
          <p className="text-sm text-purple-400">of 220g</p>
          <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '38%' }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
            />
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
          <Calendar className="w-6 h-6 text-purple-400" />
          Today's Meals
        </h2>
        <div className="space-y-4">
          {meals.map((meal, index) => (
            <motion.div
              key={meal.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-white text-lg">{meal.name}</h3>
                  <p className="text-sm text-purple-300">{meal.time}</p>
                </div>
                <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm font-semibold">
                  {meal.calories} kcal
                </span>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-purple-300">Protein: <span className="text-white font-semibold">{meal.protein}g</span></span>
                <span className="text-purple-300">Carbs: <span className="text-white font-semibold">{meal.carbs}g</span></span>
                <span className="text-purple-300">Fats: <span className="text-white font-semibold">{meal.fats}g</span></span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default NutritionPage;