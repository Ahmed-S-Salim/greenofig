import 'package:flutter/material.dart';

import '../presentation/admin_settings/admin_settings_screen.dart';
import '../presentation/introduction_screen/introduction_screen.dart';
import '../presentation/splash_screen/splash_screen.dart';
import '../presentation/premium_subscription_plans/premium_subscription_plans.dart';
import '../presentation/profile/profile_screen.dart';
import '../presentation/meal_planning/meal_planning.dart';
import '../presentation/ai_food_scanner/ai_food_scanner.dart';
import '../presentation/login_screen/login_screen.dart';
import '../presentation/authentication_screen/authentication_screen.dart';
import '../presentation/subscription_management/subscription_management.dart';
import '../presentation/onboarding_flow/onboarding_flow.dart';
import '../presentation/profile_settings/profile_settings.dart';
import '../presentation/health_device_integration/health_device_integration.dart';
import '../presentation/leaderboard/leaderboard_screen.dart';
import '../presentation/ai_health_coach_chat/ai_health_coach_chat.dart';
import '../presentation/workout_programs/workout_programs.dart';
import '../presentation/device_integration/device_integration_screen.dart';
import '../presentation/welcome_screen/welcome_screen.dart';
import '../presentation/progress_tracking/progress_tracking.dart';
import '../presentation/meal_search/meal_search_screen.dart';
import '../presentation/dashboard_home/dashboard_home.dart';
import '../presentation/subscription_activation_flow/subscription_activation_flow.dart';
import '../presentation/domain_publishing_preparation/domain_publishing_preparation.dart';
import '../presentation/measurement_tracking/measurement_tracking.dart';

class AppRoutes {
  static const String adminSettingsScreen = '/admin-settings-screen';
  static const String introductionScreen = '/introduction-screen';
  static const String splashScreen = '/splash-screen';
  static const String premiumSubscriptionPlans = '/premium-subscription-plans';
  static const String profileScreen = '/profile-screen';
  static const String mealPlanning = '/meal-planning';
  static const String aiFoodScanner = '/ai-food-scanner';
  static const String loginScreen = '/login-screen';
  static const String authenticationScreen = '/authentication-screen';
  static const String subscriptionManagement = '/subscription-management';
  static const String onboardingFlow = '/onboarding-flow';
  static const String profileSettings = '/profile-settings';
  static const String healthDeviceIntegration = '/health-device-integration';
  static const String leaderboardScreen = '/leaderboard-screen';
  static const String aiHealthCoachChat = '/ai-health-coach-chat';
  static const String workoutPrograms = '/workout-programs';
  static const String deviceIntegrationScreen = '/device-integration-screen';
  static const String welcomeScreen = '/welcome-screen';
  static const String progressTracking = '/progress-tracking';
  static const String mealSearchScreen = '/meal-search-screen';
  static const String dashboardHome = '/dashboard-home';
  static const String subscriptionActivationFlow =
      '/subscription-activation-flow';
  static const String domainPublishingPreparation =
      '/domain-publishing-preparation';
  static const String measurementTracking = '/measurement-tracking';

  static Map<String, WidgetBuilder> routes = {
    adminSettingsScreen: (context) => const AdminSettingsScreen(),
    introductionScreen: (context) => const IntroductionScreen(),
    splashScreen: (context) => const SplashScreen(),
    premiumSubscriptionPlans: (context) =>
        const PremiumSubscriptionPlansScreen(),
    profileScreen: (context) => const ProfileScreen(),
    mealPlanning: (context) => const MealPlanning(),
    aiFoodScanner: (context) => const AiFoodScanner(),
    loginScreen: (context) => const LoginScreen(),
    authenticationScreen: (context) => const AuthenticationScreen(),
    subscriptionManagement: (context) => const SubscriptionManagement(),
    onboardingFlow: (context) => const OnboardingFlow(),
    profileSettings: (context) => const ProfileSettings(),
    healthDeviceIntegration: (context) => const HealthDeviceIntegration(),
    leaderboardScreen: (context) => const LeaderboardScreen(),
    aiHealthCoachChat: (context) => const AiHealthCoachChat(),
    workoutPrograms: (context) => const WorkoutPrograms(),
    deviceIntegrationScreen: (context) => const DeviceIntegrationScreen(),
    welcomeScreen: (context) => const WelcomeScreen(),
    progressTracking: (context) => const ProgressTracking(),
    mealSearchScreen: (context) => const MealSearchScreen(),
    dashboardHome: (context) => const DashboardHome(),
    subscriptionActivationFlow: (context) => const SubscriptionActivationFlow(),
    domainPublishingPreparation: (context) =>
        const DomainPublishingPreparation(),
    measurementTracking: (context) => const MeasurementTracking(),
  };
}
