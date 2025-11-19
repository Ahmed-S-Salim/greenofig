import { useState, useEffect } from 'react';
import { useSubscription } from './useSubscription';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

/**
 * Feature access control based on subscription plan
 * Define what features are available in each plan
 */
const PLAN_FEATURES = {
  free: {
    // Basic features
    basicDashboard: true,
    quickLog: true,
    progressTracking: true,

    // Limitations
    hasAds: true,
    maxMealPlansPerMonth: 2,
    maxWorkoutsPerMonth: 2,
    aiChatMessages: 10,
    advancedAnalytics: false,
    wearableIntegration: false,
    photoRecognition: false,
    nutritionistAccess: false,
    downloadReports: false,
    customGoals: false,
    prioritySupport: false,
  },

  premium: {
    // All free features
    basicDashboard: true,
    quickLog: true,
    progressTracking: true,

    // Premium features
    hasAds: false,
    maxMealPlansPerMonth: -1, // Unlimited
    maxWorkoutsPerMonth: -1, // Unlimited
    aiChatMessages: -1, // Unlimited
    advancedAnalytics: true,
    wearableIntegration: false,
    photoRecognition: false,
    nutritionistAccess: false,
    downloadReports: true,
    customGoals: true,
    prioritySupport: false,
  },

  pro: {
    // All premium features
    basicDashboard: true,
    quickLog: true,
    progressTracking: true,
    hasAds: false,
    maxMealPlansPerMonth: -1,
    maxWorkoutsPerMonth: -1,
    aiChatMessages: -1,
    advancedAnalytics: true,
    downloadReports: true,
    customGoals: true,

    // Pro features
    wearableIntegration: true,
    photoRecognition: false,
    nutritionistAccess: true,
    prioritySupport: true,
    mealPlanHistory: true,
    workoutHistory: true,
    biometricTracking: true,
  },

  elite: {
    // All pro features
    basicDashboard: true,
    quickLog: true,
    progressTracking: true,
    hasAds: false,
    maxMealPlansPerMonth: -1,
    maxWorkoutsPerMonth: -1,
    aiChatMessages: -1,
    advancedAnalytics: true,
    downloadReports: true,
    customGoals: true,
    wearableIntegration: true,
    nutritionistAccess: true,
    prioritySupport: true,
    mealPlanHistory: true,
    workoutHistory: true,
    biometricTracking: true,

    // Elite features
    photoRecognition: true,
    personalCoach: true,
    videoConsultations: true,
    dnaAnalysis: true,
    premiumRecipes: true,
    aiNutritionOptimization: true,
  },
};

/**
 * Hook to check feature access based on user's subscription
 * Now includes admin-set feature overrides!
 * @returns {Object} { hasAccess, hasAds, canUse, getRemainingUsage, plan }
 */
export const useFeatureAccess = () => {
  const { plan, isFree, isPremium, isPro, isElite, loading, isActive } = useSubscription();
  const { userProfile } = useAuth();
  const [featureOverrides, setFeatureOverrides] = useState(null);
  const [overridesLoading, setOverridesLoading] = useState(true);

  // Load feature overrides from database
  useEffect(() => {
    const loadOverrides = async () => {
      if (!userProfile?.id) {
        setOverridesLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_feature_overrides')
          .select('features')
          .eq('user_id', userProfile.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading feature overrides:', error);
        }

        setFeatureOverrides(data?.features || null);
      } catch (error) {
        console.error('Failed to load feature overrides:', error);
      } finally {
        setOverridesLoading(false);
      }
    };

    loadOverrides();
  }, [userProfile?.id]);

  // Determine which plan features to use
  // Database plans: Base, Premium, Ultimate, Elite
  // Feature keys: free, premium, pro, elite
  const getPlanKey = () => {
    if (isElite) return 'elite';
    if (isPro) return 'pro'; // Ultimate -> pro
    if (isPremium) return 'premium';
    return 'free'; // Base -> free
  };

  const planKey = getPlanKey();
  const basePlanFeatures = PLAN_FEATURES[planKey];

  // Merge plan features with admin overrides
  const features = featureOverrides
    ? { ...basePlanFeatures, ...featureOverrides }
    : basePlanFeatures;

  /**
   * Check if user has access to a specific feature
   * @param {string} featureName - Name of the feature
   * @returns {boolean}
   */
  const hasAccess = (featureName) => {
    if (!isActive && !isFree) {
      // Subscription expired, downgrade to free
      return PLAN_FEATURES.free[featureName] || false;
    }
    return features[featureName] || false;
  };

  /**
   * Check if user can use a limited feature
   * @param {string} featureName - Name of the feature
   * @param {number} currentUsage - Current usage count
   * @returns {boolean}
   */
  const canUse = (featureName, currentUsage = 0) => {
    const limit = features[featureName];
    if (limit === -1) return true; // Unlimited
    if (limit === true) return true; // Unlimited boolean feature
    if (typeof limit === 'number') {
      return currentUsage < limit;
    }
    return false;
  };

  /**
   * Get remaining usage for a limited feature
   * @param {string} featureName - Name of the feature
   * @param {number} currentUsage - Current usage count
   * @returns {number} -1 for unlimited, number for remaining
   */
  const getRemainingUsage = (featureName, currentUsage = 0) => {
    const limit = features[featureName];
    if (limit === -1 || limit === true) return -1; // Unlimited
    if (typeof limit === 'number') {
      return Math.max(0, limit - currentUsage);
    }
    return 0;
  };

  /**
   * Check if user should see ads
   * @returns {boolean}
   */
  const hasAds = features.hasAds || false;

  return {
    hasAccess,
    hasAds,
    canUse,
    getRemainingUsage,
    features,
    planKey,
    planName: plan?.name || 'Free',
    loading: loading || overridesLoading,
    hasOverrides: featureOverrides !== null,
  };
};
