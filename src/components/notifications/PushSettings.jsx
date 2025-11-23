import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import {
  Bell,
  BellOff,
  BellRing,
  Clock,
  Mail,
  Smartphone,
  Volume2,
  VolumeX,
  Award,
  Target,
  MessageSquare,
  Calendar,
  TrendingUp,
  Users,
  Info,
  Heart,
  CheckCircle2,
  AlertCircle,
  Settings,
  Moon,
  Sun,
  Send
} from 'lucide-react';
import { motion } from 'framer-motion';

const NOTIFICATION_TYPES = [
  {
    id: 'achievement',
    name: 'Achievements',
    description: 'Badges, milestones, and accomplishments',
    icon: Award,
    color: 'text-yellow-600',
    defaultEnabled: true
  },
  {
    id: 'goal',
    name: 'Goal Updates',
    description: 'Progress updates and goal completions',
    icon: Target,
    color: 'text-blue-600',
    defaultEnabled: true
  },
  {
    id: 'message',
    name: 'Messages',
    description: 'Direct messages from nutritionists',
    icon: MessageSquare,
    color: 'text-purple-600',
    defaultEnabled: true
  },
  {
    id: 'reminder',
    name: 'Reminders',
    description: 'Meal logging and workout reminders',
    icon: Bell,
    color: 'text-orange-600',
    defaultEnabled: true
  },
  {
    id: 'milestone',
    name: 'Milestones',
    description: 'Important progress milestones',
    icon: TrendingUp,
    color: 'text-green-600',
    defaultEnabled: true
  },
  {
    id: 'social',
    name: 'Social',
    description: 'Community interactions and likes',
    icon: Users,
    color: 'text-pink-600',
    defaultEnabled: false
  },
  {
    id: 'system',
    name: 'System',
    description: 'App updates and maintenance',
    icon: Info,
    color: 'text-gray-600',
    defaultEnabled: true
  },
  {
    id: 'celebration',
    name: 'Celebrations',
    description: 'Special occasions and streaks',
    icon: Heart,
    color: 'text-red-600',
    defaultEnabled: true
  }
];

const DELIVERY_METHODS = [
  { id: 'in_app', name: 'In-App', icon: Bell, description: 'Show in notification center' },
  { id: 'push', name: 'Push', icon: Smartphone, description: 'Browser push notifications' },
  { id: 'email', name: 'Email', icon: Mail, description: 'Email notifications' }
];

const FREQUENCY_OPTIONS = [
  { value: 'instant', label: 'Instant', description: 'Get notified immediately' },
  { value: 'hourly', label: 'Hourly Digest', description: 'Once per hour' },
  { value: 'daily', label: 'Daily Digest', description: 'Once per day at 9 AM' },
  { value: 'weekly', label: 'Weekly Digest', description: 'Every Monday at 9 AM' }
];

