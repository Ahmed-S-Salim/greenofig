import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import {
  Settings,
  Building,
  Clock,
  DollarSign,
  Bell,
  Palette,
  Save,
  Loader2
} from 'lucide-react';

const NutritionistSettings = () => {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('business');

  const [settings, setSettings] = useState({
    // Business Information
    business_name: '',
    business_address: '',
    business_phone: '',
    license_number: '',
    specializations: [],

    // Availability & Scheduling
    consultation_duration_default: 60,
    buffer_time_minutes: 15,
    working_hours: {
      monday: { enabled: true, start: '09:00', end: '17:00' },
      tuesday: { enabled: true, start: '09:00', end: '17:00' },
      wednesday: { enabled: true, start: '09:00', end: '17:00' },
      thursday: { enabled: true, start: '09:00', end: '17:00' },
      friday: { enabled: true, start: '09:00', end: '17:00' },
      saturday: { enabled: false, start: '09:00', end: '13:00' },
      sunday: { enabled: false, start: '09:00', end: '13:00' }
    },
    time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    booking_advance_days: 30,

    // Pricing
    hourly_rate: '',
    initial_consultation_fee: '',
    follow_up_fee: '',
    package_pricing: [],

    // Notifications
    email_notifications: true,
    sms_notifications: false,
    appointment_reminders: true,
    reminder_hours_before: 24,

    // Branding
    brand_color: '#10b981',
    logo_url: '',
    custom_email_signature: ''
  });

  const [specializationInput, setSpecializationInput] = useState('');
  const [packageForm, setPackageForm] = useState({ name: '', sessions: '', price: '' });

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  useEffect(() => {
    fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('nutritionist_settings')
        .select('*')
        .eq('nutritionist_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings({
          ...settings,
          ...data,
          specializations: data.specializations || [],
          working_hours: data.working_hours || settings.working_hours,
          package_pricing: data.package_pricing || []
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from('nutritionist_settings')
        .select('id')
        .eq('nutritionist_id', user.id)
        .single();

      const settingsData = {
        ...settings,
        nutritionist_id: user.id
      };

      if (existing) {
        const { error } = await supabase
          .from('nutritionist_settings')
          .update(settingsData)
          .eq('nutritionist_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('nutritionist_settings')
          .insert(settingsData);

        if (error) throw error;
      }

      toast({
        title: 'Settings saved',
        description: 'Your settings have been updated successfully'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save settings'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSpecialization = () => {
    if (specializationInput.trim() && !settings.specializations.includes(specializationInput.trim())) {
      setSettings({
        ...settings,
        specializations: [...settings.specializations, specializationInput.trim()]
      });
      setSpecializationInput('');
    }
  };

  const handleRemoveSpecialization = (spec) => {
    setSettings({
      ...settings,
      specializations: settings.specializations.filter(s => s !== spec)
    });
  };

  const handleAddPackage = () => {
    if (packageForm.name && packageForm.sessions && packageForm.price) {
      setSettings({
        ...settings,
        package_pricing: [
          ...settings.package_pricing,
          {
            name: packageForm.name,
            sessions: parseInt(packageForm.sessions),
            price: parseFloat(packageForm.price)
          }
        ]
      });
      setPackageForm({ name: '', sessions: '', price: '' });
    }
  };

  const handleRemovePackage = (index) => {
    setSettings({
      ...settings,
      package_pricing: settings.package_pricing.filter((_, i) => i !== index)
    });
  };

  const updateWorkingHours = (day, field, value) => {
    setSettings({
      ...settings,
      working_hours: {
        ...settings.working_hours,
        [day]: {
          ...settings.working_hours[day],
          [field]: value
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="w-8 h-8 text-primary" />
            Settings
          </h2>
          <p className="text-muted-foreground mt-1">Manage your business settings and preferences</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
        </TabsList>

        {/* Business Information Tab */}
        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Business Information
              </CardTitle>
              <CardDescription>
                Manage your professional business details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Business Name</label>
                  <Input
                    value={settings.business_name}
                    onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
                    placeholder="Your Nutrition Practice"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">License Number</label>
                  <Input
                    value={settings.license_number}
                    onChange={(e) => setSettings({ ...settings, license_number: e.target.value })}
                    placeholder="License #"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Business Address</label>
                <Textarea
                  value={settings.business_address}
                  onChange={(e) => setSettings({ ...settings, business_address: e.target.value })}
                  placeholder="123 Main St, City, State, ZIP"
                  rows={2}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Business Phone</label>
                <Input
                  value={settings.business_phone}
                  onChange={(e) => setSettings({ ...settings, business_phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Specializations</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={specializationInput}
                    onChange={(e) => setSpecializationInput(e.target.value)}
                    placeholder="e.g., Weight Loss, Sports Nutrition"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSpecialization()}
                  />
                  <Button onClick={handleAddSpecialization}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {settings.specializations.map((spec, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2"
                    >
                      {spec}
                      <button
                        onClick={() => handleRemoveSpecialization(spec)}
                        className="text-primary/60 hover:text-primary"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Availability Tab */}
        <TabsContent value="availability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Working Hours
              </CardTitle>
              <CardDescription>
                Set your available hours for client bookings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {daysOfWeek.map((day) => (
                <div key={day} className="flex items-center gap-4">
                  <div className="w-32">
                    <label className="flex items-center gap-2">
                      <Switch
                        checked={settings.working_hours[day]?.enabled || false}
                        onCheckedChange={(checked) => updateWorkingHours(day, 'enabled', checked)}
                      />
                      <span className="capitalize font-medium">{day}</span>
                    </label>
                  </div>
                  {settings.working_hours[day]?.enabled && (
                    <div className="flex items-center gap-2 min-w-0">
                      <Input
                        type="time"
                        value={settings.working_hours[day]?.start || '09:00'}
                        onChange={(e) => updateWorkingHours(day, 'start', e.target.value)}
                        className="w-32 min-w-0"
                      />
                      <span>to</span>
                      <Input
                        type="time"
                        value={settings.working_hours[day]?.end || '17:00'}
                        onChange={(e) => updateWorkingHours(day, 'end', e.target.value)}
                        className="w-32 min-w-0"
                      />
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-4 border-t border-border grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Default Consultation Duration</label>
                  <select
                    value={settings.consultation_duration_default}
                    onChange={(e) => setSettings({ ...settings, consultation_duration_default: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md"
                  >
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="90">90 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Buffer Time (minutes)</label>
                  <Input
                    type="number"
                    value={settings.buffer_time_minutes}
                    onChange={(e) => setSettings({ ...settings, buffer_time_minutes: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Booking Advance (days)</label>
                  <Input
                    type="number"
                    value={settings.booking_advance_days}
                    onChange={(e) => setSettings({ ...settings, booking_advance_days: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Consultation Pricing
              </CardTitle>
              <CardDescription>
                Set your consultation fees and package pricing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Hourly Rate</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.hourly_rate}
                    onChange={(e) => setSettings({ ...settings, hourly_rate: e.target.value })}
                    placeholder="100.00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Initial Consultation Fee</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.initial_consultation_fee}
                    onChange={(e) => setSettings({ ...settings, initial_consultation_fee: e.target.value })}
                    placeholder="150.00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Follow-up Fee</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.follow_up_fee}
                    onChange={(e) => setSettings({ ...settings, follow_up_fee: e.target.value })}
                    placeholder="75.00"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="font-semibold mb-4">Package Pricing</h4>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <Input
                    placeholder="Package name"
                    value={packageForm.name}
                    onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Sessions"
                    value={packageForm.sessions}
                    onChange={(e) => setPackageForm({ ...packageForm, sessions: e.target.value })}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={packageForm.price}
                    onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                  />
                  <Button onClick={handleAddPackage}>Add Package</Button>
                </div>

                {settings.package_pricing.length > 0 && (
                  <div className="space-y-2">
                    {settings.package_pricing.map((pkg, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{pkg.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {pkg.sessions} sessions • ${pkg.price}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePackage(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Manage how you receive notifications and reminders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, email_notifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via text message
                  </p>
                </div>
                <Switch
                  checked={settings.sms_notifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, sms_notifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Appointment Reminders</p>
                  <p className="text-sm text-muted-foreground">
                    Send reminders for upcoming appointments
                  </p>
                </div>
                <Switch
                  checked={settings.appointment_reminders}
                  onCheckedChange={(checked) => setSettings({ ...settings, appointment_reminders: checked })}
                />
              </div>

              {settings.appointment_reminders && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Send reminders (hours before appointment)
                  </label>
                  <Input
                    type="number"
                    value={settings.reminder_hours_before}
                    onChange={(e) => setSettings({ ...settings, reminder_hours_before: parseInt(e.target.value) })}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Branding & Customization
              </CardTitle>
              <CardDescription>
                Customize your brand appearance and communications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Brand Color</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={settings.brand_color}
                    onChange={(e) => setSettings({ ...settings, brand_color: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    value={settings.brand_color}
                    onChange={(e) => setSettings({ ...settings, brand_color: e.target.value })}
                    placeholder="#10b981"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Logo URL</label>
                <Input
                  value={settings.logo_url}
                  onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Custom Email Signature</label>
                <Textarea
                  value={settings.custom_email_signature}
                  onChange={(e) => setSettings({ ...settings, custom_email_signature: e.target.value })}
                  placeholder="Best regards,&#10;Your Name&#10;Certified Nutritionist"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button (sticky at bottom) */}
      <div className="flex justify-end sticky bottom-4">
        <Button onClick={handleSaveSettings} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save All Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default NutritionistSettings;
