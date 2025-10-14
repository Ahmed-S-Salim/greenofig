import 'package:flutter/foundation.dart';
import '../models/user_model.dart';
import './auth_service.dart';

/// Service for managing role-based access control (RBAC)
class RoleService {
  static RoleService? _instance;
  UserModel? _currentUser;

  static RoleService get instance {
    _instance ??= RoleService._internal();
    return _instance!;
  }

  RoleService._internal();

  /// Get current user with role information
  Future<UserModel?> getCurrentUser() async {
    try {
      if (_currentUser != null) return _currentUser;

      final authUser = AuthService.getCurrentUser();
      if (authUser == null) {
        debugPrint('❌ No authenticated user found');
        return null;
      }

      final profile = await AuthService.getUserProfile();
      if (profile == null) {
        debugPrint('⚠️ No user profile found, creating basic user');
        _currentUser = UserModel(
          id: authUser.id,
          email: authUser.email ?? '',
          fullName: authUser.email?.split('@')[0],
          role: UserRole.basicUser,
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );
        return _currentUser;
      }

      _currentUser = UserModel.fromJson({
        'id': authUser.id,
        'email': authUser.email,
        'full_name': profile['full_name'],
        'role': profile['role'] ?? 'basic_user',
        'avatar_url': profile['avatar_url'],
        'created_at': profile['created_at'],
        'updated_at': profile['updated_at'],
        'subscription_plan_id': profile['subscription_plan_id'],
        'subscription_status': profile['subscription_status'],
      });

      debugPrint('✅ Current user loaded: ${_currentUser!.email} (${_currentUser!.role.displayName})');
      return _currentUser;
    } catch (e) {
      debugPrint('❌ Error getting current user: $e');
      return null;
    }
  }

  /// Refresh current user data
  Future<void> refreshUser() async {
    _currentUser = null;
    await getCurrentUser();
  }

  /// Clear cached user data (call on logout)
  void clearUser() {
    _currentUser = null;
    debugPrint('🧹 User data cleared');
  }

  /// Check if user has access to a specific feature
  Future<bool> hasAccessTo(String feature) async {
    final user = await getCurrentUser();
    if (user == null) return false;
    return user.hasAccessTo(feature);
  }

  /// Check if user is admin
  Future<bool> isAdmin() async {
    final user = await getCurrentUser();
    return user?.isAdmin ?? false;
  }

  /// Check if user is nutritionist
  Future<bool> isNutritionist() async {
    final user = await getCurrentUser();
    return user?.isNutritionist ?? false;
  }

  /// Check if user is premium user
  Future<bool> isPremiumUser() async {
    final user = await getCurrentUser();
    return user?.isPremiumUser ?? false;
  }

  /// Check if user can access AI features
  Future<bool> canAccessAIFeatures() async {
    final user = await getCurrentUser();
    return user?.canAccessAIFeatures ?? false;
  }

  /// Check if user can access premium features
  Future<bool> canAccessPremiumFeatures() async {
    final user = await getCurrentUser();
    return user?.canAccessPremiumFeatures ?? false;
  }

  /// Check if user can manage clients (admin or nutritionist)
  Future<bool> canManageClients() async {
    final user = await getCurrentUser();
    return user?.canManageClients ?? false;
  }

  /// Check if user can access advanced analytics
  Future<bool> canAccessAdvancedAnalytics() async {
    final user = await getCurrentUser();
    return user?.canAccessAdvancedAnalytics ?? false;
  }

  /// Get features available to current user
  Future<List<String>> getAvailableFeatures() async {
    final user = await getCurrentUser();
    if (user == null) return [];

    if (user.isAdmin) {
      return [
        'all_features',
        'admin_panel',
        'user_management',
        'system_settings',
        'analytics_dashboard',
        'ai_meal_planning',
        'ai_food_scanner',
        'custom_workout_programs',
        'advanced_analytics',
        'wearable_integration',
        'export_reports',
        'ai_health_coach',
        'client_management',
        'meal_plan_creation',
        'professional_reports',
        'consultation_scheduling',
      ];
    }

    if (user.isNutritionist) {
      return const [
        'basic_meal_logging',
        'basic_workout_tracking',
        'progress_viewing',
        'community_access',
        'ai_meal_planning',
        'ai_food_scanner',
        'advanced_analytics',
        'client_management',
        'meal_plan_creation',
        'professional_reports',
        'consultation_scheduling',
      ];
    }

    if (user.isPremiumUser && user.hasActiveSubscription) {
      return const [
        'basic_meal_logging',
        'basic_workout_tracking',
        'progress_viewing',
        'community_access',
        'ai_meal_planning',
        'ai_food_scanner',
        'custom_workout_programs',
        'advanced_analytics',
        'wearable_integration',
        'export_reports',
        'ai_health_coach',
      ];
    }

    return const [
      'basic_meal_logging',
      'basic_workout_tracking',
      'progress_viewing',
      'community_access',
    ];
  }

  /// Get restricted features for current user
  Future<List<String>> getRestrictedFeatures() async {
    final user = await getCurrentUser();
    if (user == null) return const [];

    if (user.isAdmin) return const [];

    const allFeatures = [
      'ai_meal_planning',
      'ai_food_scanner',
      'custom_workout_programs',
      'advanced_analytics',
      'wearable_integration',
      'export_reports',
      'ai_health_coach',
      'client_management',
      'meal_plan_creation',
      'professional_reports',
      'consultation_scheduling',
    ];

    final availableFeatures = await getAvailableFeatures();

    return allFeatures
        .where((feature) => !availableFeatures.contains(feature))
        .toList();
  }

  /// Show upgrade prompt if feature is restricted
  Future<bool> checkFeatureAccessWithPrompt(
    String feature,
    Function() showUpgradePrompt,
  ) async {
    final hasAccess = await hasAccessTo(feature);

    if (!hasAccess) {
      showUpgradePrompt();
      return false;
    }

    return true;
  }

  /// Update user role (admin only)
  Future<bool> updateUserRole(String userId, UserRole newRole) async {
    try {
      final currentUser = await getCurrentUser();
      if (currentUser == null || !currentUser.isAdmin) {
        debugPrint('❌ Unauthorized: Only admins can update user roles');
        return false;
      }

      await AuthService.updateProfile(data: {
        'role': newRole.toJson(),
        'updated_at': DateTime.now().toIso8601String(),
      });

      debugPrint('✅ User role updated to: ${newRole.displayName}');
      return true;
    } catch (e) {
      debugPrint('❌ Error updating user role: $e');
      return false;
    }
  }

  /// Get role display name
  Future<String> getRoleDisplayName() async {
    final user = await getCurrentUser();
    return user?.role.displayName ?? 'Unknown';
  }

  /// Check if user needs to upgrade for a feature
  Future<bool> needsUpgradeFor(String feature) async {
    final user = await getCurrentUser();
    if (user == null) return true;

    if (user.isAdmin) return false;

    return !user.hasAccessTo(feature);
  }

  /// Get recommended plan for user
  Future<String> getRecommendedPlan() async {
    final user = await getCurrentUser();
    if (user == null) return 'premium';

    if (user.isBasicUser) {
      return 'premium'; // Recommend premium for basic users
    }

    if (user.isPremiumUser && !user.hasActiveSubscription) {
      return 'premium'; // Renew premium
    }

    return 'pro'; // Recommend upgrade to pro
  }

  /// Log access attempt for analytics
  void logAccessAttempt(String feature, bool granted) {
    debugPrint(
        '🔐 Access ${granted ? 'GRANTED' : 'DENIED'} to feature: $feature');
  }
}
