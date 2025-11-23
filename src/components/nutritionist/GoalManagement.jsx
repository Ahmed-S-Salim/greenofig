import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Target,
  Plus,
  TrendingUp,
  TrendingDown,
  Award,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit,
  Trash2,
  Eye,
  BarChart3
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, differenceInDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const GoalManagement = ({ clientId }) => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    goal_type: 'weight',
    title: '',
    description: '',
    target_value: '',
    current_value: '',
    unit: 'kg',
    difficulty: 'moderate',
    priority: 'medium',
    start_date: new Date().toISOString().split('T')[0],
    target_date: '',
  });

  useEffect(() => {
    if (clientId) {
      fetchGoals();
    }
  }, [clientId]);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('client_goals')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGoalProgress = async (goalId) => {
    try {
      const { data, error } = await supabase
        .from('goal_progress_updates')
        .select('*')
        .eq('goal_id', goalId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const chartData = data.map(update => ({
        date: format(new Date(update.created_at), 'MMM dd'),
        value: parseFloat(update.current_value),
        mood: update.mood
      }));

      setProgressData(chartData);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const handleCreateGoal = async () => {
    try {
      const { error } = await supabase
        .from('client_goals')
        .insert({
          client_id: clientId,
          nutritionist_id: user.id,
          ...formData,
          target_value: parseFloat(formData.target_value),
          current_value: parseFloat(formData.current_value)
        });

      if (error) throw error;

      // Create notification for client
      await supabase.rpc('create_notification', {
        p_user_id: clientId,
        p_type: 'goal_milestone',
        p_title: 'New Goal Set!',
        p_message: `Your nutritionist set a new goal: ${formData.title}`,
        p_action_url: '/app/progress',
        p_priority: 'normal'
      });

      await fetchGoals();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating goal:', error);
      alert('Failed to create goal');
    }
  };

  const handleUpdateGoalStatus = async (goalId, newStatus) => {
    try {
      const updateData = {
        status: newStatus
      };

      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
        updateData.progress_percentage = 100;
      }

      const { error } = await supabase
        .from('client_goals')
        .update(updateData)
        .eq('id', goalId);

      if (error) throw error;

      // Send achievement notification if completed
      if (newStatus === 'completed') {
        const goal = goals.find(g => g.id === goalId);

        await supabase.rpc('create_notification', {
          p_user_id: clientId,
          p_type: 'achievement',
          p_title: 'Goal Achieved! 🎉',
          p_message: `Congratulations on completing: ${goal.title}`,
          p_action_url: '/app/progress',
          p_priority: 'high'
        });

        // Create achievement badge
        await supabase
          .from('client_achievements')
          .insert({
            client_id: clientId,
            achievement_type: 'first_goal_completed',
            title: 'Goal Achiever',
            description: `Completed goal: ${goal.title}`,
            icon: 'trophy',
            points: 100
          });
      }

      await fetchGoals();
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const calculateProgress = (goal) => {
    if (!goal.target_value || !goal.current_value) return 0;

    const start = parseFloat(goal.current_value);
    const target = parseFloat(goal.target_value);
    const current = parseFloat(goal.current_value);

    if (goal.goal_type === 'weight' && start > target) {
      // Weight loss
      return Math.min(100, Math.max(0, ((start - current) / (start - target)) * 100));
    } else {
      // Weight gain or other metrics
      return Math.min(100, Math.max(0, ((current - start) / (target - start)) * 100));
    }
  };

  const getDaysRemaining = (targetDate) => {
    return differenceInDays(new Date(targetDate), new Date());
  };

  const resetForm = () => {
    setFormData({
      goal_type: 'weight',
      title: '',
      description: '',
      target_value: '',
      current_value: '',
      unit: 'kg',
      difficulty: 'moderate',
      priority: 'medium',
      start_date: new Date().toISOString().split('T')[0],
      target_date: '',
    });
    setCreateMode(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <Activity className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'paused':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'cancelled':
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Target className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const viewGoalDetails = (goal) => {
    setSelectedGoal(goal);
    fetchGoalProgress(goal.id);
    setCreateMode(false);
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setSelectedGoal(null);
    setCreateMode(true);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Goal Management
          </h2>
          <p className="text-text-secondary mt-1">Track and manage client goals</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Create Goal
        </Button>
      </div>

      {/* Goals Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Active Goals</p>
                <p className="text-2xl font-bold">{goals.filter(g => g.status === 'active').length}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Completed</p>
                <p className="text-2xl font-bold text-green-600">{goals.filter(g => g.status === 'completed').length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Avg Progress</p>
                <p className="text-2xl font-bold">
                  {goals.length > 0
                    ? Math.round(goals.reduce((acc, g) => acc + (g.progress_percentage || 0), 0) / goals.length)
                    : 0}%
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Achievements</p>
                <p className="text-2xl font-bold text-yellow-600">{goals.filter(g => g.status === 'completed').length * 100}</p>
              </div>
              <Award className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <div className="grid grid-cols-1 gap-4">
        {goals.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Target className="w-12 h-12 text-text-secondary mx-auto mb-4" />
              <p className="text-text-secondary mb-4">No goals set yet</p>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          goals.map((goal) => {
            const progress = goal.progress_percentage || calculateProgress(goal);
            const daysRemaining = getDaysRemaining(goal.target_date);
            const isOverdue = daysRemaining < 0 && goal.status === 'active';

            return (
              <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(goal.status)}
                        <h3 className="font-semibold text-lg">{goal.title}</h3>
                        <Badge variant={goal.status === 'completed' ? 'success' : goal.status === 'active' ? 'default' : 'secondary'}>
                          {goal.status}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(goal.priority)}>
                          {goal.priority} priority
                        </Badge>
                      </div>
                      {goal.description && (
                        <p className="text-sm text-text-secondary mb-3">{goal.description}</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewGoalDetails(goal)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">Progress</span>
                      <span className="font-semibold">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Goal Metrics */}
                  <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-text-secondary">Current</p>
                      <p className="text-sm font-semibold">{goal.current_value} {goal.unit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary">Target</p>
                      <p className="text-sm font-semibold">{goal.target_value} {goal.unit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary">
                        {isOverdue ? 'Overdue by' : 'Days left'}
                      </p>
                      <p className={`text-sm font-semibold ${isOverdue ? 'text-red-600' : ''}`}>
                        {Math.abs(daysRemaining)} days
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary">Deadline</p>
                      <p className="text-sm font-semibold">{format(new Date(goal.target_date), 'MMM dd')}</p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  {goal.status === 'active' && (
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateGoalStatus(goal.id, 'paused')}
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Pause
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleUpdateGoalStatus(goal.id, 'completed')}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark Complete
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Create/View Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{createMode ? 'Create New Goal' : 'Goal Details'}</DialogTitle>
            <DialogDescription>
              {createMode ? 'Set a SMART goal for your client' : 'View and manage goal progress'}
            </DialogDescription>
          </DialogHeader>

          {createMode ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Goal Type</label>
                  <Select value={formData.goal_type} onValueChange={(val) => setFormData({ ...formData, goal_type: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weight">Weight</SelectItem>
                      <SelectItem value="body_fat">Body Fat %</SelectItem>
                      <SelectItem value="muscle_mass">Muscle Mass</SelectItem>
                      <SelectItem value="measurements">Measurements</SelectItem>
                      <SelectItem value="habit">Habit Building</SelectItem>
                      <SelectItem value="nutrition">Nutrition Goal</SelectItem>
                      <SelectItem value="fitness">Fitness Goal</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Unit</label>
                  <Input
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="kg, %, cm, etc."
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Goal Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Lose 10kg in 3 months"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed goal description..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Current Value</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.current_value}
                    onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                    placeholder="75.5"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Target Value</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.target_value}
                    onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                    placeholder="65.0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Target Date</label>
                  <Input
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Difficulty</label>
                  <Select value={formData.difficulty} onValueChange={(val) => setFormData({ ...formData, difficulty: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="challenging">Challenging</SelectItem>
                      <SelectItem value="very_challenging">Very Challenging</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={formData.priority} onValueChange={(val) => setFormData({ ...formData, priority: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ) : (
            selectedGoal && (
              <div className="space-y-6">
                {/* Goal Header */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(selectedGoal.status)}
                    <h3 className="font-bold text-xl">{selectedGoal.title}</h3>
                    <Badge variant={selectedGoal.status === 'completed' ? 'success' : 'default'}>
                      {selectedGoal.status}
                    </Badge>
                  </div>
                  {selectedGoal.description && (
                    <p className="text-sm text-text-secondary">{selectedGoal.description}</p>
                  )}
                </div>

                {/* Progress Chart */}
                {progressData.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-4">Progress Chart</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={progressData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <ReferenceLine
                          y={parseFloat(selectedGoal.target_value)}
                          label="Target"
                          stroke="green"
                          strokeDasharray="3 3"
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Goal Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-text-secondary mb-1">Current Value</p>
                    <p className="text-2xl font-bold">{selectedGoal.current_value} {selectedGoal.unit}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-text-secondary mb-1">Target Value</p>
                    <p className="text-2xl font-bold">{selectedGoal.target_value} {selectedGoal.unit}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-text-secondary mb-1">Progress</p>
                    <p className="text-2xl font-bold">{selectedGoal.progress_percentage || 0}%</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-text-secondary mb-1">Days Remaining</p>
                    <p className="text-2xl font-bold">
                      {getDaysRemaining(selectedGoal.target_date)} days
                    </p>
                  </div>
                </div>
              </div>
            )
          )}

          <DialogFooter>
            {createMode ? (
              <>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateGoal}>Create Goal</Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GoalManagement;
