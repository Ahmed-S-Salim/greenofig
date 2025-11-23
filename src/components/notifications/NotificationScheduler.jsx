import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import {
  Bell,
  Calendar,
  Clock,
  Coffee,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Utensils,
  Dumbbell,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  Repeat,
  TrendingUp,
  Target,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MEAL_TYPES = [
  { id: 'breakfast', name: 'Breakfast', icon: Sunrise, color: 'text-orange-500', defaultTime: '08:00' },
  { id: 'morning_snack', name: 'Morning Snack', icon: Coffee, color: 'text-amber-500', defaultTime: '10:30' },
  { id: 'lunch', name: 'Lunch', icon: Sun, color: 'text-yellow-500', defaultTime: '12:30' },
  { id: 'afternoon_snack', name: 'Afternoon Snack', icon: Coffee, color: 'text-orange-400', defaultTime: '15:30' },
  { id: 'dinner', name: 'Dinner', icon: Sunset, color: 'text-purple-500', defaultTime: '19:00' },
  { id: 'evening_snack', name: 'Evening Snack', icon: Moon, color: 'text-indigo-500', defaultTime: '21:00' }
];

const WORKOUT_TYPES = [
  { id: 'morning_workout', name: 'Morning Workout', icon: Dumbbell, color: 'text-blue-600', defaultTime: '06:00' },
  { id: 'afternoon_workout', name: 'Afternoon Workout', icon: Dumbbell, color: 'text-green-600', defaultTime: '17:00' },
  { id: 'evening_workout', name: 'Evening Workout', icon: Dumbbell, color: 'text-purple-600', defaultTime: '20:00' }
];

const REMINDER_MESSAGES = {
  breakfast: [
    "Good morning! Time for breakfast to kickstart your day! 🌅",
    "Rise and shine! Don't skip the most important meal! 🍳",
    "Start your day right with a nutritious breakfast! ☀️"
  ],
  lunch: [
    "Lunch time! Refuel your body with healthy food! 🥗",
    "Time to take a break and enjoy a balanced lunch! 🍱",
    "Midday meal reminder - keep your energy up! 🥙"
  ],
  dinner: [
    "Dinner time! End your day with a nutritious meal! 🌙",
    "Time to wind down with a healthy dinner! 🍽️",
    "Evening meal reminder - don't go to bed hungry! 🌆"
  ],
  snack: [
    "Snack time! Keep your metabolism going! 🍎",
    "Healthy snack reminder - fuel between meals! 🥜",
    "Time for a nutritious snack! 🥕"
  ],
  workout: [
    "Workout time! Let's get moving! 💪",
    "Time to exercise - your body will thank you! 🏃",
    "Don't skip your workout! Let's do this! 🔥"
  ]
};

const DAYS_OF_WEEK = [
  { id: 'monday', name: 'Mon', fullName: 'Monday' },
  { id: 'tuesday', name: 'Tue', fullName: 'Tuesday' },
  { id: 'wednesday', name: 'Wed', fullName: 'Wednesday' },
  { id: 'thursday', name: 'Thu', fullName: 'Thursday' },
  { id: 'friday', name: 'Fri', fullName: 'Friday' },
  { id: 'saturday', name: 'Sat', fullName: 'Saturday' },
  { id: 'sunday', name: 'Sun', fullName: 'Sunday' }
];

const NotificationScheduler = ({ userId, userTier = 'base' }) => {
  const [scheduledReminders, setScheduledReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);

  // Form state
  const [reminderType, setReminderType] = useState('meal'); // 'meal' or 'workout'
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [selectedWorkoutType, setSelectedWorkoutType] = useState('morning_workout');
  const [reminderTime, setReminderTime] = useState('08:00');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedDays, setSelectedDays] = useState(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchScheduledReminders();
    }
  }, [userId]);

  const fetchScheduledReminders = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('scheduled_reminders')
        .select('*')
        .eq('user_id', userId)
        .order('reminder_time', { ascending: true });

      if (error) throw error;

      setScheduledReminders(data || []);
    } catch (error) {
      console.error('Error fetching scheduled reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setEditingReminder(null);
    setShowCreateDialog(true);
  };

  const openEditDialog = (reminder) => {
    setEditingReminder(reminder);
    setReminderType(reminder.reminder_type);
    if (reminder.reminder_type === 'meal') {
      setSelectedMealType(reminder.meal_type);
    } else {
      setSelectedWorkoutType(reminder.workout_type);
    }
    setReminderTime(reminder.reminder_time);
    setCustomMessage(reminder.custom_message || '');
    setSelectedDays(reminder.days_of_week || []);
    setIsEnabled(reminder.is_enabled);
    setShowCreateDialog(true);
  };

  const resetForm = () => {
    setReminderType('meal');
    setSelectedMealType('breakfast');
    setSelectedWorkoutType('morning_workout');
    setReminderTime('08:00');
    setCustomMessage('');
    setSelectedDays(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
    setIsEnabled(true);
  };

  const toggleDay = (dayId) => {
    setSelectedDays(prev =>
      prev.includes(dayId)
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId]
    );
  };

  const getRandomMessage = (type) => {
    const messageCategory = type.includes('snack') ? 'snack'
      : type.includes('workout') ? 'workout'
      : type.replace('_', ' ');

    const messages = REMINDER_MESSAGES[messageCategory] || REMINDER_MESSAGES.snack;
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const saveReminder = async () => {
    try {
      const reminderData = {
        user_id: userId,
        reminder_type: reminderType,
        meal_type: reminderType === 'meal' ? selectedMealType : null,
        workout_type: reminderType === 'workout' ? selectedWorkoutType : null,
        reminder_time: reminderTime,
        custom_message: customMessage || null,
        days_of_week: selectedDays,
        is_enabled: isEnabled
      };

      if (editingReminder) {
        const { error } = await supabase
          .from('scheduled_reminders')
          .update(reminderData)
          .eq('id', editingReminder.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('scheduled_reminders')
          .insert(reminderData);

        if (error) throw error;
      }

      await fetchScheduledReminders();
      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      console.error('Error saving reminder:', error);
      alert('Failed to save reminder. Please try again.');
    }
  };

  const toggleReminderStatus = async (reminderId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('scheduled_reminders')
        .update({ is_enabled: !currentStatus })
        .eq('id', reminderId);

      if (error) throw error;

      await fetchScheduledReminders();
    } catch (error) {
      console.error('Error toggling reminder:', error);
    }
  };

  const deleteReminder = async (reminderId) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;

    try {
      const { error } = await supabase
        .from('scheduled_reminders')
        .delete()
        .eq('id', reminderId);

      if (error) throw error;

      await fetchScheduledReminders();
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const createQuickReminders = async () => {
    if (!confirm('This will create default reminders for breakfast, lunch, dinner, and morning workout. Continue?')) return;

    try {
      const quickReminders = [
        {
          user_id: userId,
          reminder_type: 'meal',
          meal_type: 'breakfast',
          reminder_time: '08:00',
          days_of_week: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          is_enabled: true
        },
        {
          user_id: userId,
          reminder_type: 'meal',
          meal_type: 'lunch',
          reminder_time: '12:30',
          days_of_week: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          is_enabled: true
        },
        {
          user_id: userId,
          reminder_type: 'meal',
          meal_type: 'dinner',
          reminder_time: '19:00',
          days_of_week: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          is_enabled: true
        },
        {
          user_id: userId,
          reminder_type: 'workout',
          workout_type: 'morning_workout',
          reminder_time: '06:00',
          days_of_week: ['monday', 'wednesday', 'friday'],
          is_enabled: true
        }
      ];

      const { error } = await supabase
        .from('scheduled_reminders')
        .insert(quickReminders);

      if (error) throw error;

      await fetchScheduledReminders();
    } catch (error) {
      console.error('Error creating quick reminders:', error);
      alert('Failed to create quick reminders.');
    }
  };

  const getMealTypeConfig = (mealType) => {
    return MEAL_TYPES.find(m => m.id === mealType) || MEAL_TYPES[0];
  };

  const getWorkoutTypeConfig = (workoutType) => {
    return WORKOUT_TYPES.find(w => w.id === workoutType) || WORKOUT_TYPES[0];
  };

  const mealReminders = scheduledReminders.filter(r => r.reminder_type === 'meal');
  const workoutReminders = scheduledReminders.filter(r => r.reminder_type === 'workout');

  // Tier restrictions
  const maxReminders = userTier === 'base' ? 3 : userTier === 'premium' ? 10 : 999;
  const canAddMore = scheduledReminders.length < maxReminders;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <Clock className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading scheduled reminders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>Scheduled Reminders</CardTitle>
                <CardDescription>
                  Set up automatic reminders for meals and workouts
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              {scheduledReminders.length === 0 && (
                <Button
                  variant="outline"
                  onClick={createQuickReminders}
                >
                  <Repeat className="w-4 h-4 mr-2" />
                  Quick Setup
                </Button>
              )}
              <Button
                onClick={openCreateDialog}
                disabled={!canAddMore}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Reminder
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tier Limit Warning */}
      {!canAddMore && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-orange-900 mb-1">
                  Reminder Limit Reached
                </h4>
                <p className="text-sm text-orange-700">
                  You've reached the maximum of {maxReminders} reminders for your {userTier} tier.
                  {userTier === 'base' && ' Upgrade to Premium for up to 10 reminders!'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meal Reminders */}
      {mealReminders.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-green-600" />
              <CardTitle className="text-lg">Meal Reminders</CardTitle>
              <Badge variant="outline">{mealReminders.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <AnimatePresence>
              {mealReminders.map((reminder, index) => {
                const mealConfig = getMealTypeConfig(reminder.meal_type);
                const MealIcon = mealConfig.icon;

                return (
                  <motion.div
                    key={reminder.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      reminder.is_enabled
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-full bg-white border-2 flex items-center justify-center ${mealConfig.color}`}>
                          <MealIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{mealConfig.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {reminder.reminder_time}
                            </Badge>
                            {!reminder.is_enabled && (
                              <Badge variant="secondary">Paused</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {reminder.custom_message || getRandomMessage(reminder.meal_type)}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {DAYS_OF_WEEK.map(day => {
                              const isActive = reminder.days_of_week?.includes(day.id);
                              return (
                                <span
                                  key={day.id}
                                  className={`text-xs px-2 py-1 rounded ${
                                    isActive
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-gray-100 text-gray-400'
                                  }`}
                                >
                                  {day.name}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                        <Switch
                          checked={reminder.is_enabled}
                          onCheckedChange={() => toggleReminderStatus(reminder.id, reminder.is_enabled)}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(reminder)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteReminder(reminder.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}

      {/* Workout Reminders */}
      {workoutReminders.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg">Workout Reminders</CardTitle>
              <Badge variant="outline">{workoutReminders.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <AnimatePresence>
              {workoutReminders.map((reminder, index) => {
                const workoutConfig = getWorkoutTypeConfig(reminder.workout_type);
                const WorkoutIcon = workoutConfig.icon;

                return (
                  <motion.div
                    key={reminder.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      reminder.is_enabled
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-full bg-white border-2 flex items-center justify-center ${workoutConfig.color}`}>
                          <WorkoutIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{workoutConfig.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {reminder.reminder_time}
                            </Badge>
                            {!reminder.is_enabled && (
                              <Badge variant="secondary">Paused</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {reminder.custom_message || getRandomMessage('workout')}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {DAYS_OF_WEEK.map(day => {
                              const isActive = reminder.days_of_week?.includes(day.id);
                              return (
                                <span
                                  key={day.id}
                                  className={`text-xs px-2 py-1 rounded ${
                                    isActive
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-gray-100 text-gray-400'
                                  }`}
                                >
                                  {day.name}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                        <Switch
                          checked={reminder.is_enabled}
                          onCheckedChange={() => toggleReminderStatus(reminder.id, reminder.is_enabled)}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(reminder)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteReminder(reminder.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {scheduledReminders.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reminders Set</h3>
            <p className="text-gray-600 mb-6">
              Create reminders to stay on track with your meals and workouts.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={createQuickReminders}
              >
                <Repeat className="w-4 h-4 mr-2" />
                Quick Setup
              </Button>
              <Button
                onClick={openCreateDialog}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Custom Reminder
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingReminder ? 'Edit Reminder' : 'Create New Reminder'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Reminder Type */}
            <div className="space-y-2">
              <Label>Reminder Type</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setReminderType('meal')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    reminderType === 'meal'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Utensils className={`w-6 h-6 mx-auto mb-2 ${reminderType === 'meal' ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium">Meal</span>
                </button>
                <button
                  onClick={() => setReminderType('workout')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    reminderType === 'workout'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Dumbbell className={`w-6 h-6 mx-auto mb-2 ${reminderType === 'workout' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium">Workout</span>
                </button>
              </div>
            </div>

            {/* Meal/Workout Type Selection */}
            {reminderType === 'meal' ? (
              <div className="space-y-2">
                <Label>Meal Type</Label>
                <Select value={selectedMealType} onValueChange={setSelectedMealType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEAL_TYPES.map(meal => {
                      const MealIcon = meal.icon;
                      return (
                        <SelectItem key={meal.id} value={meal.id}>
                          <div className="flex items-center gap-2">
                            <MealIcon className={`w-4 h-4 ${meal.color}`} />
                            {meal.name}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Workout Type</Label>
                <Select value={selectedWorkoutType} onValueChange={setSelectedWorkoutType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WORKOUT_TYPES.map(workout => {
                      const WorkoutIcon = workout.icon;
                      return (
                        <SelectItem key={workout.id} value={workout.id}>
                          <div className="flex items-center gap-2">
                            <WorkoutIcon className={`w-4 h-4 ${workout.color}`} />
                            {workout.name}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Reminder Time */}
            <div className="space-y-2">
              <Label>Reminder Time</Label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Days of Week */}
            <div className="space-y-2">
              <Label>Repeat On</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map(day => {
                  const isSelected = selectedDays.includes(day.id);
                  return (
                    <button
                      key={day.id}
                      onClick={() => toggleDay(day.id)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {day.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Message */}
            <div className="space-y-2">
              <Label>Custom Message (Optional)</Label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder={getRandomMessage(reminderType === 'meal' ? selectedMealType : 'workout')}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 min-h-[80px]"
                maxLength={200}
              />
              <p className="text-xs text-gray-500">
                {customMessage.length}/200 characters
              </p>
            </div>

            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-200">
              <div>
                <Label className="text-base">Enable Reminder</Label>
                <p className="text-sm text-gray-600">
                  Start receiving this reminder immediately
                </p>
              </div>
              <Switch
                checked={isEnabled}
                onCheckedChange={setIsEnabled}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={saveReminder}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={selectedDays.length === 0}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {editingReminder ? 'Save Changes' : 'Create Reminder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationScheduler;
