import 'package:flutter/material.dart';

import '../../../models/subscription_plan.dart';

class SubscriptionTierCard extends StatelessWidget {
  final SubscriptionPlan plan;
  final String billingInterval;
  final bool isCurrentPlan;
  final bool isProcessing;
  final VoidCallback onUpgrade;

  const SubscriptionTierCard({
    super.key,
    required this.plan,
    required this.billingInterval,
    required this.isCurrentPlan,
    required this.isProcessing,
    required this.onUpgrade,
  });

  @override
  Widget build(BuildContext context) {
    final isPopular = plan.isPopular ?? false;
    final price = plan.getFormattedPrice(billingInterval);
    final period = plan.getBillingPeriod(billingInterval);
    final savings = plan.getSavingsPercentage();

    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isPopular ? Theme.of(context).primaryColor : Colors.grey[300]!,
          width: isPopular ? 2 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color:
                (isPopular ? Theme.of(context).primaryColor : Colors.black).withAlpha(20),
            blurRadius: isPopular ? 20 : 8,
            offset: Offset(0, isPopular ? 8 : 4),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Popular badge
          if (isPopular)
            Positioned(
              top: -1,
              left: 0,
              right: 0,
              child: Container(
                padding: EdgeInsets.symmetric(vertical: 6, horizontal: 12),
                decoration: BoxDecoration(
                  color: Theme.of(context).primaryColor,
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(15),
                    topRight: Radius.circular(15),
                  ),
                ),
                child: Text(
                  'MOST POPULAR',
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.5,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ),

          // Current plan indicator
          if (isCurrentPlan)
            Positioned(
              top: 12,
              right: 12,
              child: Container(
                padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.green.withAlpha(26),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.green, width: 1),
                ),
                child: Text(
                  'ACTIVE',
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: Colors.green,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),

          // Card content
          Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top spacing for popular badge
                if (isPopular) SizedBox(height: 24),

                // Plan name
                Text(
                  plan.name ?? 'Unknown Plan',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: Colors.black87,
                    fontWeight: FontWeight.w700,
                  ),
                ),

                SizedBox(height: 8),

                // Price section
                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      price,
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        color: Theme.of(context).primaryColor,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    if (price != 'Free')
                      Text(
                        period,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.grey[600],
                        ),
                      ),
                  ],
                ),

                // Yearly savings indicator
                if (billingInterval == 'yearly' && savings > 0)
                  Container(
                    margin: EdgeInsets.only(top: 4),
                    padding:
                        EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.orange[50],
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      'Save ${savings.round()}%',
                      style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        color: Colors.orange[600],
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),

                SizedBox(height: 16),

                // Features list
                Expanded(
                  child: SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (plan.features != null && plan.features!.isNotEmpty)
                          ...plan.features!.take(4).map(
                                (feature) => Padding(
                                  padding: EdgeInsets.only(bottom: 8),
                                  child: Row(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Container(
                                        margin: EdgeInsets.only(
                                            top: 2, right: 8),
                                        child: Icon(
                                          Icons.check_circle,
                                          size: 16,
                                          color: Colors.green,
                                        ),
                                      ),
                                      Expanded(
                                        child: Text(
                                          feature,
                                          style: Theme.of(context).textTheme.bodySmall
                                              ?.copyWith(
                                            color: Colors.grey[700],
                                            height: 1.3,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),

                        // Usage limits preview
                        if (plan.limits != null && plan.limits!.isNotEmpty)
                          Padding(
                            padding: EdgeInsets.only(top: 8),
                            child: _buildLimitsPreview(context),
                          ),
                      ],
                    ),
                  ),
                ),

                SizedBox(height: 16),

                // Action button
                SizedBox(
                  width: double.infinity,
                  height: 40,
                  child: ElevatedButton(
                    onPressed: isCurrentPlan || isProcessing ? null : onUpgrade,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isCurrentPlan
                          ? Colors.grey[200]
                          : (isPopular ? Theme.of(context).primaryColor : Colors.grey[800]),
                      foregroundColor:
                          isCurrentPlan ? Colors.grey[600] : Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      elevation: 0,
                    ),
                    child: isProcessing
                        ? SizedBox(
                            height: 16,
                            width: 16,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2,
                            ),
                          )
                        : Text(
                            isCurrentPlan
                                ? 'Current Plan'
                                : (price == 'Free' ? 'Get Started' : 'Upgrade'),
                            style: Theme.of(context).textTheme.labelMedium?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLimitsPreview(BuildContext context) {
    final limits = plan.limits!;
    final limitEntries = limits.entries.take(2).toList();

    return Container(
      padding: EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(6),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Usage Limits',
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: Colors.grey[600],
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: 4),
          ...limitEntries.map(
            (entry) => Padding(
              padding: EdgeInsets.only(bottom: 2),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    _formatLimitKey(entry.key),
                    style: Theme.of(context).textTheme.labelSmall?.copyWith(
                      color: Colors.grey[700],
                    ),
                  ),
                  Text(
                    _formatLimitValue(entry.value),
                    style: Theme.of(context).textTheme.labelSmall?.copyWith(
                      color: Theme.of(context).primaryColor,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatLimitKey(String key) {
    switch (key) {
      case 'ai_scans':
        return 'AI Scans';
      case 'meal_plans':
        return 'Meal Plans';
      case 'coach_chats':
        return 'Coach Chats';
      case 'workout_videos':
        return 'Video Quality';
      default:
        return key.replaceAll('_', ' ').toUpperCase();
    }
  }

  String _formatLimitValue(dynamic value) {
    if (value == -1) return 'Unlimited';
    if (value is int) return value.toString();
    if (value is String) return value;
    return value.toString();
  }
}