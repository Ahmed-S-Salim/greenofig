import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import { X, Plus } from 'lucide-react';

// Predefined features available in the system
const PREDEFINED_FEATURES = {
  base: [
    'AI Personalized Plan',
    'Basic Progress Tracking',
    'Community Access',
    'Smart Meal Logging',
    'Workout Library & Planner',
    'Adaptive Goal Setting',
    'Lifestyle Habit Coaching',
    'Recipe & Meal Suggestions',
  ],
  premium: [
    'All Base Features',
    'Macronutrient Tracking',
    'Wearable Device Sync',
    'Custom Workout Builder',
    'Advanced Analytics',
    'Weekly & Monthly Reports',
    'Priority Nutritionist Chat',
    'Sleep Cycle Analysis',
    'Grocery List Generator',
  ],
  ultimate: [
    'All Premium Features',
    'Real-time Form Feedback',
    'Biomarker Integration',
    '1-on-1 Video Coaching (2/month)',
    'Exclusive Challenges',
    'Custom Meal Plans',
    'Performance Optimization',
    'Advanced Body Composition Analysis',
  ],
  elite: [
    'All Ultimate Features',
    'Photo Food Recognition',
    'Priority Support (24/7)',
    'Doctor Consultations (2/month)',
    'Unlimited Video Coaching',
    'Personalized Supplement Plan',
    'VIP Community Access',
    'Concierge Service',
  ],
};

// Flatten all features into a single list
const ALL_FEATURES = [
  ...PREDEFINED_FEATURES.base,
  ...PREDEFINED_FEATURES.premium,
  ...PREDEFINED_FEATURES.ultimate,
  ...PREDEFINED_FEATURES.elite,
].filter((feature, index, self) => self.indexOf(feature) === index); // Remove duplicates

