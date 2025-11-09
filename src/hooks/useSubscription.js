import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { getUserSubscription } from '@/lib/stripeEnhanced';

/**
 * Hook to get user's current subscription and plan details
 * @returns {Object} { subscription, plan, loading, isActive, isPremium, isPro, isElite, isFree }
 */
export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSubscription();
    } else {
      setSubscription(null);
      setLoading(false);
    }
  }, [user]);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const data = await getUserSubscription(user.id);
      setSubscription(data);
    } catch (error) {
      console.error('Error loading subscription:', error);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const plan = subscription?.subscription_plans;
  const planName = plan?.name?.toLowerCase() || 'base';

  return {
    subscription,
    plan,
    loading,
    isActive: subscription?.status === 'active',
    isPremium: planName === 'premium',
    isPro: planName === 'ultimate', // "Ultimate" plan is the pro tier
    isElite: planName === 'elite',
    isFree: !subscription || planName === 'base' || planName === 'free',
    refresh: loadSubscription,
  };
};
