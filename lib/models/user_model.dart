enum UserRole {
  admin,
  user,
  nutritionist,
  basicUser;

  String get displayName {
    switch (this) {
      case UserRole.admin:
        return 'Administrator';
      case UserRole.user:
        return 'Premium User';
      case UserRole.nutritionist:
        return 'Nutritionist';
      case UserRole.basicUser:
        return 'Basic User';
    }
  }

  // Check if role has access to a specific feature
  bool hasAccessTo(String feature) {
    switch (this) {
      case UserRole.admin:
        return true; // Admin has access to everything
      case UserRole.nutritionist:
        return _nutritionistFeatures.contains(feature);
      case UserRole.user:
        return _premiumUserFeatures.contains(feature);
      case UserRole.basicUser:
        return _basicUserFeatures.contains(feature);
    }
  }

  static const List<String> _basicUserFeatures = [
    'basic_meal_logging',
    'basic_workout_tracking',
    'progress_viewing',
    'community_access',
  ];

  static const List<String> _premiumUserFeatures = [
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

  static const List<String> _nutritionistFeatures = [
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

  static UserRole fromString(String role) {
    switch (role.toLowerCase()) {
      case 'admin':
        return UserRole.admin;
      case 'nutritionist':
        return UserRole.nutritionist;
      case 'user':
      case 'premium':
      case 'premium_user':
        return UserRole.user;
      case 'basic':
      case 'basic_user':
      default:
        return UserRole.basicUser;
    }
  }

  String toJson() {
    switch (this) {
      case UserRole.admin:
        return 'admin';
      case UserRole.nutritionist:
        return 'nutritionist';
      case UserRole.user:
        return 'premium_user';
      case UserRole.basicUser:
        return 'basic_user';
    }
  }
}

class UserModel {
  final String id;
  final String email;
  final String? fullName;
  final UserRole role;
  final String? avatarUrl;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? subscriptionPlanId;
  final String? subscriptionStatus;

  UserModel({
    required this.id,
    required this.email,
    this.fullName,
    required this.role,
    this.avatarUrl,
    required this.createdAt,
    required this.updatedAt,
    this.subscriptionPlanId,
    this.subscriptionStatus,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      fullName: json['full_name']?.toString(),
      role: UserRole.fromString(json['role']?.toString() ?? 'basic_user'),
      avatarUrl: json['avatar_url']?.toString(),
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : DateTime.now(),
      subscriptionPlanId: json['subscription_plan_id']?.toString(),
      subscriptionStatus: json['subscription_status']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'full_name': fullName,
      'role': role.toJson(),
      'avatar_url': avatarUrl,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'subscription_plan_id': subscriptionPlanId,
      'subscription_status': subscriptionStatus,
    };
  }

  // Helper methods
  bool get isAdmin => role == UserRole.admin;
  bool get isNutritionist => role == UserRole.nutritionist;
  bool get isPremiumUser => role == UserRole.user;
  bool get isBasicUser => role == UserRole.basicUser;

  bool hasAccessTo(String feature) => role.hasAccessTo(feature);

  // Check subscription-based access
  bool get hasActiveSubscription =>
      subscriptionStatus == 'active' || subscriptionStatus == 'trialing';

  bool get canAccessPremiumFeatures =>
      isAdmin || (isPremiumUser && hasActiveSubscription) || isNutritionist;

  bool get canAccessAIFeatures =>
      isAdmin ||
      (isPremiumUser && hasActiveSubscription) ||
      (isNutritionist && hasAccessTo('ai_meal_planning'));

  bool get canManageClients => isAdmin || isNutritionist;

  bool get canAccessAdvancedAnalytics =>
      isAdmin || hasAccessTo('advanced_analytics');

  UserModel copyWith({
    String? id,
    String? email,
    String? fullName,
    UserRole? role,
    String? avatarUrl,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? subscriptionPlanId,
    String? subscriptionStatus,
  }) {
    return UserModel(
      id: id ?? this.id,
      email: email ?? this.email,
      fullName: fullName ?? this.fullName,
      role: role ?? this.role,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      subscriptionPlanId: subscriptionPlanId ?? this.subscriptionPlanId,
      subscriptionStatus: subscriptionStatus ?? this.subscriptionStatus,
    );
  }
}