const AddPlanDialog = ({ open, onOpenChange, onPlanAdded, editPlan = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_monthly: '',
    price_yearly: '',
    is_popular: false,
    is_active: true,
    stripe_price_id: '',
    stripe_product_id: '',
  });

  const [features, setFeatures] = useState([{ type: 'predefined', value: '' }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editPlan) {
      setFormData({
        name: editPlan.name || '',
        description: editPlan.description || '',
        price_monthly: editPlan.price_monthly || '',
        price_yearly: editPlan.price_yearly || '',
        is_popular: editPlan.is_popular || false,
        is_active: editPlan.is_active !== false,
        stripe_price_id: editPlan.stripe_price_id || '',
        stripe_product_id: editPlan.stripe_product_id || '',
      });
      // Convert existing features to the new format
      const formattedFeatures = editPlan.features?.length > 0
        ? editPlan.features.map(f => ({ type: 'predefined', value: f }))
        : [{ type: 'predefined', value: '' }];
      setFeatures(formattedFeatures);
    } else {
      // Reset form for new plan
      setFormData({
        name: '',
        description: '',
        price_monthly: '',
        price_yearly: '',
        is_popular: false,
        is_active: true,
        stripe_price_id: '',
        stripe_product_id: '',
      });
      setFeatures([{ type: 'predefined', value: '' }]);
    }
  }, [editPlan, open]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name, checked) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleFeatureTypeChange = (index, type) => {
    const newFeatures = [...features];
    newFeatures[index] = { type, value: '' };
    setFeatures(newFeatures);
  };

  const handleFeatureValueChange = (index, value) => {
    const newFeatures = [...features];
    newFeatures[index] = { ...newFeatures[index], value };
    setFeatures(newFeatures);
  };

  const addFeature = (type = 'predefined') => {
    setFeatures([...features, { type, value: '' }]);
  };

  const removeFeature = (index) => {
    if (features.length > 1) {
      setFeatures(features.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Filter out empty features and extract values
      const filteredFeatures = features
        .map(f => f.value)
        .filter(f => f.trim() !== '');

      if (!formData.name || !formData.description || !formData.price_monthly) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields (Name, Description, Monthly Price)',
          variant: 'destructive',
        });
        setSaving(false);
        return;
      }

      if (filteredFeatures.length === 0) {
        toast({
          title: 'Validation Error',
          description: 'Please add at least one feature',
          variant: 'destructive',
        });
        setSaving(false);
        return;
      }

      const planData = {
        name: formData.name,
        description: formData.description,
        price_monthly: parseFloat(formData.price_monthly),
        price_yearly: formData.price_yearly ? parseFloat(formData.price_yearly) : null,
        features: filteredFeatures,
        is_popular: formData.is_popular,
        is_active: formData.is_active,
        stripe_price_id: formData.stripe_price_id || null,
        stripe_product_id: formData.stripe_product_id || null,
      };

      let result;
      if (editPlan) {
        // Update existing plan
        result = await supabase
          .from('subscription_plans')
          .update(planData)
          .eq('id', editPlan.id)
          .select()
          .single();
      } else {
        // Insert new plan
        result = await supabase
          .from('subscription_plans')
          .insert([planData])
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      toast({
        title: editPlan ? 'Plan Updated!' : 'Plan Created!',
        description: `${formData.name} has been ${editPlan ? 'updated' : 'created'} successfully.`,
      });

      onPlanAdded();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save plan',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-effect custom-scrollbar max-w-[95vw] sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg lg:text-xl">{editPlan ? 'Edit Plan' : 'Add New Subscription Plan'}</DialogTitle>
          <DialogDescription className="text-sm">
            {editPlan ? 'Update the subscription plan details below.' : 'Create a new subscription plan for your customers.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 min-w-0 max-w-full">
          {/* Basic Info */}
          <div className="space-y-4 min-w-0">
            <div className="space-y-2 min-w-0">
              <Label htmlFor="name" className="text-sm">Plan Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Premium, Ultimate, Elite"
                className="w-full min-w-0 text-base"
                style={{ fontSize: '16px' }}
                required
              />
            </div>

            <div className="space-y-2 min-w-0">
              <Label htmlFor="description" className="text-sm">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of the plan"
                className="w-full min-w-0 resize-none text-base"
                style={{ fontSize: '16px' }}
                rows={3}
                required
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
            <div className="space-y-2 min-w-0">
              <Label htmlFor="price_monthly" className="text-sm">Monthly Price ($) *</Label>
              <Input
                id="price_monthly"
                name="price_monthly"
                type="number"
                step="0.01"
                min="0"
                value={formData.price_monthly}
                onChange={handleInputChange}
                placeholder="9.99"
                className="w-full min-w-0 text-base"
                style={{ fontSize: '16px' }}
                required
              />
            </div>

            <div className="space-y-2 min-w-0">
              <Label htmlFor="price_yearly" className="text-sm">Yearly Price ($)</Label>
              <Input
                id="price_yearly"
                name="price_yearly"
                type="number"
                step="0.01"
                min="0"
                value={formData.price_yearly}
                onChange={handleInputChange}
                placeholder="99.00"
                className="w-full min-w-0 text-base"
                style={{ fontSize: '16px' }}
              />
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3 min-w-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <Label className="text-sm">Features *</Label>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => addFeature('predefined')} size="sm" variant="outline" className="h-8 text-xs">
                  <Plus className="w-3 h-3 mr-1" />
                  Add from List
                </Button>
                <Button type="button" onClick={() => addFeature('custom')} size="sm" variant="outline" className="h-8 text-xs">
                  <Plus className="w-3 h-3 mr-1" />
                  Custom Feature
                </Button>
              </div>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 min-w-0">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-2 items-start p-3 border border-green-500/30 rounded-lg bg-background/50 min-w-0">
                  <div className="flex-grow space-y-2 min-w-0">
                    {feature.type === 'predefined' ? (
                      <Select
                        value={feature.value}
                        onValueChange={(value) => handleFeatureValueChange(index, value)}
                      >
                        <SelectTrigger className="w-full min-w-0 text-base">
                          <SelectValue placeholder="Select a feature..." />
                        </SelectTrigger>
                        <SelectContent className="glass-effect max-h-[300px] max-w-[90vw]">
                          <SelectItem value="All Base Features">All Base Features</SelectItem>
                          <SelectItem value="All Premium Features">All Premium Features</SelectItem>
                          <SelectItem value="All Ultimate Features">All Ultimate Features</SelectItem>
                          {ALL_FEATURES.map((feat) => (
                            <SelectItem key={feat} value={feat}>
                              {feat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={feature.value}
                        onChange={(e) => handleFeatureValueChange(index, e.target.value)}
                        placeholder="Enter custom feature..."
                        className="w-full min-w-0 text-base"
                        style={{ fontSize: '16px' }}
                      />
                    )}
                    <Button
                      type="button"
                      onClick={() => handleFeatureTypeChange(index, feature.type === 'predefined' ? 'custom' : 'predefined')}
                      size="sm"
                      variant="ghost"
                      className="text-xs h-6 px-2"
                    >
                      {feature.type === 'predefined' ? 'Switch to Custom' : 'Switch to List'}
                    </Button>
                  </div>
                  {features.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeFeature(index)}
                      variant="ghost"
                      size="icon"
                      className="mt-1 flex-shrink-0 h-8 w-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Stripe Integration (Optional) */}
          <div className="space-y-4 border-t pt-4 min-w-0">
            <h3 className="font-semibold text-sm">Stripe Integration (Optional)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
              <div className="space-y-2 min-w-0">
                <Label htmlFor="stripe_price_id" className="text-sm">Stripe Price ID</Label>
                <Input
                  id="stripe_price_id"
                  name="stripe_price_id"
                  value={formData.stripe_price_id}
                  onChange={handleInputChange}
                  placeholder="price_xxxxx"
                  className="w-full min-w-0 text-base"
                  style={{ fontSize: '16px' }}
                />
              </div>

              <div className="space-y-2 min-w-0">
                <Label htmlFor="stripe_product_id" className="text-sm">Stripe Product ID</Label>
                <Input
                  id="stripe_product_id"
                  name="stripe_product_id"
                  value={formData.stripe_product_id}
                  onChange={handleInputChange}
                  placeholder="prod_xxxxx"
                  className="w-full min-w-0 text-base"
                  style={{ fontSize: '16px' }}
                />
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-4 border-t pt-4 min-w-0">
            <div className="flex items-start gap-3">
              <Checkbox
                id="is_popular"
                checked={formData.is_popular}
                onCheckedChange={(checked) => handleSwitchChange('is_popular', checked)}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <Label htmlFor="is_popular" className="text-sm">Mark as Popular</Label>
                <p className="text-xs text-text-secondary">Display a "Most Popular" badge</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <Label htmlFor="is_active" className="text-sm">Active</Label>
                <p className="text-xs text-text-secondary">Make this plan available to customers</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap justify-end gap-2 sm:gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} size="sm" className="h-9 px-3">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} size="sm" className="h-9 px-3">
              {saving ? 'Saving...' : editPlan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPlanDialog;
