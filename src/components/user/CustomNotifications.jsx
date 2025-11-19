import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  BellOff,
  Plus,
  Trash2,
  Edit,
  Loader2,
  Clock,
  Repeat,
  Save,
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CustomNotifications = () => {
  const { t } = useTranslation();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'meal',
    time: '09:00',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    enabled: true,
    message: '',
  });

  useEffect(() => {
    if (userProfile?.id) {
      fetchNotifications();
    }
  }, [userProfile?.id]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('time', { ascending: true });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: t('error') || 'Error',
        description: t('failedToLoadNotifications') || 'Failed to load notifications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotification = async () => {
    try {
      if (editingNotification) {
        // Update existing notification
        const { error } = await supabase
          .from('user_notifications')
          .update({
            title: formData.title,
            type: formData.type,
            time: formData.time,
            days: formData.days,
            enabled: formData.enabled,
            message: formData.message,
          })
          .eq('id', editingNotification.id);

        if (error) throw error;

        toast({
          title: t('notificationUpdated') || 'Notification Updated',
          description: t('notificationUpdatedSuccessfully') || 'Notification has been updated successfully',
        });
      } else {
        // Create new notification
        const { error } = await supabase
          .from('user_notifications')
          .insert({
            user_id: userProfile.id,
            title: formData.title,
            type: formData.type,
            time: formData.time,
            days: formData.days,
            enabled: formData.enabled,
            message: formData.message,
          });

        if (error) throw error;

        toast({
          title: t('notificationCreated') || 'Notification Created',
          description: t('notificationCreatedSuccessfully') || 'Notification has been created successfully',
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchNotifications();
    } catch (error) {
      console.error('Error saving notification:', error);
      toast({
        title: t('error') || 'Error',
        description: t('failedToSaveNotification') || 'Failed to save notification',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: t('notificationDeleted') || 'Notification Deleted',
        description: t('notificationDeletedSuccessfully') || 'Notification has been deleted',
      });

      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: t('error') || 'Error',
        description: t('failedToDeleteNotification') || 'Failed to delete notification',
        variant: 'destructive',
      });
    }
  };

  const handleToggleNotification = async (id, enabled) => {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ enabled: !enabled })
        .eq('id', id);

      if (error) throw error;

      fetchNotifications();
    } catch (error) {
      console.error('Error toggling notification:', error);
      toast({
        title: t('error') || 'Error',
        description: t('failedToToggleNotification') || 'Failed to toggle notification',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'meal',
      time: '09:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      enabled: true,
      message: '',
    });
    setEditingNotification(null);
  };

  const handleEditNotification = (notification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title,
      type: notification.type,
      time: notification.time,
      days: notification.days,
      enabled: notification.enabled,
      message: notification.message || '',
    });
    setIsDialogOpen(true);
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const getNotificationTypeIcon = (type) => {
    const icons = {
      meal: '🍽️',
      workout: '💪',
      water: '💧',
      sleep: '😴',
      medication: '💊',
      custom: '🔔',
    };
    return icons[type] || '🔔';
  };

  const getNotificationTypeColor = (type) => {
    const colors = {
      meal: 'bg-orange-500/20 text-orange-300',
      workout: 'bg-blue-500/20 text-blue-300',
      water: 'bg-cyan-500/20 text-cyan-300',
      sleep: 'bg-purple-500/20 text-purple-300',
      medication: 'bg-red-500/20 text-red-300',
      custom: 'bg-gray-500/20 text-gray-300',
    };
    return colors[type] || 'bg-gray-500/20 text-gray-300';
  };

  const daysOfWeek = [
    { id: 'monday', label: 'Mon' },
    { id: 'tuesday', label: 'Tue' },
    { id: 'wednesday', label: 'Wed' },
    { id: 'thursday', label: 'Thu' },
    { id: 'friday', label: 'Fri' },
    { id: 'saturday', label: 'Sat' },
    { id: 'sunday', label: 'Sun' },
  ];

  const notificationTypes = [
    { value: 'meal', label: t('meal') || 'Meal Reminder' },
    { value: 'workout', label: t('workout') || 'Workout Reminder' },
    { value: 'water', label: t('water') || 'Water Reminder' },
    { value: 'sleep', label: t('sleep') || 'Sleep Reminder' },
    { value: 'medication', label: t('medication') || 'Medication Reminder' },
    { value: 'custom', label: t('custom') || 'Custom Reminder' },
  ];

  const groupedNotifications = notifications.reduce((acc, notification) => {
    if (!acc[notification.type]) {
      acc[notification.type] = [];
    }
    acc[notification.type].push(notification);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Bell className="w-6 h-6 text-primary" />
                {t('customNotifications') || 'Custom Notifications'}
              </CardTitle>
              <p className="text-sm text-text-secondary mt-1">
                {t('customNotificationsDescription') || 'Set up personalized reminders for your health goals'}
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('addReminder') || 'Add Reminder'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingNotification ? t('editReminder') || 'Edit Reminder' : t('createNewReminder') || 'Create New Reminder'}
                  </DialogTitle>
                  <DialogDescription>
                    {t('reminderDescription') || 'Set up a custom reminder for your health routine'}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <Label htmlFor="title">{t('title') || 'Title'}</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder={t('enterReminderTitle') || 'Enter reminder title'}
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <Label htmlFor="type">{t('type') || 'Type'}</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {notificationTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {getNotificationTypeIcon(type.value)} {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Time */}
                  <div>
                    <Label htmlFor="time">{t('time') || 'Time'}</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>

                  {/* Days of Week */}
                  <div>
                    <Label>{t('repeatOn') || 'Repeat On'}</Label>
                    <div className="flex gap-2 mt-2">
                      {daysOfWeek.map(day => (
                        <Button
                          key={day.id}
                          variant={formData.days.includes(day.id) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleDayToggle(day.id)}
                          className="flex-1"
                        >
                          {day.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <Label htmlFor="message">{t('message') || 'Message'} ({t('optional') || 'Optional'})</Label>
                    <Input
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder={t('enterCustomMessage') || 'Enter custom message'}
                    />
                  </div>

                  {/* Enabled Switch */}
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <Label htmlFor="enabled">{t('enabledReminder') || 'Enabled'}</Label>
                    <Switch
                      id="enabled"
                      checked={formData.enabled}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
                    />
                  </div>

                  <Button onClick={handleSaveNotification} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    {editingNotification ? t('updateReminder') || 'Update Reminder' : t('createReminder') || 'Create Reminder'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">{t('allReminders') || 'All Reminders'} ({notifications.length})</TabsTrigger>
            <TabsTrigger value="active">{t('active') || 'Active'} ({notifications.filter(n => n.enabled).length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {Object.keys(groupedNotifications).length > 0 ? (
              Object.keys(groupedNotifications).map(type => (
                <Card key={type} className="glass-effect">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-2xl">{getNotificationTypeIcon(type)}</span>
                      {notificationTypes.find(t => t.value === type)?.label || type}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {groupedNotifications[type].map(notification => (
                        <div key={notification.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{notification.title}</h3>
                                <Badge className={getNotificationTypeColor(notification.type)} variant="outline">
                                  {notification.type}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-text-secondary">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{notification.time}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Repeat className="w-4 h-4" />
                                  <span>{notification.days.length === 7 ? 'Daily' : `${notification.days.length} days/week`}</span>
                                </div>
                              </div>
                              {notification.message && (
                                <p className="text-sm text-text-secondary italic">"{notification.message}"</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={notification.enabled}
                              onCheckedChange={() => handleToggleNotification(notification.id, notification.enabled)}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditNotification(notification)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteNotification(notification.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="glass-effect">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BellOff className="w-16 h-16 mb-4 text-text-secondary opacity-50" />
                  <p className="text-text-secondary mb-4">{t('noRemindersYet') || 'No reminders set yet'}</p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('createFirstReminder') || 'Create Your First Reminder'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-6">
            {notifications.filter(n => n.enabled).length > 0 ? (
              <Card className="glass-effect">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {notifications.filter(n => n.enabled).map(notification => (
                      <div key={notification.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">{getNotificationTypeIcon(notification.type)}</span>
                          <div>
                            <h3 className="font-semibold">{notification.title}</h3>
                            <p className="text-sm text-text-secondary">
                              {notification.time} • {notification.days.length === 7 ? 'Daily' : `${notification.days.length} days/week`}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-green-500/20 text-green-300">
                          {t('active') || 'Active'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass-effect">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BellOff className="w-16 h-16 mb-4 text-text-secondary opacity-50" />
                  <p className="text-text-secondary">{t('noActiveReminders') || 'No active reminders'}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default CustomNotifications;
