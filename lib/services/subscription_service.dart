import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/subscription_plan.dart';
import '../models/user_subscription.dart';
import './supabase_service.dart';

class SubscriptionService {
  static SubscriptionService? _instance;
  static SubscriptionService get instance =>
      _instance ??= SubscriptionService._();
  SubscriptionService._();

  SupabaseClient get _client => SupabaseService.instance;

  /// Get all available subscription plans
  Future<List<SubscriptionPlan>> getSubscriptionPlans() async {
    try {
      final response = await _client
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .order('display_order', ascending: true);

      return response
          .map<SubscriptionPlan>((data) => SubscriptionPlan.fromJson(data))
          .toList();
    } catch (error) {
      throw Exception('Failed to fetch subscription plans: $error');
    }
  }

  /// Get user's current active subscription
  Future<UserSubscription?> getCurrentUserSubscription() async {
    try {
      final user = _client.auth.currentUser;
      if (user == null) return null;

      final response = await _client
          .from('user_subscriptions')
          .select('''
            *,
            subscription_plans (*)
          ''')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', ascending: false)
          .maybeSingle();

      if (response == null) return null;

      return UserSubscription.fromJson(response);
    } catch (error) {
      throw Exception('Failed to fetch user subscription: $error');
    }
  }

  /// Get subscription usage analytics for current user
  Future<Map<String, dynamic>> getSubscriptionUsage() async {
    try {
      final user = _client.auth.currentUser;
      if (user == null) throw Exception('User not authenticated');

      final currentSubscription = await getCurrentUserSubscription();
      if (currentSubscription == null) {
        return {
          'ai_scans_used': 0,
          'ai_scans_limit': 10,
          'meal_plans_used': 0,
          'meal_plans_limit': 5,
          'coach_chats_used': 0,
          'coach_chats_limit': 0,
          'plan_name': 'Basic'
        };
      }

      final now = DateTime.now();
      final periodStart = DateTime(now.year, now.month, 1);
      final periodEnd = DateTime(now.year, now.month + 1, 0);

      final response = await _client
          .from('subscription_usage')
          .select('*')
          .eq('user_id', user.id)
          .gte('period_start', periodStart.toIso8601String())
          .lte('period_end', periodEnd.toIso8601String());

      Map<String, int> usage = {};
      for (final item in response) {
        usage[item['feature_name']] = item['usage_count'] ?? 0;
      }

      final limits = currentSubscription.plan?.limits ?? {};

      return {
        'ai_scans_used': usage['ai_scans'] ?? 0,
        'ai_scans_limit': limits['ai_scans'] ?? 0,
        'meal_plans_used': usage['meal_plans'] ?? 0,
        'meal_plans_limit': limits['meal_plans'] ?? 0,
        'coach_chats_used': usage['coach_chats'] ?? 0,
        'coach_chats_limit': limits['coach_chats'] ?? 0,
        'plan_name': currentSubscription.plan?.name ?? 'Unknown'
      };
    } catch (error) {
      throw Exception('Failed to fetch usage analytics: $error');
    }
  }

  /// Create or update user subscription
  Future<UserSubscription> createSubscription({
    required String planId,
    required String billingInterval,
    String? stripeSubscriptionId,
    String? stripeCustomerId,
  }) async {
    try {
      final user = _client.auth.currentUser;
      if (user == null) throw Exception('User not authenticated');

      final now = DateTime.now();
      final periodEnd = billingInterval == 'yearly'
          ? now.add(const Duration(days: 365))
          : now.add(const Duration(days: 30));

      final subscriptionData = {
        'user_id': user.id,
        'plan_id': planId,
        'status': 'active',
        'billing_interval': billingInterval,
        'current_period_start': now.toIso8601String(),
        'current_period_end': periodEnd.toIso8601String(),
        'stripe_subscription_id': stripeSubscriptionId,
        'stripe_customer_id': stripeCustomerId,
      };

      final response = await _client
          .from('user_subscriptions')
          .insert(subscriptionData)
          .select('''
            *,
            subscription_plans (*)
          ''').single();

      // Update user role based on subscription
      await _updateUserRole(planId);

      return UserSubscription.fromJson(response);
    } catch (error) {
      throw Exception('Failed to create subscription: $error');
    }
  }

