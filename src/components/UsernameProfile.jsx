import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import UserDashboard from '@/pages/UserDashboard';
import NutritionistDashboardV2 from '@/pages/NutritionistDashboardV2';

const UsernameProfile = ({ logoUrl }) => {
  const { username } = useParams();
  const { user, userProfile } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileByUsername = async () => {
      try {
        setLoading(true);

        console.log('🔍 Fetching profile for username:', username);

        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('username', username)
          .single();

        if (error) {
          console.error('❌ Error fetching profile:', error);
          throw error;
        }

        console.log('✅ Profile data found:', data);
        setProfileData(data);
      } catch (err) {
        console.error('❌ Failed to fetch profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileByUsername();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <img src={logoUrl} alt="Loading..." className="w-24 h-24 animate-pulse" />
      </div>
    );
  }

  if (error || !profileData) {
    console.log('❌ Redirecting to /home - error:', error, 'profileData:', profileData);
    return <Navigate to="/home" replace />;
  }

  console.log('👤 Checking profile ownership...');
  console.log('Current user:', user?.id);
  console.log('Current userProfile:', userProfile?.id, userProfile?.username, userProfile?.role);
  console.log('Profile data:', profileData.id, profileData.username, profileData.role);

  // If viewing own profile, show appropriate dashboard based on role
  if (user && userProfile && profileData.id === userProfile.id) {
    console.log('✅ Viewing own profile - showing dashboard for role:', userProfile.role);
    if (userProfile.role === 'nutritionist') {
      return <NutritionistDashboardV2 logoUrl={logoUrl} />;
    }
    return <UserDashboard logoUrl={logoUrl} />;
  }

  // Otherwise, show public profile view (for future implementation)
  // For now, redirect non-owners to home
  console.log('⚠️ Not own profile - redirecting to /home');
  return <Navigate to="/home" replace />;
};

export default UsernameProfile;
