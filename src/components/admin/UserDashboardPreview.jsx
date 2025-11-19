import React, { useMemo } from 'react';
import UserDashboard from '@/pages/UserDashboard';

// Mock context providers
const MockAuthContext = React.createContext(null);
const MockFeatureAccessContext = React.createContext(null);

const UserDashboardPreview = ({ tier }) => {
  // Generate mock user profile based on tier
  const mockUserProfile = useMemo(() => ({
    id: 'preview-user-id',
    email: 'demo@greenofig.com',
    full_name: 'Demo User',
    subscription_tier: tier,
    gender: 'male',
    age: 30,
    weight_kg: 75,
    height_cm: 175,
    goal_id: 'lose_weight',
    activity_level: 'moderate',
    dietary_preferences: ['vegetarian'],
    created_at: new Date().toISOString(),
  }), [tier]);

  // Mock auth context value
  const mockAuthValue = useMemo(() => ({
    user: {
      id: 'preview-user-id',
      email: 'demo@greenofig.com',
    },
    userProfile: mockUserProfile,
    signOut: () => {
      console.log('Preview mode: signOut disabled');
    },
  }), [mockUserProfile]);

  // Mock feature access based on tier
  const mockFeatureAccess = useMemo(() => {
    const tierConfig = {
      free: {
        hasAds: true,
        planName: 'Free',
        planKey: 'free',
        features: {
          unlimited_meals: false,
          unlimited_workouts: false,
          advanced_analytics: false,
          barcode_scanner: false,
          food_database: false,
          wearable_sync: false,
          messaging: false,
          video_consultations: false,
          photo_recognition: false,
          doctor_consultations: false,
        }
      },
      premium: {
        hasAds: false,
        planName: 'Premium',
        planKey: 'premium',
        features: {
          unlimited_meals: true,
          unlimited_workouts: true,
          advanced_analytics: true,
          barcode_scanner: true,
          food_database: true,
          wearable_sync: false,
          messaging: false,
          video_consultations: false,
          photo_recognition: false,
          doctor_consultations: false,
        }
      },
      ultimate: {
        hasAds: false,
        planName: 'Ultimate',
        planKey: 'ultimate',
        features: {
          unlimited_meals: true,
          unlimited_workouts: true,
          advanced_analytics: true,
          barcode_scanner: true,
          food_database: true,
          wearable_sync: true,
          messaging: true,
          video_consultations: true,
          photo_recognition: false,
          doctor_consultations: false,
        }
      },
      elite: {
        hasAds: false,
        planName: 'Elite',
        planKey: 'elite',
        features: {
          unlimited_meals: true,
          unlimited_workouts: true,
          advanced_analytics: true,
          barcode_scanner: true,
          food_database: true,
          wearable_sync: true,
          messaging: true,
          video_consultations: true,
          photo_recognition: true,
          doctor_consultations: true,
        }
      }
    };

    const config = tierConfig[tier] || tierConfig.free;

    return {
      hasAds: config.hasAds,
      planName: config.planName,
      planKey: config.planKey,
      hasAccess: (feature) => {
        return config.features[feature] === true;
      },
      // Check feature by tier name
      canAccessFeature: (requiredTier) => {
        const tierHierarchy = ['free', 'premium', 'ultimate', 'elite'];
        const currentTierIndex = tierHierarchy.indexOf(tier);
        const requiredTierIndex = tierHierarchy.indexOf(requiredTier);
        return currentTierIndex >= requiredTierIndex;
      }
    };
  }, [tier]);

  // Override the useAuth and useFeatureAccess hooks via context
  return (
    <MockAuthContext.Provider value={mockAuthValue}>
      <MockFeatureAccessContext.Provider value={mockFeatureAccess}>
        <PreviewUserDashboardWrapper />
      </MockFeatureAccessContext.Provider>
    </MockAuthContext.Provider>
  );
};

// Wrapper component that injects the mocked hooks
const PreviewUserDashboardWrapper = () => {
  // This component will be rendered with the real UserDashboard
  // but with preview mode enabled and mock data
  return (
    <div className="preview-dashboard-container">
      <UserDashboard
        logoUrl="/logo.png"
        previewMode={true}
      />
    </div>
  );
};

// Export the mock contexts so they can be used in UserDashboard
export { MockAuthContext, MockFeatureAccessContext };
export default UserDashboardPreview;
