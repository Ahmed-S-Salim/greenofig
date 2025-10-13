import 'dart:convert';

class SubscriptionPlan {
  final String? id;
  final String? name;
  final String? description;
  final double? priceMonthly;
  final double? priceYearly;
  final List<String>? features;
  final Map<String, dynamic>? limits;
  final bool? isPopular;
  final bool? isActive;
  final String? stripePriceIdMonthly;
  final String? stripePriceIdYearly;
  final int? displayOrder;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  SubscriptionPlan({
    this.id,
    this.name,
    this.description,
    this.priceMonthly,
    this.priceYearly,
    this.features,
    this.limits,
    this.isPopular,
    this.isActive,
    this.stripePriceIdMonthly,
    this.stripePriceIdYearly,
    this.displayOrder,
    this.createdAt,
    this.updatedAt,
  });

  factory SubscriptionPlan.fromJson(Map<String, dynamic> json) {
    List<String> parseFeatures(dynamic featuresData) {
      if (featuresData == null) return [];
      if (featuresData is String) {
        try {
          final decoded = jsonDecode(featuresData) as List;
          return decoded.map((e) => e.toString()).toList();
        } catch (e) {
          return [featuresData];
        }
      }
      if (featuresData is List) {
        return featuresData.map((e) => e.toString()).toList();
      }
      return [];
    }

    Map<String, dynamic> parseLimits(dynamic limitsData) {
      if (limitsData == null) return {};
      if (limitsData is String) {
        try {
          return jsonDecode(limitsData) as Map<String, dynamic>;
        } catch (e) {
          return {};
        }
      }
      if (limitsData is Map<String, dynamic>) {
        return limitsData;
      }
      return {};
    }

    return SubscriptionPlan(
      id: json['id']?.toString(),
      name: json['name']?.toString(),
      description: json['description']?.toString(),
      priceMonthly: (json['price_monthly'] as num?)?.toDouble(),
      priceYearly: (json['price_yearly'] as num?)?.toDouble(),
      features: parseFeatures(json['features']),
      limits: parseLimits(json['limits']),
      isPopular: json['is_popular'] as bool? ?? false,
      isActive: json['is_active'] as bool? ?? true,
      stripePriceIdMonthly: json['stripe_price_id_monthly']?.toString(),
      stripePriceIdYearly: json['stripe_price_id_yearly']?.toString(),
      displayOrder: json['display_order'] as int? ?? 0,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : null,
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'price_monthly': priceMonthly,
      'price_yearly': priceYearly,
      'features': features,
      'limits': limits,
      'is_popular': isPopular,
      'is_active': isActive,
      'stripe_price_id_monthly': stripePriceIdMonthly,
      'stripe_price_id_yearly': stripePriceIdYearly,
      'display_order': displayOrder,
      'created_at': createdAt?.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }

  // Helper methods for UI
  double getPrice(String billingInterval) {
    return billingInterval == 'yearly'
        ? (priceYearly ?? 0)
        : (priceMonthly ?? 0);
  }

  double getMonthlyEquivalent(String billingInterval) {
    if (billingInterval == 'yearly' && priceYearly != null) {
      return priceYearly! / 12;
    }
    return priceMonthly ?? 0;
  }

  double getSavingsPercentage() {
    if (priceMonthly == null || priceYearly == null || priceMonthly == 0)
      return 0;
    final yearlyEquivalent = priceMonthly! * 12;
    return ((yearlyEquivalent - priceYearly!) / yearlyEquivalent * 100);
  }

  String getFormattedPrice(String billingInterval) {
    final price = getPrice(billingInterval);
    if (price == 0) return 'Free';
    return '\$${price.toStringAsFixed(2)}';
  }

  String getBillingPeriod(String billingInterval) {
    return billingInterval == 'yearly' ? '/year' : '/month';
  }

  bool hasFeature(String feature) {
    return features?.contains(feature) ?? false;
  }

  int getFeatureLimit(String featureName) {
    return limits?[featureName] as int? ?? 0;
  }

  bool hasUnlimitedFeature(String featureName) {
    return getFeatureLimit(featureName) == -1;
  }
}