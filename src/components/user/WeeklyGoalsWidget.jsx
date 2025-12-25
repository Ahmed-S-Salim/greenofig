import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { Target, Plus, Trash2, CheckCircle, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const WeeklyGoalsWidget = () => {
  const { userProfile } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newGoal, setNewGoal] = useState({
    goal_description: '',
    target_metric: '',
    target_value: '',
  });

  // Get current week dates
  const getWeekDates = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return {
      start: startOfWeek.toISOString().split('T')[0],
      end: endOfWeek.toISOString().split('T')[0],
    };
  };

  useEffect(() => {
    if (userProfile?.id) {
      fetchWeeklyGoals();
    }
  }, [userProfile?.id]);

  const fetchWeeklyGoals = async () => {
    try {
      const { start, end } = getWeekDates();

      const { data, error } = await supabase
        .from('weekly_goals')
        .select('*')
        .eq('user_id', userProfile.id)
        .eq('week_start_date', start)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching weekly goals:', error);
        return;
      }

      setGoals(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchWeeklyGoals:', error);
      setLoading(false);
    }
  };

  const addGoal = async () => {
    if (!newGoal.goal_description.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a goal description',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { start, end } = getWeekDates();

      const { data, error } = await supabase
        .from('weekly_goals')
        .insert({
          user_id: userProfile.id,
          week_start_date: start,
          week_end_date: end,
          goal_description: newGoal.goal_description,
          target_metric: newGoal.target_metric || null,
          target_value: newGoal.target_value ? parseFloat(newGoal.target_value) : null,
          current_value: 0,
          completed: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding goal:', error);
        toast({
          title: 'Error',
          description: 'Failed to add goal',
          variant: 'destructive',
        });
        return;
      }

      setGoals(prev => [data, ...prev]);
      setNewGoal({ goal_description: '', target_metric: '', target_value: '' });
      setShowAddDialog(false);
      toast({
        title: '🎯 Goal Added!',
        description: 'Your weekly goal has been set',
      });
    } catch (error) {
      console.error('Error in addGoal:', error);
    }
  };

  const toggleGoalCompletion = async (goal) => {
    const newCompletedStatus = !goal.completed;

    // Optimistic update
    setGoals(prev =>
      prev.map(g => (g.id === goal.id ? { ...g, completed: newCompletedStatus } : g))
    );

    try {
      const { error } = await supabase
        .from('weekly_goals')
        .update({
          completed: newCompletedStatus,
          current_value: newCompletedStatus ? goal.target_value : goal.current_value,
          updated_at: new Date().toISOString(),
        })
        .eq('id', goal.id);

      if (error) {
        console.error('Error updating goal:', error);
        // Revert on error
        setGoals(prev =>
          prev.map(g => (g.id === goal.id ? { ...g, completed: !newCompletedStatus } : g))
        );
        toast({
          title: 'Error',
          description: 'Failed to update goal',
          variant: 'destructive',
        });
      } else if (newCompletedStatus) {
        toast({
          title: '🎉 Goal Completed!',
          description: 'Congratulations on achieving your goal!',
        });
      }
    } catch (error) {
      console.error('Error in toggleGoalCompletion:', error);
    }
  };

  const deleteGoal = async (goalId) => {
    try {
      const { error } = await supabase
        .from('weekly_goals')
        .delete()
        .eq('id', goalId);

      if (error) {
        console.error('Error deleting goal:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete goal',
          variant: 'destructive',
        });
        return;
      }

      setGoals(prev => prev.filter(g => g.id !== goalId));
      toast({
        title: 'Goal Deleted',
        description: 'Your goal has been removed',
      });
    } catch (error) {
      console.error('Error in deleteGoal:', error);
    }
  };

  const getProgressPercentage = (goal) => {
    if (!goal.target_value) return 0;
    return Math.min(Math.round((goal.current_value / goal.target_value) * 100), 100);
  };

  const completedGoals = goals.filter(g => g.completed).length;
  const totalGoals = goals.length;

  if (loading) {
    return (
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Weekly Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Weekly Goals
          </CardTitle>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Weekly Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="goal-description">Goal Description *</Label>
                  <Input
                    id="goal-description"
                    placeholder="e.g., Lose 2 lbs this week"
                    value={newGoal.goal_description}
                    onChange={(e) =>
                      setNewGoal(prev => ({ ...prev, goal_description: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target-metric">Target Metric (Optional)</Label>
                  <Input
                    id="target-metric"
                    placeholder="e.g., Weight, Workouts, Steps"
                    value={newGoal.target_metric}
                    onChange={(e) =>
                      setNewGoal(prev => ({ ...prev, target_metric: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target-value">Target Value (Optional)</Label>
                  <Input
                    id="target-value"
                    type="number"
                    placeholder="e.g., 5 (for 5 workouts)"
                    value={newGoal.target_value}
                    onChange={(e) =>
                      setNewGoal(prev => ({ ...prev, target_value: e.target.value }))
                    }
                  />
                </div>
                <Button onClick={addGoal} className="w-full">
                  Add Goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {totalGoals > 0 && (
          <div className="text-sm text-muted-foreground mt-2">
            {completedGoals} of {totalGoals} goals completed this week
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence>
          {goals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No weekly goals set yet</p>
              <p className="text-xs mt-1">Click "Add Goal" to get started!</p>
            </div>
          ) : (
            goals.map((goal, index) => {
              const progress = getProgressPercentage(goal);

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-lg border ${
                    goal.completed
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-muted border-border'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`font-semibold ${
                            goal.completed ? 'line-through text-muted-foreground' : ''
                          }`}
                        >
                          {goal.goal_description}
                        </h4>
                        {goal.completed && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      {goal.target_metric && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Target: {goal.target_value} {goal.target_metric}
                        </div>
                      )}
                      {goal.target_value && !goal.completed && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-semibold text-primary">{progress}%</span>
                          </div>
                          <div className="h-1.5 bg-muted-foreground/20 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-primary"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={goal.completed ? 'outline' : 'default'}
                        onClick={() => toggleGoalCompletion(goal)}
                      >
                        {goal.completed ? 'Undo' : 'Complete'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteGoal(goal.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default WeeklyGoalsWidget;
