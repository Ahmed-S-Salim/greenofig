import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { CreditCard, Calendar, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { getUserSubscription, cancelSubscription } from '@/lib/stripe';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const SubscriptionManager = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    setLoading(true);
    try {
      const data = await getUserSubscription(user.id);
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will still have access until the end of your billing period.')) {
      return;
    }

    setCanceling(true);
    try {
      await cancelSubscription(user.id);
      toast({
        title: 'Subscription Canceled',
        description: 'Your subscription will remain active until the end of the current billing period',
      });
      fetchSubscription();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription',
        variant: 'destructive',
      });
    } finally {
      setCanceling(false);
    }
  };

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  if (loading) {
    return (
      <Card className="glass-effect">
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-white/10 rounded w-1/3"></div>
            <div className="h-4 bg-white/10 rounded w-1/2"></div>
            <div className="h-10 bg-white/10 rounded w-1/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            No Active Subscription
          </CardTitle>
          <CardDescription>You don't have an active subscription yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <AlertCircle className="w-12 h-12 text-text-secondary" />
            <p className="text-text-secondary">
              Subscribe to a plan to unlock premium features
            </p>
            <Button onClick={handleUpgrade}>
              View Plans
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const plan = subscription.subscription_plans;
  const isActive = subscription.status === 'active';
  const isCanceled = subscription.cancel_at_period_end || subscription.status === 'canceled';
  const periodEnd = subscription.current_period_end ? new Date(subscription.current_period_end) : null;

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                {plan.name} Plan
              </CardTitle>
              <CardDescription className="mt-2">{plan.description}</CardDescription>
            </div>
            {isActive && !isCanceled ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Active
              </Badge>
            ) : isCanceled ? (
              <Badge variant="destructive">
                <XCircle className="w-3 h-3 mr-1" />
                Canceled
              </Badge>
            ) : (
              <Badge variant="secondary">
                {subscription.status}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Billing Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border bg-background/50">
              <div className="flex items-center gap-2 text-sm text-text-secondary mb-1">
                <CreditCard className="w-4 h-4" />
                Billing Cycle
              </div>
              <p className="text-lg font-semibold capitalize">{subscription.billing_cycle}</p>
            </div>

            {periodEnd && (
              <div className="p-4 rounded-lg border border-border bg-background/50">
                <div className="flex items-center gap-2 text-sm text-text-secondary mb-1">
                  <Calendar className="w-4 h-4" />
                  {isCanceled ? 'Access Until' : 'Next Billing Date'}
                </div>
                <p className="text-lg font-semibold">{periodEnd.toLocaleDateString()}</p>
              </div>
            )}
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold mb-3">Included Features:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {plan.features?.map((feature, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            {!isCanceled ? (
              <>
                <Button onClick={handleUpgrade} variant="default">
                  Upgrade Plan
                </Button>
                <Button
                  onClick={handleCancelSubscription}
                  disabled={canceling}
                  variant="outline"
                  className="text-destructive hover:bg-destructive/10"
                >
                  {canceling ? 'Canceling...' : 'Cancel Subscription'}
                </Button>
              </>
            ) : (
              <Button onClick={handleUpgrade} variant="default">
                Reactivate Subscription
              </Button>
            )}
          </div>

          {isCanceled && (
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-yellow-400">
                Your subscription has been canceled and will remain active until {periodEnd?.toLocaleDateString()}.
                You can reactivate it anytime before this date.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionManager;