const PushSettings = ({ userId }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [pushPermission, setPushPermission] = useState('default');
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchSettings();
      checkPushPermission();
    }
  }, [userId]);

  const checkPushPermission = () => {
    if ('Notification' in window) {
      setPushPermission(Notification.permission);
    }
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data.settings || {});
        setQuietHoursEnabled(data.quiet_hours_enabled || false);
        setQuietHoursStart(data.quiet_hours_start || '22:00');
        setQuietHoursEnd(data.quiet_hours_end || '08:00');
        setSoundEnabled(data.sound_enabled !== false);
      } else {
        // Initialize with default settings
        const defaultSettings = {};
        NOTIFICATION_TYPES.forEach(type => {
          defaultSettings[type.id] = {
            enabled: type.defaultEnabled,
            methods: ['in_app', 'push'],
            frequency: 'instant'
          };
        });
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: userId,
          settings: settings,
          quiet_hours_enabled: quietHoursEnabled,
          quiet_hours_start: quietHoursStart,
          quiet_hours_end: quietHoursEnd,
          sound_enabled: soundEnabled,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Show success notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Settings Saved', {
          body: 'Your notification preferences have been updated.',
          icon: '/logo.png'
        });
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleNotificationType = (typeId, enabled) => {
    setSettings(prev => ({
      ...prev,
      [typeId]: {
        ...prev[typeId],
        enabled
      }
    }));
  };

  const toggleDeliveryMethod = (typeId, method) => {
    const currentMethods = settings[typeId]?.methods || [];
    const newMethods = currentMethods.includes(method)
      ? currentMethods.filter(m => m !== method)
      : [...currentMethods, method];

    setSettings(prev => ({
      ...prev,
      [typeId]: {
        ...prev[typeId],
        methods: newMethods
      }
    }));
  };

  const setFrequency = (typeId, frequency) => {
    setSettings(prev => ({
      ...prev,
      [typeId]: {
        ...prev[typeId],
        frequency
      }
    }));
  };

  const requestPushPermission = async () => {
    if (!('Notification' in window)) {
      alert('Your browser does not support push notifications.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);

      if (permission === 'granted') {
        // Send test notification
        new Notification('Push Notifications Enabled!', {
          body: 'You will now receive push notifications from GreenoFig.',
          icon: '/logo.png',
          badge: '/logo.png'
        });
      }
    } catch (error) {
      console.error('Error requesting push permission:', error);
    }
  };

  const sendTestNotification = async () => {
    try {
      setTestSending(true);

      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'system',
          title: 'Test Notification',
          message: 'This is a test notification to verify your settings are working correctly.',
          is_read: false
        });

      if (error) throw error;

      alert('Test notification sent! Check your notification center.');
    } catch (error) {
      console.error('Error sending test notification:', error);
      alert('Failed to send test notification.');
    } finally {
      setTestSending(false);
    }
  };

  const enableAllNotifications = () => {
    const allEnabled = {};
    NOTIFICATION_TYPES.forEach(type => {
      allEnabled[type.id] = {
        enabled: true,
        methods: ['in_app', 'push'],
        frequency: 'instant'
      };
    });
    setSettings(allEnabled);
  };

  const disableAllNotifications = () => {
    const allDisabled = {};
    NOTIFICATION_TYPES.forEach(type => {
      allDisabled[type.id] = {
        enabled: false,
        methods: [],
        frequency: 'instant'
      };
    });
    setSettings(allDisabled);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <Settings className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading notification settings...</p>
        </div>
      </div>
    );
  }

  const enabledCount = Object.values(settings).filter(s => s?.enabled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <BellRing className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Manage how and when you receive notifications
                </CardDescription>
              </div>
            </div>
            <Badge variant={enabledCount > 0 ? 'default' : 'secondary'}>
              {enabledCount}/{NOTIFICATION_TYPES.length} enabled
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Push Permission Banner */}
      {pushPermission !== 'granted' && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-orange-900 mb-1">
                  Push Notifications Disabled
                </h4>
                <p className="text-sm text-orange-700 mb-3">
                  Enable push notifications to receive alerts even when GreenoFig is closed.
                </p>
                <Button
                  size="sm"
                  onClick={requestPushPermission}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  Enable Push Notifications
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="preferences" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preferences">
            <Bell className="w-4 h-4 mr-2" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <Clock className="w-4 h-4 mr-2" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="delivery">
            <Send className="w-4 h-4 mr-2" />
            Delivery
          </TabsTrigger>
        </TabsList>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Notification Types</CardTitle>
                  <CardDescription>
                    Choose which types of notifications you want to receive
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={enableAllNotifications}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Enable All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={disableAllNotifications}
                  >
                    <BellOff className="w-4 h-4 mr-2" />
                    Disable All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {NOTIFICATION_TYPES.map((type, index) => {
                const typeSettings = settings[type.id] || {};
                const TypeIcon = type.icon;

                return (
                  <motion.div
                    key={type.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      typeSettings.enabled
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-full bg-white border-2 flex items-center justify-center ${type.color}`}>
                          <TypeIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{type.name}</h4>
                            {typeSettings.enabled && (
                              <Badge variant="outline" className="text-xs">
                                {typeSettings.frequency || 'instant'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {type.description}
                          </p>

                          {typeSettings.enabled && (
                            <div className="flex flex-wrap gap-2">
                              {DELIVERY_METHODS.map(method => {
                                const MethodIcon = method.icon;
                                const isEnabled = typeSettings.methods?.includes(method.id);

                                return (
                                  <Button
                                    key={method.id}
                                    size="sm"
                                    variant={isEnabled ? 'default' : 'outline'}
                                    onClick={() => toggleDeliveryMethod(type.id, method.id)}
                                    className="text-xs"
                                    disabled={method.id === 'push' && pushPermission !== 'granted'}
                                  >
                                    <MethodIcon className="w-3 h-3 mr-1" />
                                    {method.name}
                                  </Button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      <Switch
                        checked={typeSettings.enabled || false}
                        onCheckedChange={(enabled) => toggleNotificationType(type.id, enabled)}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quiet Hours</CardTitle>
              <CardDescription>
                Mute notifications during specific hours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-200">
                <div className="flex items-center gap-3">
                  {quietHoursEnabled ? (
                    <Moon className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <Sun className="w-5 h-5 text-orange-500" />
                  )}
                  <div>
                    <Label className="text-base font-medium">
                      Enable Quiet Hours
                    </Label>
                    <p className="text-sm text-gray-600">
                      Silence notifications during sleep or focus time
                    </p>
                  </div>
                </div>
                <Switch
                  checked={quietHoursEnabled}
                  onCheckedChange={setQuietHoursEnabled}
                />
              </div>

              {quietHoursEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-indigo-50 rounded-lg border-2 border-indigo-200"
                >
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Start Time
                    </Label>
                    <input
                      type="time"
                      value={quietHoursStart}
                      onChange={(e) => setQuietHoursStart(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      End Time
                    </Label>
                    <input
                      type="time"
                      value={quietHoursEnd}
                      onChange={(e) => setQuietHoursEnd(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="col-span-2 flex items-center gap-2 text-sm text-indigo-700">
                    <Moon className="w-4 h-4" />
                    <span>
                      Notifications will be muted from {quietHoursStart} to {quietHoursEnd}
                    </span>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notification Frequency</CardTitle>
              <CardDescription>
                Control how often you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {NOTIFICATION_TYPES.map(type => {
                const typeSettings = settings[type.id] || {};
                if (!typeSettings.enabled) return null;

                return (
                  <div
                    key={type.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-2">
                      <type.icon className={`w-4 h-4 ${type.color}`} />
                      <span className="text-sm font-medium">{type.name}</span>
                    </div>
                    <Select
                      value={typeSettings.frequency || 'instant'}
                      onValueChange={(value) => setFrequency(type.id, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FREQUENCY_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Tab */}
        <TabsContent value="delivery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Delivery Methods</CardTitle>
              <CardDescription>
                Choose how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {DELIVERY_METHODS.map(method => {
                const MethodIcon = method.icon;
                const isAvailable = method.id === 'push'
                  ? pushPermission === 'granted'
                  : true;

                return (
                  <div
                    key={method.id}
                    className={`p-4 rounded-lg border-2 ${
                      isAvailable ? 'border-gray-200' : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <MethodIcon className={`w-5 h-5 ${isAvailable ? 'text-blue-600' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium ${isAvailable ? '' : 'text-gray-400'}`}>
                            {method.name}
                          </h4>
                          {!isAvailable && (
                            <Badge variant="secondary">Disabled</Badge>
                          )}
                        </div>
                        <p className={`text-sm ${isAvailable ? 'text-gray-600' : 'text-gray-400'}`}>
                          {method.description}
                        </p>
                        {!isAvailable && method.id === 'push' && (
                          <Button
                            size="sm"
                            className="mt-2"
                            onClick={requestPushPermission}
                          >
                            Enable Push Notifications
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sound & Vibration</CardTitle>
              <CardDescription>
                Control notification sounds and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-200">
                <div className="flex items-center gap-3">
                  {soundEnabled ? (
                    <Volume2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <Label className="text-base font-medium">
                      Notification Sounds
                    </Label>
                    <p className="text-sm text-gray-600">
                      Play sound when receiving notifications
                    </p>
                  </div>
                </div>
                <Switch
                  checked={soundEnabled}
                  onCheckedChange={setSoundEnabled}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <Button
              variant="outline"
              onClick={sendTestNotification}
              disabled={testSending}
            >
              <Send className="w-4 h-4 mr-2" />
              {testSending ? 'Sending...' : 'Send Test Notification'}
            </Button>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={fetchSettings}
                disabled={loading}
              >
                Reset
              </Button>
              <Button
                onClick={saveSettings}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PushSettings;
