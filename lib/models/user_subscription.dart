import './subscription_plan.dart';

class UserSubscription {
  final String? id;
  final String? userId;
  final String? planId;
  final String? status;
  final String? billingInterval;
  final DateTime? currentPeriodStart;
  final DateTime? currentPeriodEnd;
  final DateTime? trialEnd;
  final DateTime? cancelledAt;
  final String? stripeSubscriptionId;
  final String? stripeCustomerId;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final SubscriptionPlan? plan;

  UserSubscription({
    this.id,
    this.userId,
    this.planId,
    this.status,
    this.billingInterval,
    this.currentPeriodStart,
    this.currentPeriodEnd,
    this.trialEnd,
    this.cancelledAt,
    this.stripeSubscriptionId,
    this.stripeCustomerId,
    this.createdAt,
    this.updatedAt,
    this.plan,
  });

  factory UserSubscription.fromJson(Map<String, dynamic> json) {
    return UserSubscription(
      id: json['id']?.toString(),
      userId: json['user_id']?.toString(),
      planId: json['plan_id']?.toString(),
      status: json['status']?.toString(),
      billingInterval: json['billing_interval']?.toString(),
      currentPeriodStart: json['current_period_start'] != null
          ? DateTime.parse(json['current_period_start'])
          : null,
      currentPeriodEnd: json['current_period_end'] != null
          ? DateTime.parse(json['current_period_end'])
          : null,
      trialEnd:
          json['trial_end'] != null ? DateTime.parse(json['trial_end']) : null,
      cancelledAt: json['cancelled_at'] != null
          ? DateTime.parse(json['cancelled_at'])
          : null,
      stripeSubscriptionId: json['stripe_subscription_id']?.toString(),
      stripeCustomerId: json['stripe_customer_id']?.toString(),
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : null,
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : null,
      plan: json['subscription_plans'] != null
          ? SubscriptionPlan.fromJson(json['subscription_plans'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'plan_id': planId,
      'status': status,
      'billing_interval': billingInterval,
      'current_period_start': currentPeriodStart?.toIso8601String(),
      'current_period_end': currentPeriodEnd?.toIso8601String(),
      'trial_end': trialEnd?.toIso8601String(),
      'cancelled_at': cancelledAt?.toIso8601String(),
      'stripe_subscription_id': stripeSubscriptionId,
      'stripe_customer_id': stripeCustomerId,
      'created_at': createdAt?.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }

  // Helper methods for UI
  bool get isActive => status == 'active';
  bool get isCancelled => status == 'cancelled';
  bool get isTrialing => status == 'trialing';
  bool get isPastDue => status == 'past_due';

  bool get isInTrial {
    if (trialEnd == null) return false;
    return DateTime.now().isBefore(trialEnd!);
  }

  int get daysUntilRenewal {
    if (currentPeriodEnd == null) return 0;
    final now = DateTime.now();
    if (now.isAfter(currentPeriodEnd!)) return 0;
    return currentPeriodEnd!.difference(now).inDays;
  }

  int get trialDaysRemaining {
    if (trialEnd == null) return 0;
    final now = DateTime.now();
    if (now.isAfter(trialEnd!)) return 0;
    return trialEnd!.difference(now).inDays;
  }

  String get statusDisplayText {
    switch (status) {
      case 'active':
        return isInTrial ? 'Free Trial' : 'Active';
      case 'cancelled':
        return 'Cancelled';
      case 'past_due':
        return 'Payment Failed';
      case 'trialing':
        return 'Free Trial';
      case 'expired':
        return 'Expired';
      default:
        return 'Inactive';
    }
  }

  String get nextBillingDate {
    if (currentPeriodEnd == null) return 'Unknown';
    return '${currentPeriodEnd!.day}/${currentPeriodEnd!.month}/${currentPeriodEnd!.year}';
  }

  String get subscriptionPeriod {
    if (billingInterval == 'yearly') return 'Yearly';
    return 'Monthly';
  }

  double get currentPrice {
    if (plan == null) return 0;
    return plan!.getPrice(billingInterval ?? 'monthly');
  }

  bool get willRenew {
    return isActive && cancelledAt == null;
  }

  bool get hasGracePeriod {
    if (!isCancelled || currentPeriodEnd == null) return false;
    return DateTime.now().isBefore(currentPeriodEnd!);
  }
}
