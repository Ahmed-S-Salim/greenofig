import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import {
  CreditCard,
  Check,
  Calendar,
  DollarSign,
  AlertCircle,
  Loader2,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import {
  getUserSubscription,
  cancelSubscription,
  getUserPaymentMethods
} from '@/lib/stripeEnhanced';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const SubscriptionManager = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    if (user) {
      loadSubscriptionData();
    }
  }, [user]);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const [subData, pmData] = await Promise.all([
        getUserSubscription(user.id),
        getUserPaymentMethods(user.id),
      ]);

      setSubscription(subData);
      setPaymentMethods(pmData);
    } catch (error) {
      console.error('Error loading subscription data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscription data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setCanceling(true);
      await cancelSubscription(user.id);

      toast({
        title: 'Subscription Canceled',
        description: 'Your subscription will remain active until the end of the current billing period.',
      });

      setShowCancelDialog(false);
      await loadSubscriptionData();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription',
        variant: 'destructive',
      });
    } finally {
      setCanceling(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: 'default', label: 'Active', color: 'bg-green-500' },
      past_due: { variant: 'destructive', label: 'Past Due', color: 'bg-red-500' },
      canceled: { variant: 'secondary', label: 'Canceled', color: 'bg-gray-500' },
      paused: { variant: 'secondary', label: 'Paused', color: 'bg-yellow-500' },
    };

    const config = statusConfig[status] || statusConfig.canceled;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-lg">Loading subscription...</span>
        </div>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <CreditCard className="w-16 h-16 mx-auto text-text-secondary mb-4" />
          <h3 className="text-xl font-bold mb-2">No Active Subscription</h3>
          <p className="text-text-secondary mb-6">
            Subscribe to a plan to unlock all features and benefits.
          </p>
          <Button onClick={() => window.location.href = '/pricing'}>
            View Plans
          </Button>
        </div>
      </Card>
    );
  }

  const plan = subscription.subscription_plans;

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
            <p className="text-text-secondary">{plan.description}</p>
          </div>
          {getStatusBadge(subscription.status)}
        </div>

        {/* Billing Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-primary mt-1" />
            <div>
              <p className="text-sm text-text-secondary">Billing Amount</p>
              <p className="text-lg font-semibold">
                ${subscription.billing_cycle === 'yearly' ? plan.price_yearly : plan.price_monthly}
                <span className="text-sm font-normal text-text-secondary">
                  /{subscription.billing_cycle === 'yearly' ? 'year' : 'month'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-primary mt-1" />
            <div>
              <p className="text-sm text-text-secondary">Next Billing Date</p>
              <p className="text-lg font-semibold">
                {formatDate(subscription.current_period_end)}
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        {plan.features && plan.features.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Included Features</h4>
            <div className="grid md:grid-cols-2 gap-2">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cancellation Warning */}
        {subscription.cancel_at_period_end && (
          <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-6">
            <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-500">Subscription Ending</p>
              <p className="text-sm text-text-secondary">
                Your subscription will end on {formatDate(subscription.current_period_end)}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        {subscription.status === 'active' && !subscription.cancel_at_period_end && (
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => window.location.href = '/pricing'}>
              Upgrade Plan
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowCancelDialog(true)}
              className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancel Subscription
            </Button>
          </div>
        )}
      </Card>

      {/* Payment Methods */}
      {paymentMethods.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Payment Methods</h3>
          <div className="space-y-3">
            {paymentMethods.map((pm) => (
              <div key={pm.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-text-secondary" />
                  <div>
                    <p className="font-semibold">
                      {pm.card_brand?.toUpperCase()} •••• {pm.card_last4}
                    </p>
                    <p className="text-sm text-text-secondary">
                      Expires {pm.card_exp_month}/{pm.card_exp_year}
                    </p>
                  </div>
                </div>
                {pm.is_default && (
                  <Badge variant="outline">Default</Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your subscription? You will continue to have access
              until {formatDate(subscription?.current_period_end)}, but your subscription will not
              renew after that date.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={canceling}
              className="bg-red-500 hover:bg-red-600"
            >
              {canceling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Canceling...
                </>
              ) : (
                'Yes, Cancel'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SubscriptionManager;
