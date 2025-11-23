import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Bell,
  BellRing,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Send,
  User,
  MessageSquare,
  Target,
  TrendingUp,
  X,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const REMINDER_TYPES = [
  {
    id: 'weekly-checkin',
    name: 'Weekly Check-in',
    icon: Calendar,
    color: 'bg-blue-100 text-blue-700',
    description: 'Regular weekly progress check'
  },
  {
    id: 'goal-review',
    name: 'Goal Review',
    icon: Target,
    color: 'bg-purple-100 text-purple-700',
    description: 'Review and adjust client goals'
  },
  {
    id: 'inactive-followup',
    name: 'Inactive Follow-up',
    icon: AlertCircle,
    color: 'bg-red-100 text-red-700',
    description: 'Reach out to inactive clients'
  },
  {
    id: 'progress-celebration',
    name: 'Progress Celebration',
    icon: TrendingUp,
    color: 'bg-green-100 text-green-700',
    description: 'Celebrate client achievements'
  },
  {
    id: 'custom',
    name: 'Custom Reminder',
    icon: MessageSquare,
    color: 'bg-gray-100 text-gray-700',
    description: 'Custom follow-up reminder'
  }
];

const RECURRENCE_OPTIONS = [
  { value: 'once', label: 'One-time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' }
];

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-700' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' }
];

