import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  Check,
  X,
  Crown,
  Star,
  Sparkles,
  TrendingUp,
  Calendar,
  DollarSign,
  AlertCircle,
  Download,
  Receipt
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe (replace with your publishable key)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...');

const SubscriptionManagement = () => {
  const { user, userProfile } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const plans = [
    {
      id: 'base',
      name: 'Base',
      price: 9.99,
      priceId: 'price_base_monthly',
      icon: Sparkles,
      color: 'gray',
      features: [
        'Basic meal plans',
        'Weekly check-ins',
        'Email support (24-48hr response)',
        'Limited messaging (5/week)',
        'Basic progress tracking',
        'Recipe library access'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 19.99,
      priceId: 'price_premium_monthly',
      icon: Star,
      color: 'blue',
      popular: true,
      features: [
        'Everything in Base',
        'Custom meal plans',
        'Priority support (24-48hr)',
        'Enhanced messaging (20/week)',
        'Advanced analytics',
        'Workout integration',
        'Monthly progress reports',
        'Meal prep guides'
      ]
    },
    {
      id: 'elite',
      name: 'Elite',
      price: 29.99,
      priceId: 'price_elite_monthly',
      icon: Crown,
      color: 'yellow',
      features: [
        'Everything in Premium',
        'Real-time messaging (unlimited)',
        'Video consultations (2/month)',
        'Priority support (same-day)',
        'Personalized workout plans',
        '24/7 AI coach access',
        'Weekly progress calls',
        'Custom supplement advice',
        'VIP community access'
      ]
    }
  ];

  useEffect(() => {
    fetchSubscriptionData();
  }, [user]);

  const fetchSubscriptionData = async () => {
    setLoading(true);
    try {
      // Fetch active subscription
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('client_id', user.id)
        .eq('status', 'active')
        .single();

      if (subError && subError.code !== 'PGRST116') throw subError;
      setSubscription(subData);

      // Fetch payment history
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payment_history')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (paymentsError) throw paymentsError;
      setPaymentHistory(paymentsData || []);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan) => {
    setSelectedPlan(plan);
    setDialogOpen(true);
  };

  const processSubscription = async () => {
    if (!selectedPlan) return;

    setProcessingPayment(true);
    try {
      // Call your backend API to create Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: selectedPlan.priceId,
          userId: user.id,
          tier: selectedPlan.name
        })
      });

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        console.error('Stripe checkout error:', error);
        alert('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Error processing subscription:', error);
      alert('Failed to process payment. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    const confirmed = confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.');
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ cancel_at_period_end: true })
        .eq('id', subscription.id);

      if (error) throw error;

      alert('Subscription will be cancelled at the end of the current billing period.');
      await fetchSubscriptionData();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription. Please try again.');
    }
  };

  const downloadInvoice = async (invoiceUrl) => {
    window.open(invoiceUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Current Subscription */}
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>Manage your active subscription plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{subscription.tier} Plan</h3>
                  <p className="text-sm text-text-secondary">
                    ${subscription.price_per_month}/month
                  </p>
                </div>
              </div>
              <Badge variant={subscription.status === 'active' ? 'success' : 'secondary'}>
                {subscription.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-text-secondary">Next billing date</p>
                <p className="font-semibold">{format(new Date(subscription.next_billing_date), 'MMM dd, yyyy')}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Billing period</p>
                <p className="font-semibold capitalize">{subscription.billing_period}</p>
              </div>
            </div>

            {subscription.cancel_at_period_end && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  Your subscription will end on {format(new Date(subscription.current_period_end), 'MMM dd, yyyy')}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancelSubscription} disabled={subscription.cancel_at_period_end}>
                Cancel Subscription
              </Button>
              <Button variant="outline">
                <CreditCard className="w-4 h-4 mr-2" />
                Update Payment Method
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      {(!subscription || subscription.cancel_at_period_end) && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Choose Your Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = subscription?.tier === plan.name;

              return (
                <Card
                  key={plan.id}
                  className={`relative ${plan.popular ? 'border-primary border-2' : ''} ${isCurrentPlan ? 'bg-primary/5' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary">Most Popular</Badge>
                    </div>
                  )}

                  <CardHeader>
                    <div className="flex items-center gap-3 mb-4">
                      <Icon className={`w-8 h-8 text-${plan.color}-500`} />
                      <div>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>
                          <span className="text-2xl font-bold text-foreground">${plan.price}</span>
                          <span className="text-text-secondary">/month</span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="w-full"
                      variant={plan.popular ? 'default' : 'outline'}
                      onClick={() => handleSubscribe(plan)}
                      disabled={isCurrentPlan}
                    >
                      {isCurrentPlan ? 'Current Plan' : `Subscribe to ${plan.name}`}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Payment History */}
      {paymentHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>View your past transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentHistory.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      payment.status === 'succeeded' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {payment.status === 'succeeded' ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <X className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">${payment.amount}</p>
                      <p className="text-sm text-text-secondary">
                        {format(new Date(payment.created_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={payment.status === 'succeeded' ? 'success' : 'destructive'}>
                      {payment.status}
                    </Badge>
                    {payment.status === 'succeeded' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadInvoice(payment.stripe_invoice_id)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Invoice
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Subscription</DialogTitle>
            <DialogDescription>
              You are about to subscribe to the {selectedPlan?.name} plan
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{selectedPlan.name} Plan</span>
                  <span className="text-xl font-bold">${selectedPlan.price}/month</span>
                </div>
                <p className="text-sm text-text-secondary">
                  Billed monthly • Cancel anytime
                </p>
              </div>

              <div>
                <p className="font-semibold mb-2">What you'll get:</p>
                <ul className="space-y-2">
                  {selectedPlan.features.slice(0, 5).map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={processingPayment}>
              Cancel
            </Button>
            <Button onClick={processSubscription} disabled={processingPayment}>
              {processingPayment ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Proceed to Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionManagement;
