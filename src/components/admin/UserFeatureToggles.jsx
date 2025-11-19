import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Search, Save, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * Super Admin Feature Toggle System
 * Allows super admins to override subscription-based features for specific users
 * Use cases:
 * - Give early access to beta features
 * - Compensation for service issues
 * - Special partnerships
 * - Testing purposes
 */
const UserFeatureToggles = () => {
  const [searchEmail, setSearchEmail] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userFeatures, setUserFeatures] = useState(null);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  // All available features that can be toggled
  const availableFeatures = [
    { key: 'photoRecognition', name: 'Photo Food Recognition', tier: 'Elite', description: 'AI-powered food photo analysis' },
    { key: 'wearableIntegration', name: 'Wearable Device Sync', tier: 'Premium', description: 'Sync with Fitbit, Apple Watch, etc.' },
    { key: 'videoConsultations', name: 'Video Consultations', tier: 'Elite', description: 'Video calls with nutritionists' },
    { key: 'nutritionistAccess', name: 'Nutritionist Access', tier: 'Ultimate', description: 'Chat and schedule with certified nutritionists' },
    { key: 'advancedAnalytics', name: 'Advanced Analytics', tier: 'Premium', description: 'Detailed reports and insights' },
    { key: 'prioritySupport', name: 'Priority Support', tier: 'Ultimate', description: '24/7 priority customer support' },
    { key: 'downloadReports', name: 'Download Reports', tier: 'Premium', description: 'Export data as PDF/CSV' },
    { key: 'customGoals', name: 'Custom Goals', tier: 'Premium', description: 'Create custom health goals' },
    { key: 'personalCoach', name: 'Personal AI Coach', tier: 'Elite', description: 'Dedicated AI coaching' },
    { key: 'premiumRecipes', name: 'Premium Recipes', tier: 'Elite', description: 'Access to exclusive recipe library' },
    { key: 'hasAds', name: 'Show Ads', tier: 'Free', description: 'Display advertisements (disable to remove ads)' },
  ];

  // Limits that can be overridden
  const limitFeatures = [
    { key: 'maxMealPlansPerMonth', name: 'Monthly Meal Plans', default: -1, description: 'Max AI meal plans per month (-1 = unlimited)' },
    { key: 'maxWorkoutsPerMonth', name: 'Monthly Workouts', default: -1, description: 'Max AI workouts per month (-1 = unlimited)' },
    { key: 'aiChatMessages', name: 'AI Chat Messages', default: -1, description: 'Max AI chat messages per month (-1 = unlimited)' },
  ];

  const searchUser = async () => {
    if (!searchEmail) {
      toast({
        title: 'Email Required',
        description: 'Please enter a user email address',
        variant: 'destructive',
      });
      return;
    }

    setSearching(true);
    try {
      // Search for user by email
      const { data: user, error: userError } = await supabase
        .from('user_profiles')
        .select('*, subscription_plans(*)')
        .eq('email', searchEmail.toLowerCase())
        .maybeSingle();

      if (userError) throw userError;

      if (!user) {
        toast({
          title: 'User Not Found',
          description: `No user found with email: ${searchEmail}`,
          variant: 'destructive',
        });
        setSelectedUser(null);
        setUserFeatures(null);
        return;
      }

      setSelectedUser(user);

      // Load existing feature overrides
      const { data: overrides, error: overridesError } = await supabase
        .from('user_feature_overrides')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (overridesError && overridesError.code !== 'PGRST116') {
        console.error('Error loading overrides:', overridesError);
      }

      setUserFeatures(overrides?.features || {});

      toast({
        title: 'User Found',
        description: `Loaded feature overrides for ${user.full_name}`,
      });

    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSearching(false);
    }
  };

  const toggleFeature = (featureKey) => {
    setUserFeatures((prev) => ({
      ...prev,
      [featureKey]: !prev[featureKey],
    }));
  };

  const updateLimit = (featureKey, value) => {
    const numValue = parseInt(value) || 0;
    setUserFeatures((prev) => ({
      ...prev,
      [featureKey]: numValue,
    }));
  };

  const saveFeatureOverrides = async () => {
    if (!selectedUser) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_feature_overrides')
        .upsert({
          user_id: selectedUser.id,
          features: userFeatures,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;

      // Log the override action
      await supabase
        .from('admin_audit_log')
        .insert({
          admin_id: (await supabase.auth.getUser()).data.user.id,
          action: 'feature_override_update',
          target_user_id: selectedUser.id,
          details: {
            email: selectedUser.email,
            overrides: userFeatures,
          },
        });

      toast({
        title: 'Feature Overrides Saved',
        description: `Updated feature access for ${selectedUser.full_name}`,
      });

    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Save Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    if (!selectedUser) return;

    if (confirm(`Reset all feature overrides for ${selectedUser.full_name}? They will use plan-based features only.`)) {
      setUserFeatures({});
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>🔧 User Feature Override System</CardTitle>
          <CardDescription>
            Grant or revoke specific features for individual users, overriding their subscription plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="search-email">User Email</Label>
              <Input
                id="search-email"
                type="email"
                placeholder="user@example.com"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchUser()}
              />
            </div>
            <Button onClick={searchUser} disabled={searching} className="mt-auto">
              {searching ? (
                <>
                  <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Details & Feature Toggles */}
      {selectedUser && (
        <>
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-text-secondary">Name</p>
                  <p className="font-semibold">{selectedUser.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Email</p>
                  <p className="font-semibold">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Current Plan</p>
                  <Badge variant="outline">{selectedUser.subscription_plans?.name || 'Free'}</Badge>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Status</p>
                  <Badge variant={selectedUser.subscription_status === 'active' ? 'default' : 'destructive'}>
                    {selectedUser.subscription_status || 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Feature Overrides</CardTitle>
                  <CardDescription>
                    Enable or disable specific features regardless of subscription plan
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={resetToDefaults}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                  <Button size="sm" onClick={saveFeatureOverrides} disabled={saving}>
                    {saving ? (
                      <>
                        <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Boolean Features */}
                <div>
                  <h4 className="font-semibold mb-3">Feature Access</h4>
                  <div className="space-y-3">
                    {availableFeatures.map((feature) => (
                      <div
                        key={feature.key}
                        className="flex items-center justify-between p-3 rounded-lg bg-background/50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={feature.key} className="cursor-pointer">
                              {feature.name}
                            </Label>
                            <Badge variant="secondary" className="text-xs">
                              {feature.tier}
                            </Badge>
                          </div>
                          <p className="text-xs text-text-secondary mt-1">
                            {feature.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {userFeatures[feature.key] !== undefined && (
                            userFeatures[feature.key] ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                            )
                          )}
                          <Switch
                            id={feature.key}
                            checked={userFeatures[feature.key] || false}
                            onCheckedChange={() => toggleFeature(feature.key)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Limit Features */}
                <div>
                  <h4 className="font-semibold mb-3">Usage Limits</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {limitFeatures.map((feature) => (
                      <div key={feature.key} className="p-3 rounded-lg bg-background/50">
                        <Label htmlFor={feature.key} className="text-sm mb-1 block">
                          {feature.name}
                        </Label>
                        <p className="text-xs text-text-secondary mb-2">
                          {feature.description}
                        </p>
                        <Input
                          id={feature.key}
                          type="number"
                          value={userFeatures[feature.key] !== undefined ? userFeatures[feature.key] : feature.default}
                          onChange={(e) => updateLimit(feature.key, e.target.value)}
                          placeholder="-1 for unlimited"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-yellow-600 dark:text-yellow-400 mb-1">
                        Override Warning
                      </p>
                      <p className="text-text-secondary">
                        These overrides will take precedence over the user's subscription plan.
                        Use with caution and document the reason in your admin notes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default UserFeatureToggles;
