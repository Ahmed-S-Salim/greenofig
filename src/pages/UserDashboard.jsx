import React, { memo, useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Scale, HeartPulse, Dumbbell, Edit, Target, Flame, Droplets, Moon, Utensils, Activity, TrendingUp, Trophy, Calendar } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import QuickLogWeight from '@/components/user/QuickLogWeight';
import QuickLogMeal from '@/components/user/QuickLogMeal';
import QuickLogWorkout from '@/components/user/QuickLogWorkout';
import QuickLogWater from '@/components/user/QuickLogWater';
import QuickLogSleep from '@/components/user/QuickLogSleep';
import ProgressCharts from '@/components/user/ProgressCharts';
import AiMealPlanGenerator from '@/components/user/AiMealPlanGenerator';
import AiWorkoutPlanner from '@/components/user/AiWorkoutPlanner';
import PersonalizedInsights from '@/components/user/PersonalizedInsights';
import SubscriptionManager from '@/components/user/SubscriptionManager';
import AdBanner from '@/components/AdBanner';
import AdContainer from '@/components/ads/AdContainer';
import VideoAd from '@/components/ads/VideoAd';
import InterstitialAd from '@/components/ads/InterstitialAd';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Gift, Camera, Scan, Watch, Search, MessageSquare } from 'lucide-react';

// Phase 1: Premium Feature Components
import PhotoFoodRecognition from '@/components/user/PhotoFoodRecognition';
import BarcodeScanner from '@/components/user/BarcodeScanner';
import WearableDeviceSync from '@/components/user/WearableDeviceSync';
import FoodDatabaseSearch from '@/components/user/FoodDatabaseSearch';
import MessagingCenter from '@/components/user/MessagingCenter';
import { MockAuthContext, MockFeatureAccessContext } from '@/components/admin/UserDashboardPreview';
import { generateMockDashboardData } from '@/utils/mockDataGenerator';

// All New Premium Features
import RecipeDatabase from '@/components/user/RecipeDatabase';
import MacroTracking from '@/components/user/MacroTracking';
import ExerciseLibrary from '@/components/user/ExerciseLibrary';
import GoalTracking from '@/components/user/GoalTracking';
import HealthStreaks from '@/components/user/HealthStreaks';
import CustomNotifications from '@/components/user/CustomNotifications';
import MotivationalSupport from '@/components/user/MotivationalSupport';

// Ultimate Features
import AdvancedAnalytics from '@/components/user/AdvancedAnalytics';
import ProgressReports from '@/components/user/ProgressReports';
import WorkoutAnalytics from '@/components/user/WorkoutAnalytics';
import DataExport from '@/components/user/DataExport';

// Elite Features
import DoctorConsultations from '@/components/user/DoctorConsultations';
import AppointmentScheduling from '@/components/user/AppointmentScheduling';

