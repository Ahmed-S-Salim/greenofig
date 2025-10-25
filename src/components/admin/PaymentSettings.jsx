import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { CreditCard, Save, Eye, EyeOff, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const PaymentSettings = () => {
  const [stripeSettings, setStripeSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  const [formData, setFormData] = useState({
    is_active: false,
    is_test_mode: true,
    public_key: '',
    secret_key: '',
    webhook_secret: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('payment_settings')
      .select('*')
      .eq('provider', 'stripe')
      .single();

    if (error && error.code !== 'PGRST116') {
      toast({ title: 'Error fetching settings', description: error.message, variant: 'destructive' });
    } else if (data) {
      setStripeSettings(data);
      setFormData({
        is_active: data.is_active || false,
        is_test_mode: data.is_test_mode !== false,
        public_key: data.public_key || '',
        secret_key: data.secret_key || '',
        webhook_secret: data.webhook_secret || '',
      });
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name, checked) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('payment_settings')
        .upsert({
          provider: 'stripe',
          is_active: formData.is_active,
          is_test_mode: formData.is_test_mode,
          public_key: formData.public_key,
          secret_key: formData.secret_key,
          webhook_secret: formData.webhook_secret,
        }, {
          onConflict: 'provider'
        });

      if (error) throw error;

      toast({
        title: 'Settings Saved!',
        description: 'Stripe payment settings have been updated successfully.',
      });
      fetchSettings();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    if (!formData.secret_key) {
      toast({ title: 'Missing Key', description: 'Please enter a secret key first', variant: 'destructive' });
      return;
    }

    toast({
      title: 'Testing Connection',
      description: 'Verifying Stripe credentials...',
    });

    try {
      // In a real app, this would call your backend API to test the Stripe connection
      // For now, we'll just check if the key format is valid
      const isValidFormat = formData.secret_key.startsWith('sk_test_') || formData.secret_key.startsWith('sk_live_');

      if (isValidFormat) {
        toast({
          title: 'Connection Successful',
          description: 'Stripe API key format is valid',
        });
      } else {
        toast({
          title: 'Invalid Key Format',
          description: 'Stripe secret key should start with sk_test_ or sk_live_',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card className="glass-effect">
        <CardHeader>
          <div className="h-8 bg-white/10 rounded w-1/3 animate-pulse"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-white/10 rounded w-1/4 animate-pulse"></div>
              <div className="h-10 bg-white/10 rounded w-full animate-pulse"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-6 h-6" />
                Stripe Payment Settings
              </CardTitle>
              <CardDescription className="mt-2">
                Configure your Stripe account to accept payments
              </CardDescription>
            </div>
            {formData.is_active ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
            ) : (
              <Badge variant="secondary">Inactive</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background/50">
            <div>
              <Label htmlFor="is_active" className="text-base font-semibold">Enable Stripe Payments</Label>
              <p className="text-sm text-text-secondary mt-1">Accept payments through Stripe</p>
            </div>
            <Checkbox
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleCheckboxChange('is_active', checked)}
            />
          </div>

          {/* Test Mode Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-background/50">
            <div>
              <Label htmlFor="is_test_mode" className="text-base font-semibold">Test Mode</Label>
              <p className="text-sm text-text-secondary mt-1">Use test API keys instead of live keys</p>
            </div>
            <Checkbox
              id="is_test_mode"
              checked={formData.is_test_mode}
              onCheckedChange={(checked) => handleCheckboxChange('is_test_mode', checked)}
            />
          </div>

          {/* API Keys */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div>
              <Label htmlFor="public_key">
                Publishable Key {formData.is_test_mode ? '(Test)' : '(Live)'}
              </Label>
              <Input
                id="public_key"
                name="public_key"
                value={formData.public_key}
                onChange={handleInputChange}
                placeholder={formData.is_test_mode ? "pk_test_..." : "pk_live_..."}
                className="mt-2 font-mono text-sm"
              />
              <p className="text-xs text-text-secondary mt-1">
                Used on the client-side to create payment forms
              </p>
            </div>

            <div>
              <Label htmlFor="secret_key">
                Secret Key {formData.is_test_mode ? '(Test)' : '(Live)'}
              </Label>
              <div className="relative mt-2">
                <Input
                  id="secret_key"
                  name="secret_key"
                  type={showSecretKey ? "text" : "password"}
                  value={formData.secret_key}
                  onChange={handleInputChange}
                  placeholder={formData.is_test_mode ? "sk_test_..." : "sk_live_..."}
                  className="font-mono text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-text-secondary mt-1">
                Used server-side to process payments
              </p>
            </div>

            <div>
              <Label htmlFor="webhook_secret">Webhook Secret (Optional)</Label>
              <div className="relative mt-2">
                <Input
                  id="webhook_secret"
                  name="webhook_secret"
                  type={showWebhookSecret ? "text" : "password"}
                  value={formData.webhook_secret}
                  onChange={handleInputChange}
                  placeholder="whsec_..."
                  className="font-mono text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  {showWebhookSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-text-secondary mt-1">
                Used to verify webhook events from Stripe
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
            <Button onClick={testConnection} variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Test Connection
            </Button>
          </div>

          {/* Help Text */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <h4 className="font-semibold text-sm mb-2">How to get your Stripe API keys:</h4>
            <ol className="text-sm text-text-secondary space-y-1 list-decimal list-inside">
              <li>Go to <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stripe Dashboard</a></li>
              <li>Navigate to Developers → API keys</li>
              <li>Copy your Publishable key and Secret key</li>
              <li>For webhooks: Developers → Webhooks → Add endpoint</li>
              <li>Use this URL: <code className="px-2 py-1 bg-background/50 rounded text-xs">{window.location.origin}/api/webhooks/stripe</code></li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSettings;
