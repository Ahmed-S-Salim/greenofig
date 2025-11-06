import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { CreditCard, Check, Loader2, Lock } from 'lucide-react';
import { createCheckoutSession, createPaymentTransaction, updateSubscription } from '@/lib/stripe';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const CheckoutDialog = ({ open, onOpenChange, plan, billingCycle = 'monthly' }) => {
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);

  if (!plan) return null;

  const amount = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;
  const yearlyTotal = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly * 12;
  const savings = billingCycle === 'yearly' ? (plan.price_monthly * 12 - plan.price_yearly) : 0;

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: 'Not Logged In',
        description: 'Please log in to purchase a subscription',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);

    try {
      // Create a payment transaction record
      const transaction = await createPaymentTransaction({
        userId: user.id,
        subscriptionPlanId: plan.id,
        amount,
        billingCycle,
        paymentIntentId: `mock_pi_${Date.now()}`,
        status: 'pending',
      });

      // Simulate payment processing (in real app, this would redirect to Stripe)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update transaction to succeeded
      await createPaymentTransaction({
        userId: user.id,
        subscriptionPlanId: plan.id,
        amount,
        billingCycle,
        paymentIntentId: transaction.payment_intent_id,
        status: 'succeeded',
      });

      // Update user subscription
      const now = new Date();
      const periodEnd = new Date(now);
      if (billingCycle === 'yearly') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      await updateSubscription({
        userId: user.id,
        subscriptionPlanId: plan.id,
        stripeSubscriptionId: `sub_${Date.now()}`,
        status: 'active',
        billingCycle,
        currentPeriodStart: now.toISOString(),
        currentPeriodEnd: periodEnd.toISOString(),
      });

      toast({
        title: 'Payment Successful!',
        description: `You've successfully subscribed to ${plan.name}`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Payment Failed',
        description: error.message || 'An error occurred during checkout',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-effect custom-scrollbar max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
            Checkout
          </DialogTitle>
          <DialogDescription className="text-sm">Complete your subscription purchase</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 min-w-0 max-w-full">
          {/* Plan Summary */}
          <div className="p-4 rounded-lg border border-border bg-background/50" role="region" aria-label="Plan summary">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-sm text-text-secondary mt-1">{plan.description}</p>
              </div>
              {plan.is_popular && (
                <Badge className="bg-primary/20 text-primary self-start">Popular</Badge>
              )}
            </div>

            <div className="space-y-2 pt-4 border-t border-border">
              <div className="flex justify-between text-sm">
                <span>Billing Cycle:</span>
                <span className="font-semibold capitalize">{billingCycle}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Price:</span>
                <span className="font-semibold">
                  ${amount.toFixed(2)}/{billingCycle === 'yearly' ? 'year' : 'month'}
                </span>
              </div>
              {billingCycle === 'yearly' && savings > 0 && (
                <div className="flex justify-between text-sm text-green-400">
                  <span>You Save:</span>
                  <span className="font-semibold">${savings.toFixed(2)}/year</span>
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">What's included:</h4>
            <ul className="space-y-2">
              {plan.features?.slice(0, 5).map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
              {plan.features?.length > 5 && (
                <li className="text-sm text-text-secondary">
                  + {plan.features.length - 5} more features
                </li>
              )}
            </ul>
          </div>

          {/* Total */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total Due Today:</span>
              <span className="text-2xl font-bold">${amount.toFixed(2)}</span>
            </div>
            {billingCycle === 'yearly' && (
              <p className="text-xs text-text-secondary mt-2">
                Billed annually (${(amount / 12).toFixed(2)}/month)
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3 min-w-0">
            <Button
              onClick={handleCheckout}
              disabled={processing}
              className="w-full min-w-0 h-11 sm:h-12 text-base"
              aria-label={processing ? 'Processing payment' : 'Complete purchase'}
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" aria-hidden="true" />
                  Complete Purchase
                </>
              )}
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              disabled={processing}
              variant="outline"
              className="w-full min-w-0 h-11 sm:h-12 text-base"
              aria-label="Cancel checkout"
            >
              Cancel
            </Button>
          </div>

          {/* Security Note */}
          <div className="text-center text-xs text-text-secondary" role="note">
            <Lock className="w-3 h-3 inline mr-1" aria-hidden="true" />
            Secure payment powered by Stripe
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