const UserDashboard = memo(({ logoUrl, previewMode = false }) => {
  // Use mock context in preview mode, otherwise use real hooks
  const realAuth = useAuth();
  const mockAuth = React.useContext(MockAuthContext);
  const auth = previewMode && mockAuth ? mockAuth : realAuth;

  const { userProfile } = auth;
  const { t } = useTranslation();

  const realFeatureAccess = useFeatureAccess();
  const mockFeatureAccess = React.useContext(MockFeatureAccessContext);
  const featureAccess = previewMode && mockFeatureAccess ? mockFeatureAccess : realFeatureAccess;

  const { hasAds, planName, hasAccess, planKey } = featureAccess;

  const [todayMetrics, setTodayMetrics] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [streaks, setStreaks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAd, setShowAd] = useState(true);
  const [showVideoAd, setShowVideoAd] = useState(false);
  const [showInterstitialAd, setShowInterstitialAd] = useState(false);
  const [bonusMessages, setBonusMessages] = useState(0);

  const handleRewardEarned = () => {
    if (previewMode) {
      // In preview mode, just show a toast without actually updating anything
      toast({
        title: "Preview Mode",
        description: "This is a demo - no actual changes are made",
      });
      return;
    }

    setBonusMessages(prev => prev + 1);
    toast({
      title: "🎁 Reward Earned!",
      description: "You've earned +1 bonus AI message!",
    });
  };

  useEffect(() => {
    if (previewMode) {
      // In preview mode, load mock data immediately
      const tier = userProfile?.subscription_tier || 'free';
      const mockData = generateMockDashboardData(tier);
      setTodayMetrics(mockData.todayMetrics);
      setRecentActivity(mockData.recentActivity);
      setStreaks(mockData.streaks);
      setLoading(false);
    } else if (userProfile?.id) {
      fetchDashboardData();
    }
  }, [userProfile?.id, refreshKey, previewMode]);

  const fetchDashboardData = async () => {
    if (previewMode) return; // Don't fetch real data in preview mode

    try {
      const today = new Date().toISOString().split('T')[0];

      // Fetch today's metrics
      const { data: metrics, error: metricsError } = await supabase
        .from('daily_metrics')
        .select('*')
        .eq('user_id', userProfile.id)
        .eq('date', today)
        .maybeSingle();

      if (metricsError && metricsError.code !== 'PGRST116') {
        console.error('Error fetching metrics:', metricsError);
      }

      setTodayMetrics(metrics);

      // Fetch recent activity (last 5)
      const { data: activity } = await supabase
        .from('activity_feed')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentActivity(activity || []);

      // Fetch streaks
      const { data: streaksData } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userProfile.id);

      setStreaks(streaksData || []);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (previewMode) {
      toast({
        title: "Preview Mode",
        description: "Data refresh is disabled in preview mode",
      });
      return;
    }
    setRefreshKey(prev => prev + 1);
  };

  const getGoalIcon = (goalId) => {
    switch (goalId) {
      case 'lose_weight': return <Scale className="w-6 h-6 text-primary" />;
      case 'build_muscle': return <Dumbbell className="w-6 h-6 text-primary" />;
      case 'improve_endurance': return <HeartPulse className="w-6 h-6 text-primary" />;
      case 'eat_healthier': return <Edit className="w-6 h-6 text-primary" />;
      case 'increase_energy': return <Zap className="w-6 h-6 text-primary" />;
      default: return <Target className="w-6 h-6 text-primary" />;
    }
  };

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return { bmi: 'N/A', category: 'N/A' };
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    let category = '';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi >= 18.5 && bmi <= 24.9) category = 'Normal';
    else if (bmi >= 25 && bmi <= 29.9) category = 'Overweight';
    else category = 'Obese';
    return { bmi, category };
  };

  const { bmi, category } = useMemo(
    () => calculateBMI(userProfile?.weight_kg, userProfile?.height_cm),
    [userProfile?.weight_kg, userProfile?.height_cm]
  );

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  }), []);

  return (
    <>
      <Helmet>
        <title>Dashboard - GreenoFig</title>
        <meta name="description" content="Your personal health and wellness dashboard." />
      </Helmet>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full space-y-6 sm:space-y-8 lg:space-y-10 xl:space-y-12 px-4 sm:px-0"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
            Welcome back, <span className="gradient-text">{(userProfile?.full_name || 'User').split(' ')[0]}!</span>
          </h1>
          <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-text-secondary mt-2">
            Here's your wellness snapshot for today. Let's make it a great one!
            {planName && <span className="ml-2 text-xs font-semibold text-primary">({planName} Plan)</span>}
            {bonusMessages > 0 && (
              <span className="ml-2 text-xs font-semibold text-green-500">
                🎁 +{bonusMessages} bonus AI message{bonusMessages > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </motion.div>

        {/* Ad Banner for Free Users */}
        {hasAds && showAd && (
          <motion.div variants={itemVariants}>
            <AdBanner onDismiss={() => setShowAd(false)} />
          </motion.div>
        )}

        {/* Rewarded Video Ad Button - Only for Basic users */}
        {hasAds && (
          <motion.div variants={itemVariants}>
            <Card className="glass-effect border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <Gift className="w-8 h-8 text-yellow-400 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-white text-sm sm:text-base">Earn Bonus Features!</h3>
                      <p className="text-xs sm:text-sm text-yellow-200/80">Watch a short video to get +1 extra AI message</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowVideoAd(true)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                  >
                    Watch Ad
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="glass-effect">
              <CardHeader className="p-4 sm:p-6 lg:p-8">
                <CardTitle className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 p-4 sm:p-6 lg:p-8 pt-0">
                <QuickLogWeight onSuccess={handleRefresh} />
                <QuickLogMeal onSuccess={handleRefresh} />
                <QuickLogWorkout onSuccess={handleRefresh} />
                <QuickLogSleep onSuccess={handleRefresh} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Water Intake - Separate Section */}
          <motion.div variants={itemVariants}>
            <QuickLogWater onSuccess={handleRefresh} />
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          <motion.div variants={itemVariants}>
            <Card className="glass-effect h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6 lg:p-8 lg:pb-4">
                <CardTitle className="text-xs sm:text-sm lg:text-base xl:text-lg font-medium">Weight</CardTitle>
                <Scale className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-4 sm:p-6 lg:p-8 pt-0 lg:pt-0">
                <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold">
                  {todayMetrics?.weight_kg || userProfile?.weight_kg || 'N/A'}
                  {(todayMetrics?.weight_kg || userProfile?.weight_kg) && ' kg'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {todayMetrics?.weight_kg ? 'Today\'s weight' : 'Last logged weight'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="glass-effect h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium">BMI</CardTitle>
                <HeartPulse className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="text-xl sm:text-2xl font-bold">{bmi}</div>
                <p className="text-xs text-muted-foreground">{category}</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="glass-effect h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium">Calories Today</CardTitle>
                <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="text-xl sm:text-2xl font-bold">
                  {todayMetrics?.calories_burned || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Burned • {todayMetrics?.calories_consumed || 0} consumed
                </p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="glass-effect h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium">Sleep</CardTitle>
                <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="text-xl sm:text-2xl font-bold">
                  {todayMetrics?.sleep_hours ? `${todayMetrics.sleep_hours}h` : 'Not logged'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {todayMetrics?.sleep_quality || 'Log your sleep'}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Premium Features Section */}
        {(hasAccess('photoRecognition') || hasAccess('wearableIntegration') || planKey !== 'free') && (
          <motion.div variants={itemVariants}>
            <Card className="glass-effect border-primary/30">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    {t('userDashboard.premiumFeatures')}
                  </CardTitle>
                  {planKey === 'free' && (
                    <Button size="sm" onClick={() => window.location.href = '/pricing'}>
                      {t('userDashboard.upgradeButton')}
                    </Button>
                  )}
                </div>
                <p className="text-sm text-text-secondary mt-1">
                  {planKey === 'free'
                    ? t('userDashboard.unlockPowerfulTools')
                    : t('userDashboard.advancedToolsAvailable')}
                </p>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-6 pt-0">
                {/* Photo Food Recognition - Elite Only */}
                {hasAccess('photoRecognition') && (
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-2 relative overflow-hidden group"
                    onClick={() => document.getElementById('photo-food-recognition')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Camera className="h-6 w-6 text-purple-500" />
                    <span className="text-sm font-medium">{t('userDashboard.photoFoodRecognition')}</span>
                    <span className="text-xs text-text-secondary">{t('userDashboard.photoFoodRecognitionTier')}</span>
                  </Button>
                )}

                {/* Barcode Scanner - Premium+ */}
                {(hasAccess('photoRecognition') || planKey !== 'free') && (
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-2 relative overflow-hidden group"
                    onClick={() => document.getElementById('barcode-scanner')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Scan className="h-6 w-6 text-blue-500" />
                    <span className="text-sm font-medium">{t('userDashboard.barcodeScanner')}</span>
                    <span className="text-xs text-text-secondary">{t('userDashboard.barcodeScannerTier')}</span>
                  </Button>
                )}

                {/* Wearable Sync - Premium+ */}
                {hasAccess('wearableIntegration') && (
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-2 relative overflow-hidden group"
                    onClick={() => document.getElementById('wearable-sync')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Watch className="h-6 w-6 text-green-500" />
                    <span className="text-sm font-medium">{t('userDashboard.wearableDevices')}</span>
                    <span className="text-xs text-text-secondary">{t('userDashboard.wearableDevicesTier')}</span>
                  </Button>
                )}

                {/* Food Database - Premium+ */}
                {planKey !== 'free' && (
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-2 relative overflow-hidden group"
                    onClick={() => document.getElementById('food-database')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Search className="h-6 w-6 text-orange-500" />
                    <span className="text-sm font-medium">{t('userDashboard.foodDatabase')}</span>
                    <span className="text-xs text-text-secondary">{t('userDashboard.foodDatabaseTier')}</span>
                  </Button>
                )}

                {/* Messaging Center - Ultimate+ */}
                {hasAccess('nutritionistAccess') && (
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-2 relative overflow-hidden group"
                    onClick={() => document.getElementById('messaging-center')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <MessageSquare className="h-6 w-6 text-indigo-500" />
                    <span className="text-sm font-medium">{t('userDashboard.messageNutritionist')}</span>
                    <span className="text-xs text-text-secondary">{t('userDashboard.messageNutritionistTier')}</span>
                  </Button>
                )}

                {/* Locked features for free users */}
                {planKey === 'free' && (
                  <>
                    <div className="h-24 flex flex-col gap-2 items-center justify-center border-2 border-dashed border-border rounded-lg opacity-50">
                      <Camera className="h-6 w-6" />
                      <span className="text-xs">{t('userDashboard.photoFoodRecognition')}</span>
                      <span className="text-xs text-text-secondary">{t('userDashboard.photoFoodRecognitionTier')}</span>
                    </div>
                    <div className="h-24 flex flex-col gap-2 items-center justify-center border-2 border-dashed border-border rounded-lg opacity-50">
                      <Watch className="h-6 w-6" />
                      <span className="text-xs">{t('userDashboard.wearableDevices')}</span>
                      <span className="text-xs text-text-secondary">{t('userDashboard.wearableDevicesTier')}</span>
                    </div>
                    <div className="h-24 flex flex-col gap-2 items-center justify-center border-2 border-dashed border-border rounded-lg opacity-50">
                      <MessageSquare className="h-6 w-6" />
                      <span className="text-xs">{t('userDashboard.messageNutritionist')}</span>
                      <span className="text-xs text-text-secondary">{t('userDashboard.messageNutritionistTier')}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Single Streak Badge - Show inline if only 1 streak */}
        {streaks.length === 1 && (
          <motion.div variants={itemVariants}>
            <Card className="glass-effect">
              <CardContent className="py-4">
                <div className="flex items-center justify-center gap-4">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-primary">{streaks[0].current_streak}</span>
                    <span className="text-sm text-muted-foreground">day</span>
                    <span className="text-sm font-medium capitalize">{streaks[0].streak_type.replace(/_/g, ' ')} streak</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Best: {streaks[0].longest_streak} days
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Streaks Section - Only show as full section if 2+ streaks */}
        {streaks.length >= 2 && (
          <motion.div variants={itemVariants}>
            <Card className="glass-effect">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                  Your Streaks
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 pt-0">
                {streaks.map(streak => (
                  <div key={streak.id} className="text-center p-3 sm:p-4 bg-muted rounded-lg">
                    <div className="text-2xl sm:text-3xl font-bold text-primary">
                      {streak.current_streak}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground capitalize">
                      {streak.streak_type.replace(/_/g, ' ')}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Best: {streak.longest_streak}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Activity Feed */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="glass-effect h-full">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4 sm:p-6 pt-0">
                {recentActivity.length > 0 ? (
                  recentActivity.map(activity => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-3 p-3 bg-muted rounded-lg"
                    >
                      <div className="flex-shrink-0 p-2 rounded-full bg-primary/20">
                        {activity.activity_type === 'logged_meal' && <Utensils className="w-4 h-4 text-primary" />}
                        {activity.activity_type === 'completed_workout' && <Dumbbell className="w-4 h-4 text-primary" />}
                        {activity.activity_type === 'weight_update' && <Scale className="w-4 h-4 text-primary" />}
                        {activity.activity_type === 'sleep_log' && <Moon className="w-4 h-4 text-primary" />}
                        {activity.activity_type === 'water_intake' && <Droplets className="w-4 h-4 text-primary" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{activity.activity_title}</div>
                        <div className="text-sm text-muted-foreground">{activity.activity_description}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(activity.created_at).toLocaleString()}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No activity yet. Start logging your health data!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Goals */}
          <motion.div variants={itemVariants}>
             <Card className="glass-effect h-full">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl font-bold">Your Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                {userProfile?.health_goals && userProfile.health_goals.length > 0 ? (
                  userProfile.health_goals.map(goal => (
                    <motion.div
                      key={goal}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center gap-3 sm:gap-4 bg-muted p-3 rounded-lg"
                    >
                      {getGoalIcon(goal)}
                      <span className="text-sm sm:text-base font-medium text-text-primary capitalize">{goal.replace(/_/g, ' ')}</span>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-sm sm:text-base text-text-secondary">No goals set yet. Update your profile to add goals!</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Progress Charts */}
        <motion.div variants={itemVariants}>
          <ProgressCharts />
        </motion.div>

        {/* AI Tools & Insights */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <motion.div variants={itemVariants}>
            <PersonalizedInsights />
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="glass-effect h-full">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl font-bold">AI-Powered Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4 sm:p-6 pt-0">
                <AiMealPlanGenerator onSuccess={handleRefresh} />
                <AiWorkoutPlanner onSuccess={handleRefresh} />
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Phase 1: Premium Feature Components */}

        {/* Photo Food Recognition - Elite Only */}
        {hasAccess('photoRecognition') && (
          <motion.div variants={itemVariants} id="photo-food-recognition">
            <PhotoFoodRecognition />
          </motion.div>
        )}

        {/* Barcode Scanner - Premium+ (shown to all premium tiers) */}
        {planKey !== 'free' && (
          <motion.div variants={itemVariants} id="barcode-scanner">
            <BarcodeScanner onFoodAdded={handleRefresh} />
          </motion.div>
        )}

        {/* Wearable Device Sync - Premium+ */}
        {hasAccess('wearableIntegration') && (
          <motion.div variants={itemVariants} id="wearable-sync">
            <WearableDeviceSync />
          </motion.div>
        )}

        {/* Food Database Search - Premium+ */}
        {planKey !== 'free' && (
          <motion.div variants={itemVariants} id="food-database">
            <FoodDatabaseSearch onFoodAdded={handleRefresh} />
          </motion.div>
        )}

        {/* Messaging Center - Ultimate+ (nutritionist access) */}
        {hasAccess('nutritionistAccess') && (
          <motion.div variants={itemVariants} id="messaging-center">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {t('userDashboard.nutritionistMessaging')}
                </CardTitle>
                <p className="text-sm text-text-secondary">
                  {t('userDashboard.connectWithNutritionist')}
                </p>
              </CardHeader>
              <CardContent>
                <MessagingCenter />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* NEW PREMIUM FEATURES */}

        {/* Recipe Database - Premium+ */}
        {planKey !== 'free' && (
          <motion.div variants={itemVariants}>
            <RecipeDatabase previewMode={previewMode} />
          </motion.div>
        )}

        {/* Macro Tracking - Premium+ */}
        {planKey !== 'free' && (
          <motion.div variants={itemVariants}>
            <MacroTracking />
          </motion.div>
        )}

        {/* Exercise Library - Premium+ */}
        {planKey !== 'free' && (
          <motion.div variants={itemVariants}>
            <ExerciseLibrary />
          </motion.div>
        )}

        {/* Goal Tracking - Premium+ */}
        {planKey !== 'free' && (
          <motion.div variants={itemVariants}>
            <GoalTracking />
          </motion.div>
        )}

        {/* Health Streaks - Premium+ (Enhanced Version) */}
        {planKey !== 'free' && (
          <motion.div variants={itemVariants}>
            <HealthStreaks />
          </motion.div>
        )}

        {/* Custom Notifications - Premium+ */}
        {planKey !== 'free' && (
          <motion.div variants={itemVariants}>
            <CustomNotifications />
          </motion.div>
        )}

        {/* Motivational Support - Premium+ */}
        {planKey !== 'free' && (
          <motion.div variants={itemVariants}>
            <MotivationalSupport />
          </motion.div>
        )}

        {/* ULTIMATE FEATURES */}

        {/* Advanced Analytics - Ultimate+ */}
        {(planKey === 'ultimate' || planKey === 'elite') && (
          <motion.div variants={itemVariants}>
            <AdvancedAnalytics />
          </motion.div>
        )}

        {/* Progress Reports - Ultimate+ */}
        {(planKey === 'ultimate' || planKey === 'elite') && (
          <motion.div variants={itemVariants}>
            <ProgressReports previewMode={previewMode} />
          </motion.div>
        )}

        {/* Workout Analytics - Ultimate+ */}
        {(planKey === 'ultimate' || planKey === 'elite') && (
          <motion.div variants={itemVariants}>
            <WorkoutAnalytics />
          </motion.div>
        )}

        {/* Data Export - Ultimate+ */}
        {(planKey === 'ultimate' || planKey === 'elite') && (
          <motion.div variants={itemVariants}>
            <DataExport />
          </motion.div>
        )}

        {/* ELITE FEATURES */}

        {/* Doctor Consultations - Elite Only */}
        {planKey === 'elite' && (
          <motion.div variants={itemVariants}>
            <DoctorConsultations />
          </motion.div>
        )}

        {/* Appointment Scheduling - Elite Only */}
        {planKey === 'elite' && (
          <motion.div variants={itemVariants}>
            <AppointmentScheduling />
          </motion.div>
        )}

        {/* Subscription Management */}
        <motion.div variants={itemVariants}>
          <SubscriptionManager />
        </motion.div>

        {/* Sidebar Ad - Only for Basic users */}
        {hasAds && (
          <motion.div variants={itemVariants}>
            <AdContainer placementName="dashboard_sidebar" />
          </motion.div>
        )}
      </motion.div>

      {/* Video Ad Modal */}
      {showVideoAd && (
        <VideoAd
          placementName="rewarded_video"
          onClose={() => setShowVideoAd(false)}
          onRewardEarned={handleRewardEarned}
          rewardDescription="Get +1 bonus AI message"
        />
      )}

      {/* Interstitial Ad Modal - Can be triggered after AI generation */}
      {showInterstitialAd && (
        <InterstitialAd
          placementName="after_ai_generation"
          onClose={() => setShowInterstitialAd(false)}
          forceCountdown={3}
        />
      )}
    </>
  );
});

UserDashboard.displayName = 'UserDashboard';

export default UserDashboard;