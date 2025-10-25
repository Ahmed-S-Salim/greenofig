import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DollarSign, Percent, Calendar, Gift, CreditCard } from 'lucide-react';

const CustomOfferDialog = ({ isOpen, onClose, user, onOfferCreated }) => {
  const [loading, setLoading] = useState(false);
  const [existingOffer, setExistingOffer] = useState(null);

  const [formData, setFormData] = useState({
    customPrice: '',
    discountPercentage: '',
    discountAmount: '',
    couponCode: '',
    subscriptionType: 'premium',
    billingCycle: 'monthly',
    trialDays: '0',
    features: {
      // Base features (all plans)
      aiPersonalizedPlan: true,
      basicProgressTracking: true,
      communityAccess: true,
      smartMealLogging: true,
      workoutLibrary: true,
      adaptiveGoalSetting: true,
      lifestyleHabitCoaching: true,
      recipeMealSuggestions: true,

      // Premium features
      macronutrientTracking: false,
      wearableDeviceSync: false,
      customWorkoutBuilder: false,
      advancedAnalytics: false,
      weeklyMonthlyReports: false,
      priorityNutritionistChat: false,
      sleepCycleAnalysis: false,
      groceryListGenerator: false,

      // Ultimate features
      realtimeFormFeedback: false,
      biomarkerIntegration: false,
      oneOnOneVideoCoaching: false,
      exclusiveChallenges: false,

      // Elite features
      photoFoodRecognition: false,
      prioritySupport: false,
      doctorConsultations: false,
    },
    featureLimits: {
      aiMessages: '100',
      workouts: '50',
      videoCoachingSessions: '0',
      doctorConsultations: '0',
    },
    hasPrioritySupport: false,
    hasBetaAccess: false,
    removeBranding: false,
    notes: '',
    internalNotes: '',
    offerEndDate: '',
    paymentPlanType: 'full', // 'full', 'split_payment', 'installment', 'pay_as_you_go'
    numberOfPayments: '2',
    paymentFrequency: 'monthly',
  });

  useEffect(() => {
    if (isOpen && user) {
      fetchExistingOffer();
    }
  }, [isOpen, user]);

  const fetchExistingOffer = async () => {
    const { data, error } = await supabase
      .from('custom_offers')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (data) {
      setExistingOffer(data);
      setFormData({
        customPrice: data.custom_price || '',
        discountPercentage: data.discount_percentage || '',
        discountAmount: data.discount_amount || '',
        couponCode: data.coupon_code || '',
        subscriptionType: data.subscription_type || 'premium',
        billingCycle: data.billing_cycle || 'monthly',
        trialDays: data.trial_days || '0',
        features: data.features || formData.features,
        featureLimits: data.feature_limits || formData.featureLimits,
        hasPrioritySupport: data.has_priority_support || false,
        hasBetaAccess: data.has_beta_access || false,
        removeBranding: data.remove_branding || false,
        notes: data.notes || '',
        internalNotes: data.internal_notes || '',
        offerEndDate: data.offer_end_date ? new Date(data.offer_end_date).toISOString().split('T')[0] : '',
        paymentPlanType: data.payment_plan_type || 'full',
        numberOfPayments: data.number_of_payments || '2',
        paymentFrequency: data.payment_frequency || 'monthly',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const baseOfferData = {
      custom_price: formData.customPrice ? parseFloat(formData.customPrice) : null,
      discount_percentage: formData.discountPercentage ? parseInt(formData.discountPercentage) : null,
      discount_amount: formData.discountAmount ? parseFloat(formData.discountAmount) : null,
      coupon_code: formData.couponCode || null,
      subscription_type: formData.subscriptionType,
      billing_cycle: formData.billingCycle,
      trial_days: parseInt(formData.trialDays),
      features: formData.features,
      feature_limits: {
        aiMessages: parseInt(formData.featureLimits.aiMessages),
        workouts: parseInt(formData.featureLimits.workouts),
        videoCoachingSessions: parseInt(formData.featureLimits.videoCoachingSessions),
        doctorConsultations: parseInt(formData.featureLimits.doctorConsultations),
      },
      has_priority_support: formData.hasPrioritySupport,
      has_beta_access: formData.hasBetaAccess,
      remove_branding: formData.removeBranding,
      notes: formData.notes,
      internal_notes: formData.internalNotes,
      offer_end_date: formData.offerEndDate || null,
      payment_plan_type: formData.paymentPlanType,
      number_of_payments: formData.paymentPlanType !== 'full' ? parseInt(formData.numberOfPayments) : null,
      payment_frequency: formData.paymentPlanType !== 'full' ? formData.paymentFrequency : null,
      is_active: true,
    };

    let error;

    // Handle bulk offers
    if (user?.bulk && user?.users) {
      const offersToInsert = user.users.map(u => ({
        ...baseOfferData,
        user_id: u.id,
      }));

      const result = await supabase
        .from('custom_offers')
        .insert(offersToInsert);
      error = result.error;

      if (!error) {
        toast({ title: `Bulk offer created for ${user.users.length} customers!` });
      }
    } else {
      // Single user offer
      const offerData = {
        ...baseOfferData,
        user_id: user.id,
      };

      if (existingOffer) {
        const result = await supabase
          .from('custom_offers')
          .update(offerData)
          .eq('id', existingOffer.id);
        error = result.error;
      } else {
        const result = await supabase
          .from('custom_offers')
          .insert(offerData);
        error = result.error;
      }

      if (!error) {
        toast({ title: 'Custom offer saved successfully!' });
      }
    }

    if (error) {
      toast({ title: 'Error saving offer', description: error.message, variant: 'destructive' });
    } else {
      if (onOfferCreated) onOfferCreated();
      onClose();
    }

    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-effect max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {user?.bulk
              ? `Create Bulk Offer for ${user.users?.length} Customers`
              : `${existingOffer ? 'Edit' : 'Create'} Custom Offer for ${user?.full_name}`
            }
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pricing Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Pricing
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Custom Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.customPrice}
                  onChange={(e) => setFormData({...formData, customPrice: e.target.value})}
                  placeholder="29.99"
                  className="glass-effect"
                />
              </div>
              <div>
                <Label>Discount (%)</Label>
                <Input
                  type="number"
                  value={formData.discountPercentage}
                  onChange={(e) => setFormData({...formData, discountPercentage: e.target.value})}
                  placeholder="20"
                  className="glass-effect"
                />
              </div>
              <div>
                <Label>Discount Amount ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.discountAmount}
                  onChange={(e) => setFormData({...formData, discountAmount: e.target.value})}
                  placeholder="5.00"
                  className="glass-effect"
                />
              </div>
              <div>
                <Label>Coupon Code (Optional)</Label>
                <Input
                  type="text"
                  value={formData.couponCode}
                  onChange={(e) => setFormData({...formData, couponCode: e.target.value.toUpperCase()})}
                  placeholder="SUMMER2024"
                  className="glass-effect"
                />
              </div>
            </div>
          </div>

          {/* Subscription Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Subscription Details
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Subscription Type</Label>
                <Select value={formData.subscriptionType} onValueChange={(val) => setFormData({...formData, subscriptionType: val})}>
                  <SelectTrigger className="glass-effect">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-effect">
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="elite">Elite</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Billing Cycle</Label>
                <Select value={formData.billingCycle} onValueChange={(val) => setFormData({...formData, billingCycle: val})}>
                  <SelectTrigger className="glass-effect">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-effect">
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="lifetime">Lifetime</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Trial Days</Label>
                <Input
                  type="number"
                  value={formData.trialDays}
                  onChange={(e) => setFormData({...formData, trialDays: e.target.value})}
                  className="glass-effect"
                />
              </div>
            </div>
            <div>
              <Label>Offer End Date (Optional)</Label>
              <Input
                type="date"
                value={formData.offerEndDate}
                onChange={(e) => setFormData({...formData, offerEndDate: e.target.value})}
                className="glass-effect"
              />
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              Features & Limits
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold text-primary">Base Features</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.features.aiPersonalizedPlan}
                        onCheckedChange={(checked) =>
                          setFormData({...formData, features: {...formData.features, aiPersonalizedPlan: checked}})
                        }
                      />
                      <Label className="cursor-pointer">AI Personalized Plan</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.features.basicProgressTracking}
                        onCheckedChange={(checked) =>
                          setFormData({...formData, features: {...formData.features, basicProgressTracking: checked}})
                        }
                      />
                      <Label className="cursor-pointer">Basic Progress Tracking</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.features.communityAccess}
                        onCheckedChange={(checked) =>
                          setFormData({...formData, features: {...formData.features, communityAccess: checked}})
                        }
                      />
                      <Label className="cursor-pointer">Community Access</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.features.smartMealLogging}
                        onCheckedChange={(checked) =>
                          setFormData({...formData, features: {...formData.features, smartMealLogging: checked}})
                        }
                      />
                      <Label className="cursor-pointer">Smart Meal Logging</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.features.workoutLibrary}
                        onCheckedChange={(checked) =>
                          setFormData({...formData, features: {...formData.features, workoutLibrary: checked}})
                        }
                      />
                      <Label className="cursor-pointer">Workout Library & Planner</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.features.adaptiveGoalSetting}
                        onCheckedChange={(checked) =>
                          setFormData({...formData, features: {...formData.features, adaptiveGoalSetting: checked}})
                        }
                      />
                      <Label className="cursor-pointer">Adaptive Goal Setting</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.features.lifestyleHabitCoaching}
                        onCheckedChange={(checked) =>
                          setFormData({...formData, features: {...formData.features, lifestyleHabitCoaching: checked}})
                        }
                      />
                      <Label className="cursor-pointer">Lifestyle Habit Coaching</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.features.recipeMealSuggestions}
                        onCheckedChange={(checked) =>
                          setFormData({...formData, features: {...formData.features, recipeMealSuggestions: checked}})
                        }
                      />
                      <Label className="cursor-pointer">Recipe & Meal Suggestions</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold text-green-400">Premium Features</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.features.macronutrientTracking}
                        onCheckedChange={(checked) =>
                          setFormData({...formData, features: {...formData.features, macronutrientTracking: checked}})
                        }
                      />
                      <Label className="cursor-pointer">Macronutrient Tracking</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.features.wearableDeviceSync}
                        onCheckedChange={(checked) =>
                          setFormData({...formData, features: {...formData.features, wearableDeviceSync: checked}})
                        }
                      />
                      <Label className="cursor-pointer">Wearable Device Sync</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.features.customWorkoutBuilder}
                        onCheckedChange={(checked) =>
                          setFormData({...formData, features: {...formData.features, customWorkoutBuilder: checked}})
                        }
                      />
                      <Label className="cursor-pointer">Custom Workout Builder</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.features.advancedAnalytics}
                        onCheckedChange={(checked) =>
                          setFormData({...formData, features: {...formData.features, advancedAnalytics: checked}})
                        }
                      />
                      <Label className="cursor-pointer">Advanced Analytics</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.features.weeklyMonthlyReports}
                        onCheckedChange={(checked) =>
                          setFormData({...formData, features: {...formData.features, weeklyMonthlyReports: checked}})
                        }
                      />
                      <Label className="cursor-pointer">Weekly & Monthly Reports</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.features.priorityNutritionistChat}
                        onCheckedChange={(checked) =>
                          setFormData({...formData, features: {...formData.features, priorityNutritionistChat: checked}})
                        }
                      />
                      <Label className="cursor-pointer">Priority Nutritionist Chat</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.features.sleepCycleAnalysis}
                        onCheckedChange={(checked) =>
                          setFormData({...formData, features: {...formData.features, sleepCycleAnalysis: checked}})
                        }
                      />
                      <Label className="cursor-pointer">Sleep Cycle Analysis</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.features.groceryListGenerator}
                        onCheckedChange={(checked) =>
                          setFormData({...formData, features: {...formData.features, groceryListGenerator: checked}})
                        }
                      />
                      <Label className="cursor-pointer">Grocery List Generator</Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold text-blue-400">Ultimate Features</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.features.realtimeFormFeedback}
                        onCheckedChange={(checked) =>
                          setFormData({...formData, features: {...formData.features, realtimeFormFeedback: checked}})
                        }
                      />
                      <Label className="cursor-pointer">Real-time Form Feedback</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.features.biomarkerIntegration}
                        onCheckedChange={(checked) =>
                          setFormData({...formData, features: {...formData.features, biomarkerIntegration: checked}})
                        }
                      />
                      <Label className="cursor-pointer">Biomarker Integration</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.features.oneOnOneVideoCoaching}
                        onCheckedChange={(checked) =>
                          setFormData({...formData, features: {...formData.features, oneOnOneVideoCoaching: checked}})
                        }
                      />
                      <Label className="cursor-pointer">1-on-1 Video Coaching</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.features.exclusiveChallenges}
                        onCheckedChange={(checked) =>
                          setFormData({...formData, features: {...formData.features, exclusiveChallenges: checked}})
                        }
                      />
                      <Label className="cursor-pointer">Exclusive Challenges</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold text-purple-400">Elite Features</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.features.photoFoodRecognition}
                        onCheckedChange={(checked) =>
                          setFormData({...formData, features: {...formData.features, photoFoodRecognition: checked}})
                        }
                      />
                      <Label className="cursor-pointer">Photo Food Recognition</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.features.prioritySupport}
                        onCheckedChange={(checked) =>
                          setFormData({...formData, features: {...formData.features, prioritySupport: checked}})
                        }
                      />
                      <Label className="cursor-pointer">Priority Support</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.features.doctorConsultations}
                        onCheckedChange={(checked) =>
                          setFormData({...formData, features: {...formData.features, doctorConsultations: checked}})
                        }
                      />
                      <Label className="cursor-pointer">Doctor Consultations</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">Feature Limits</Label>
                  <div className="space-y-3 mt-2">
                    <div>
                      <Label className="text-sm">AI Messages Limit</Label>
                      <Input
                        type="number"
                        value={formData.featureLimits.aiMessages}
                        onChange={(e) => setFormData({
                          ...formData,
                          featureLimits: {...formData.featureLimits, aiMessages: e.target.value}
                        })}
                        className="glass-effect"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Workouts Limit</Label>
                      <Input
                        type="number"
                        value={formData.featureLimits.workouts}
                        onChange={(e) => setFormData({
                          ...formData,
                          featureLimits: {...formData.featureLimits, workouts: e.target.value}
                        })}
                        className="glass-effect"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Video Coaching Sessions</Label>
                      <Input
                        type="number"
                        value={formData.featureLimits.videoCoachingSessions}
                        onChange={(e) => setFormData({
                          ...formData,
                          featureLimits: {...formData.featureLimits, videoCoachingSessions: e.target.value}
                        })}
                        className="glass-effect"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Doctor Consultations</Label>
                      <Input
                        type="number"
                        value={formData.featureLimits.doctorConsultations}
                        onChange={(e) => setFormData({
                          ...formData,
                          featureLimits: {...formData.featureLimits, doctorConsultations: e.target.value}
                        })}
                        className="glass-effect"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Perks */}
          <div className="space-y-3">
            <Label>Special Perks</Label>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData.hasPrioritySupport}
                onCheckedChange={(checked) => setFormData({...formData, hasPrioritySupport: checked})}
              />
              <Label className="cursor-pointer">Priority Support</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData.hasBetaAccess}
                onCheckedChange={(checked) => setFormData({...formData, hasBetaAccess: checked})}
              />
              <Label className="cursor-pointer">Beta Features Access</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData.removeBranding}
                onCheckedChange={(checked) => setFormData({...formData, removeBranding: checked})}
              />
              <Label className="cursor-pointer">Remove Branding</Label>
            </div>
          </div>

          {/* Payment Plans */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Payment Plan
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Payment Type</Label>
                <Select value={formData.paymentPlanType} onValueChange={(val) => setFormData({...formData, paymentPlanType: val})}>
                  <SelectTrigger className="glass-effect">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-effect">
                    <SelectItem value="full">Full Payment</SelectItem>
                    <SelectItem value="split_payment">Split Payment</SelectItem>
                    <SelectItem value="installment">Installment Plan</SelectItem>
                    <SelectItem value="pay_as_you_go">Pay As You Go</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.paymentPlanType !== 'full' && formData.paymentPlanType !== 'pay_as_you_go' && (
                <>
                  <div>
                    <Label>Number of Payments</Label>
                    <Input
                      type="number"
                      value={formData.numberOfPayments}
                      onChange={(e) => setFormData({...formData, numberOfPayments: e.target.value})}
                      className="glass-effect"
                      min="2"
                    />
                  </div>
                  <div>
                    <Label>Payment Frequency</Label>
                    <Select value={formData.paymentFrequency} onValueChange={(val) => setFormData({...formData, paymentFrequency: val})}>
                      <SelectTrigger className="glass-effect">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-effect">
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <div>
              <Label>Customer Notes (Visible to customer)</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Special offer for being a loyal customer..."
                className="glass-effect"
                rows={3}
              />
            </div>
            <div>
              <Label>Internal Notes (Admin only)</Label>
              <Textarea
                value={formData.internalNotes}
                onChange={(e) => setFormData({...formData, internalNotes: e.target.value})}
                placeholder="Notes for internal use..."
                className="glass-effect"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : existingOffer ? 'Update Offer' : 'Create Offer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomOfferDialog;
