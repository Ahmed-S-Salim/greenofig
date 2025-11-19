import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import {
  Watch,
  Activity,
  Heart,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Unlink,
  Smartphone,
  Loader2
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

/**
 * Wearable Device Sync Component
 * Integrates with Apple Health, Google Fit, Fitbit, and Garmin
 * Available in Premium+ tiers
 *
 * CRITICAL: This feature was advertised but not implemented!
 */
const WearableDeviceSync = () => {
  const { userProfile } = useAuth();
  const { hasAccess } = useFeatureAccess();
  const hasWearableIntegration = hasAccess('wearableIntegration');

  const [connectedDevices, setConnectedDevices] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncStats, setSyncStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Supported wearable devices
  const availableDevices = [
    {
      id: 'apple-health',
      name: 'Apple Health',
      icon: '🍎',
      platform: 'iOS',
      description: 'Sync steps, calories, workouts, heart rate',
      color: 'from-gray-700 to-gray-900',
      requiresNativeApp: true, // Requires React Native
    },
    {
      id: 'google-fit',
      name: 'Google Fit',
      icon: '🏃',
      platform: 'Android/Web',
      description: 'Sync steps, calories, workouts, heart rate',
      color: 'from-green-500 to-green-700',
      webSupported: true,
    },
    {
      id: 'fitbit',
      name: 'Fitbit',
      icon: '⌚',
      platform: 'All',
      description: 'Sync steps, calories, sleep, heart rate',
      color: 'from-teal-500 to-teal-700',
      webSupported: true,
    },
    {
      id: 'garmin',
      name: 'Garmin Connect',
      icon: '🏋️',
      platform: 'All',
      description: 'Sync workouts, heart rate, stress levels',
      color: 'from-blue-600 to-blue-800',
      webSupported: true,
    },
    {
      id: 'samsung-health',
      name: 'Samsung Health',
      icon: '📱',
      platform: 'Android',
      description: 'Sync steps, calories, sleep, heart rate',
      color: 'from-blue-500 to-blue-700',
      requiresNativeApp: true,
    },
    {
      id: 'whoop',
      name: 'WHOOP',
      icon: '💪',
      platform: 'All',
      description: 'Sync strain, recovery, sleep performance',
      color: 'from-red-500 to-red-700',
      webSupported: true,
    },
  ];

  useEffect(() => {
    if (userProfile?.id) {
      loadConnectedDevices();
      loadLastSyncTime();
    }
  }, [userProfile?.id]);

  const loadConnectedDevices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wearable_connections')
        .select('*')
        .eq('user_id', userProfile.id);

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading devices:', error);
      }

      setConnectedDevices(data || []);
    } catch (err) {
      console.error('Failed to load connected devices:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLastSyncTime = async () => {
    try {
      const { data } = await supabase
        .from('wearable_sync_history')
        .select('synced_at, stats')
        .eq('user_id', userProfile.id)
        .order('synced_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setLastSyncTime(new Date(data.synced_at));
        setSyncStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load sync time:', err);
    }
  };

  const connectDevice = async (deviceId) => {
    if (!hasWearableIntegration) {
      toast({
        title: 'Premium Feature',
        description: 'Wearable device sync is available in Premium tier and above. Please upgrade your plan.',
        variant: 'destructive',
      });
      return;
    }

    const device = availableDevices.find(d => d.id === deviceId);

    // Check if device requires native app
    if (device.requiresNativeApp) {
      toast({
        title: 'Mobile App Required',
        description: `${device.name} integration requires the GreenoFig mobile app. Coming soon!`,
      });
      return;
    }

    try {
      // Call OAuth flow for the device
      const { data, error } = await supabase.functions.invoke('connect-wearable', {
        body: {
          device_id: deviceId,
          user_id: userProfile.id,
        },
      });

      if (error) throw error;

      // Redirect to OAuth authorization page
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }

    } catch (err) {
      console.error('Connection error:', err);
      toast({
        title: 'Connection Failed',
        description: err.message || 'Failed to connect device. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const disconnectDevice = async (deviceId) => {
    try {
      const { error } = await supabase
        .from('wearable_connections')
        .delete()
        .eq('user_id', userProfile.id)
        .eq('device_id', deviceId);

      if (error) throw error;

      toast({
        title: 'Device Disconnected',
        description: 'Wearable device has been disconnected successfully.',
      });

      loadConnectedDevices();
    } catch (err) {
      console.error('Disconnect error:', err);
      toast({
        title: 'Error',
        description: 'Failed to disconnect device.',
        variant: 'destructive',
      });
    }
  };

  const syncNow = async () => {
    if (!hasWearableIntegration) {
      toast({
        title: 'Premium Feature',
        description: 'Please upgrade to Premium to sync wearable data.',
        variant: 'destructive',
      });
      return;
    }

    if (connectedDevices.length === 0) {
      toast({
        title: 'No Devices Connected',
        description: 'Please connect a wearable device first.',
      });
      return;
    }

    setSyncing(true);

    try {
      // Call sync function for all connected devices
      const { data, error } = await supabase.functions.invoke('sync-wearable-data', {
        body: {
          user_id: userProfile.id,
        },
      });

      if (error) throw error;

      toast({
        title: 'Sync Complete!',
        description: `Synced ${data.recordsImported || 0} new records from your wearable devices.`,
      });

      setSyncStats(data.stats);
      setLastSyncTime(new Date());

      // Reload sync history
      loadLastSyncTime();

    } catch (err) {
      console.error('Sync error:', err);
      toast({
        title: 'Sync Failed',
        description: err.message || 'Failed to sync wearable data.',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  const isConnected = (deviceId) => {
    return connectedDevices.some(d => d.device_id === deviceId);
  };

  const getDeviceConnection = (deviceId) => {
    return connectedDevices.find(d => d.device_id === deviceId);
  };

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Never';

    const now = new Date();
    const diffMs = now - lastSyncTime;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  // Upgrade prompt for non-Premium users
  if (!hasWearableIntegration) {
    return (
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Watch className="h-5 w-5" />
            Wearable Device Sync
          </CardTitle>
          <CardDescription>
            Connect your fitness trackers and smartwatches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Premium Feature</strong> - Wearable device synchronization is available in Premium tier and above.
              Upgrade to automatically sync your steps, calories, workouts, and heart rate data.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sync Status Card */}
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Watch className="h-5 w-5" />
                Wearable Device Sync
              </CardTitle>
              <CardDescription>
                Connect fitness trackers to automatically sync health data
              </CardDescription>
            </div>
            {connectedDevices.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {connectedDevices.length} Connected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Last Sync Info */}
          {connectedDevices.length > 0 && (
            <div className="p-4 rounded-lg bg-background/50 flex justify-between items-center">
              <div>
                <p className="text-sm text-text-secondary">Last Sync</p>
                <p className="font-semibold">{formatLastSync()}</p>
                {syncStats && (
                  <div className="flex gap-4 mt-2 text-xs text-text-secondary">
                    <span>Steps: {syncStats.steps?.toLocaleString() || 0}</span>
                    <span>Calories: {syncStats.calories || 0}</span>
                    <span>Active Minutes: {syncStats.activeMinutes || 0}</span>
                  </div>
                )}
              </div>
              <Button
                onClick={syncNow}
                disabled={syncing}
                size="sm"
              >
                {syncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Now
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Auto-Sync Toggle */}
          {connectedDevices.length > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/30">
              <div>
                <Label htmlFor="auto-sync">Automatic Sync</Label>
                <p className="text-xs text-text-secondary mt-1">
                  Sync data automatically every hour
                </p>
              </div>
              <Switch id="auto-sync" defaultChecked />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Devices */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Available Devices</CardTitle>
          <CardDescription>
            Connect your wearable devices to start syncing health data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableDevices.map((device) => {
              const connected = isConnected(device.id);
              const connection = getDeviceConnection(device.id);

              return (
                <Card
                  key={device.id}
                  className={`relative overflow-hidden ${connected ? 'ring-2 ring-primary' : ''}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${device.color} opacity-10`} />
                  <CardContent className="relative pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{device.icon}</div>
                        <div>
                          <h3 className="font-semibold">{device.name}</h3>
                          <p className="text-xs text-text-secondary">{device.platform}</p>
                        </div>
                      </div>
                      {connected && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Connected
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-text-secondary mb-4">
                      {device.description}
                    </p>

                    {connected ? (
                      <div className="space-y-2">
                        <div className="text-xs text-text-secondary">
                          Connected on {new Date(connection.connected_at).toLocaleDateString()}
                        </div>
                        <Button
                          onClick={() => disconnectDevice(device.id)}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Unlink className="mr-2 h-4 w-4" />
                          Disconnect
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => connectDevice(device.id)}
                        className="w-full"
                        size="sm"
                        disabled={device.requiresNativeApp}
                      >
                        {device.requiresNativeApp ? (
                          <>
                            <Smartphone className="mr-2 h-4 w-4" />
                            Requires Mobile App
                          </>
                        ) : (
                          <>
                            <Watch className="mr-2 h-4 w-4" />
                            Connect
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Data Insights */}
      {syncStats && (
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Today's Activity (Synced Data)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-background/50">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <p className="text-xs text-text-secondary">Steps</p>
                </div>
                <p className="text-2xl font-bold">{syncStats.steps?.toLocaleString() || 0}</p>
                <p className="text-xs text-text-secondary mt-1">Goal: 10,000</p>
              </div>

              <div className="p-4 rounded-lg bg-background/50">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <p className="text-xs text-text-secondary">Calories</p>
                </div>
                <p className="text-2xl font-bold">{syncStats.calories || 0}</p>
                <p className="text-xs text-text-secondary mt-1">Burned</p>
              </div>

              <div className="p-4 rounded-lg bg-background/50">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <p className="text-xs text-text-secondary">Active Minutes</p>
                </div>
                <p className="text-2xl font-bold">{syncStats.activeMinutes || 0}</p>
                <p className="text-xs text-text-secondary mt-1">Today</p>
              </div>

              <div className="p-4 rounded-lg bg-background/50">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-4 w-4 text-pink-500" />
                  <p className="text-xs text-text-secondary">Heart Rate</p>
                </div>
                <p className="text-2xl font-bold">{syncStats.avgHeartRate || '--'}</p>
                <p className="text-xs text-text-secondary mt-1">Average BPM</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WearableDeviceSync;