const FollowUpReminders = ({ nutritionistId, compact = false }) => {
  const [reminders, setReminders] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, completed, overdue

  const [newReminder, setNewReminder] = useState({
    client_id: '',
    reminder_type: 'weekly-checkin',
    title: '',
    description: '',
    due_date: '',
    recurrence: 'once',
    priority: 'medium',
    auto_send_message: false,
    message_template: ''
  });

  useEffect(() => {
    if (nutritionistId) {
      fetchReminders();
      fetchClients();
    }
  }, [nutritionistId]);

  useEffect(() => {
    // Check for overdue reminders every minute
    const interval = setInterval(() => {
      checkOverdueReminders();
    }, 60000);

    return () => clearInterval(interval);
  }, [reminders]);

  const fetchReminders = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('follow_up_reminders')
        .select(`
          *,
          user_profiles (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('nutritionist_id', nutritionistId)
        .order('due_date', { ascending: true });

      if (error) throw error;

      setReminders(data || []);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('nutritionist_clients')
        .select(`
          client_id,
          user_profiles (
            id,
            full_name,
            email
          )
        `)
        .eq('nutritionist_id', nutritionistId);

      if (error) throw error;

      const clientsData = data.map(item => ({
        id: item.user_profiles.id,
        name: item.user_profiles.full_name,
        email: item.user_profiles.email
      }));

      setClients(clientsData);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const createReminder = async () => {
    try {
      const { error } = await supabase
        .from('follow_up_reminders')
        .insert({
          nutritionist_id: nutritionistId,
          client_id: newReminder.client_id,
          reminder_type: newReminder.reminder_type,
          title: newReminder.title,
          description: newReminder.description,
          due_date: newReminder.due_date,
          recurrence: newReminder.recurrence,
          priority: newReminder.priority,
          status: 'pending',
          auto_send_message: newReminder.auto_send_message,
          message_template: newReminder.message_template
        });

      if (error) throw error;

      // Reset form
      setNewReminder({
        client_id: '',
        reminder_type: 'weekly-checkin',
        title: '',
        description: '',
        due_date: '',
        recurrence: 'once',
        priority: 'medium',
        auto_send_message: false,
        message_template: ''
      });

      setShowCreateDialog(false);
      await fetchReminders();
    } catch (error) {
      console.error('Error creating reminder:', error);
      alert('Failed to create reminder');
    }
  };

  const updateReminder = async (reminderId, updates) => {
    try {
      const { error } = await supabase
        .from('follow_up_reminders')
        .update(updates)
        .eq('id', reminderId);

      if (error) throw error;

      setEditingReminder(null);
      await fetchReminders();
    } catch (error) {
      console.error('Error updating reminder:', error);
    }
  };

  const deleteReminder = async (reminderId) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;

    try {
      const { error } = await supabase
        .from('follow_up_reminders')
        .delete()
        .eq('id', reminderId);

      if (error) throw error;

      await fetchReminders();
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const completeReminder = async (reminder) => {
    try {
      // Mark as completed
      await updateReminder(reminder.id, {
        status: 'completed',
        completed_at: new Date().toISOString()
      });

      // If recurring, create next instance
      if (reminder.recurrence !== 'once') {
        const nextDate = calculateNextDate(reminder.due_date, reminder.recurrence);

        await supabase.from('follow_up_reminders').insert({
          nutritionist_id: nutritionistId,
          client_id: reminder.client_id,
          reminder_type: reminder.reminder_type,
          title: reminder.title,
          description: reminder.description,
          due_date: nextDate,
          recurrence: reminder.recurrence,
          priority: reminder.priority,
          status: 'pending',
          auto_send_message: reminder.auto_send_message,
          message_template: reminder.message_template
        });
      }

      await fetchReminders();
    } catch (error) {
      console.error('Error completing reminder:', error);
    }
  };

  const snoozeReminder = async (reminderId, hours) => {
    try {
      const newDate = new Date();
      newDate.setHours(newDate.getHours() + hours);

      await updateReminder(reminderId, {
        due_date: newDate.toISOString(),
        status: 'snoozed'
      });
    } catch (error) {
      console.error('Error snoozing reminder:', error);
    }
  };

  const calculateNextDate = (currentDate, recurrence) => {
    const date = new Date(currentDate);

    switch (recurrence) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'biweekly':
        date.setDate(date.getDate() + 14);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      default:
        break;
    }

    return date.toISOString();
  };

  const checkOverdueReminders = () => {
    const now = new Date();
    const updated = reminders.map(reminder => {
      if (
        reminder.status === 'pending' &&
        new Date(reminder.due_date) < now
      ) {
        return { ...reminder, status: 'overdue' };
      }
      return reminder;
    });

    if (JSON.stringify(updated) !== JSON.stringify(reminders)) {
      setReminders(updated);
    }
  };

  const filteredReminders = reminders.filter(reminder => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return reminder.status === 'pending';
    if (filterStatus === 'completed') return reminder.status === 'completed';
    if (filterStatus === 'overdue') return reminder.status === 'overdue';
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-700';
      case 'overdue':
        return 'bg-red-100 text-red-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'snoozed':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTimeUntilDue = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due - now;

    if (diff < 0) return 'Overdue';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return 'Due soon';
  };

  if (compact) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="w-5 h-5" />
            Upcoming Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {reminders.slice(0, 3).map(reminder => (
              <div key={reminder.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <p className="text-sm font-medium">{reminder.title}</p>
                  <p className="text-xs text-gray-600">{reminder.user_profiles.full_name}</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {getTimeUntilDue(reminder.due_date)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BellRing className="w-6 h-6" />
                Follow-up Reminders
              </CardTitle>
              <CardDescription>
                Schedule and manage client follow-up reminders
              </CardDescription>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Reminder
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Follow-up Reminder</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Client</label>
                    <Select
                      value={newReminder.client_id}
                      onValueChange={(value) => setNewReminder({ ...newReminder, client_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} ({client.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Reminder Type</label>
                    <Select
                      value={newReminder.reminder_type}
                      onValueChange={(value) => setNewReminder({ ...newReminder, reminder_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REMINDER_TYPES.map(type => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Title</label>
                    <Input
                      placeholder="e.g., Weekly check-in with Sarah"
                      value={newReminder.title}
                      onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Description</label>
                    <Textarea
                      placeholder="Notes about this follow-up..."
                      rows={3}
                      value={newReminder.description}
                      onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Due Date & Time</label>
                      <Input
                        type="datetime-local"
                        value={newReminder.due_date}
                        onChange={(e) => setNewReminder({ ...newReminder, due_date: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Recurrence</label>
                      <Select
                        value={newReminder.recurrence}
                        onValueChange={(value) => setNewReminder({ ...newReminder, recurrence: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RECURRENCE_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Priority</label>
                    <Select
                      value={newReminder.priority}
                      onValueChange={(value) => setNewReminder({ ...newReminder, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITY_LEVELS.map(level => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={createReminder}
                    disabled={!newReminder.client_id || !newReminder.title || !newReminder.due_date}
                  >
                    Create Reminder
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All Reminders' },
              { value: 'pending', label: 'Pending' },
              { value: 'overdue', label: 'Overdue' },
              { value: 'completed', label: 'Completed' }
            ].map(filter => (
              <Button
                key={filter.value}
                size="sm"
                variant={filterStatus === filter.value ? 'default' : 'outline'}
                onClick={() => setFilterStatus(filter.value)}
              >
                {filter.label}
                <Badge variant="secondary" className="ml-2">
                  {reminders.filter(r =>
                    filter.value === 'all' ? true : r.status === filter.value
                  ).length}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reminders List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filterStatus === 'all' ? 'All Reminders' : `${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} Reminders`}
            {' '}({filteredReminders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading reminders...</div>
          ) : filteredReminders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No {filterStatus !== 'all' && filterStatus} reminders found
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredReminders.map((reminder, index) => {
                  const reminderType = REMINDER_TYPES.find(t => t.id === reminder.reminder_type);
                  const priorityLevel = PRIORITY_LEVELS.find(p => p.value === reminder.priority);

                  return (
                    <motion.div
                      key={reminder.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className={`border rounded-lg p-4 ${
                        reminder.status === 'overdue' ? 'border-red-300 bg-red-50' : 'hover:shadow-md'
                      } transition-shadow`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`w-10 h-10 rounded-full ${reminderType.color} flex items-center justify-center flex-shrink-0`}>
                            <reminderType.icon className="w-5 h-5" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900">{reminder.title}</h4>
                              <Badge className={priorityLevel.color}>
                                {priorityLevel.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <User className="w-3 h-3" />
                              {reminder.user_profiles.full_name}
                            </div>
                            {reminder.description && (
                              <p className="text-sm text-gray-600 mb-2">{reminder.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(reminder.due_date).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(reminder.due_date).toLocaleTimeString()}
                              </div>
                              {reminder.recurrence !== 'once' && (
                                <Badge variant="outline" className="text-xs">
                                  {reminder.recurrence}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(reminder.status)}>
                            {reminder.status === 'pending' && getTimeUntilDue(reminder.due_date)}
                            {reminder.status === 'overdue' && 'Overdue'}
                            {reminder.status === 'completed' && 'Completed'}
                            {reminder.status === 'snoozed' && 'Snoozed'}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {reminder.status !== 'completed' && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => completeReminder(reminder)}
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Complete
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => snoozeReminder(reminder.id, 24)}
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              Snooze 24h
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingReminder(reminder)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteReminder(reminder.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FollowUpReminders;