  /// Cancel user subscription
  Future<void> cancelSubscription(String subscriptionId) async {
    try {
      final user = _client.auth.currentUser;
      if (user == null) throw Exception('User not authenticated');

      await _client
          .from('user_subscriptions')
          .update({
            'status': 'cancelled',
            'cancelled_at': DateTime.now().toIso8601String(),
          })
          .eq('id', subscriptionId)
          .eq('user_id', user.id);

      // Revert user role to basic
      await _client
          .from('user_profiles')
          .update({'role': 'basic_user'}).eq('id', user.id);
    } catch (error) {
      throw Exception('Failed to cancel subscription: $error');
    }
  }

  /// Record payment transaction
  Future<void> recordPaymentTransaction({
    required String subscriptionId,
    required double amount,
    required String currency,
    required String status,
    String? stripePaymentIntentId,
    String? stripeInvoiceId,
    String? billingReason,
  }) async {
    try {
      final user = _client.auth.currentUser;
      if (user == null) throw Exception('User not authenticated');

      await _client.from('payment_transactions').insert({
        'user_id': user.id,
        'subscription_id': subscriptionId,
        'amount': amount,
        'currency': currency,
        'status': status,
        'stripe_payment_intent_id': stripePaymentIntentId,
        'stripe_invoice_id': stripeInvoiceId,
        'billing_reason': billingReason,
      });
    } catch (error) {
      throw Exception('Failed to record payment transaction: $error');
    }
  }

  /// Update usage for a feature
  Future<void> updateUsage(String featureName, {int increment = 1}) async {
    try {
      final user = _client.auth.currentUser;
      if (user == null) throw Exception('User not authenticated');

      final subscription = await getCurrentUserSubscription();
      if (subscription == null) return;

      final now = DateTime.now();
      final periodStart = DateTime(now.year, now.month, 1);
      final periodEnd = DateTime(now.year, now.month + 1, 0);

      // Check if usage record exists
      final existingUsage = await _client
          .from('subscription_usage')
          .select('*')
          .eq('user_id', user.id)
          .eq('plan_id', subscription.planId!)
          .eq('feature_name', featureName)
          .gte('period_start', periodStart.toIso8601String())
          .lte('period_end', periodEnd.toIso8601String())
          .maybeSingle();

      final limits = subscription.plan?.limits ?? {};
      final featureLimit = limits[featureName] as int? ?? 0;

      if (existingUsage != null) {
        // Update existing usage
        await _client.from('subscription_usage').update({
          'usage_count':
              (existingUsage['usage_count'] as int? ?? 0) + increment,
        }).eq('id', existingUsage['id']);
      } else {
        // Create new usage record
        await _client.from('subscription_usage').insert({
          'user_id': user.id,
          'plan_id': subscription.planId,
          'feature_name': featureName,
          'usage_count': increment,
          'usage_limit': featureLimit,
          'period_start': periodStart.toIso8601String(),
          'period_end': periodEnd.toIso8601String(),
        });
      }
    } catch (error) {
      throw Exception('Failed to update usage: $error');
    }
  }

  /// Check if user can use a feature
  Future<bool> canUseFeature(String featureName) async {
    try {
      final usage = await getSubscriptionUsage();
      final used = usage['${featureName}_used'] as int? ?? 0;
      final limit = usage['${featureName}_limit'] as int? ?? 0;

      // -1 means unlimited
      return limit == -1 || used < limit;
    } catch (error) {
      return false; // Default to not allowing if there's an error
    }
  }

  /// Get payment history
  Future<List<Map<String, dynamic>>> getPaymentHistory() async {
    try {
      final user = _client.auth.currentUser;
      if (user == null) throw Exception('User not authenticated');

      final response = await _client
          .from('payment_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', ascending: false);

      return response;
    } catch (error) {
      throw Exception('Failed to fetch payment history: $error');
    }
  }

  /// Private method to update user role based on subscription
  Future<void> _updateUserRole(String planId) async {
    try {
      final plan = await _client
          .from('subscription_plans')
          .select('name')
          .eq('id', planId)
          .single();

      String role = 'basic_user';
      final planName = plan['name'].toString().toLowerCase();

      if (planName.contains('premium') ||
          planName.contains('pro') ||
          planName.contains('elite')) {
        role = 'premium_user';
      }

      final user = _client.auth.currentUser;
      if (user != null) {
        await _client
            .from('user_profiles')
            .update({'role': role}).eq('id', user.id);
      }
    } catch (error) {
      // Don't throw error here as it's not critical for subscription creation
      print('Failed to update user role: $error');
    }
  }
}