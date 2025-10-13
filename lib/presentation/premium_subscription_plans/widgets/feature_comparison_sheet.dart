import 'package:flutter/material.dart';

import '../../../models/subscription_plan.dart';

class FeatureComparisonSheet extends StatefulWidget {
  final List<SubscriptionPlan> plans;
  final String billingInterval;

  const FeatureComparisonSheet({
    super.key,
    required this.plans,
    required this.billingInterval,
  });

  @override
  State<FeatureComparisonSheet> createState() => _FeatureComparisonSheetState();
}

class _FeatureComparisonSheetState extends State<FeatureComparisonSheet>
    with TickerProviderStateMixin {
  late AnimationController _slideController;
  late Animation<Offset> _slideAnimation;

  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _slideController = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 1),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _slideController,
      curve: Curves.easeOutCubic,
    ));

    _slideController.forward();
  }

  @override
  void dispose() {
    _slideController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SlideTransition(
      position: _slideAnimation,
      child: DraggableScrollableSheet(
        initialChildSize: 0.85,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        builder: (context, scrollController) {
          return Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(
                top: Radius.circular(20),
              ),
            ),
            child: Column(
              children: [
                // Handle bar
                Container(
                  margin: EdgeInsets.symmetric(vertical: 12),
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),

                // Header
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 20),
                  child: Row(
                    children: [
                      Text(
                        'Compare Plans',
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          color: Colors.grey[900],
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const Spacer(),
                      IconButton(
                        onPressed: () => Navigator.pop(context),
                        icon: Icon(
                          Icons.close_rounded,
                          color: Colors.grey[600],
                          size: 24,
                        ),
                      ),
                    ],
                  ),
                ),

                SizedBox(height: 16),

                // Comparison table
                Expanded(
                  child: SingleChildScrollView(
                    controller: scrollController,
                    padding: EdgeInsets.symmetric(horizontal: 20),
                    child: Column(
                      children: [
                        // Price comparison
                        _buildPriceComparisonSection(),

                        SizedBox(height: 24),

                        // Feature comparison
                        _buildFeatureComparisonSection(),

                        SizedBox(height: 24),

                        // Limits comparison
                        _buildLimitsComparisonSection(),

                        SizedBox(height: 100), // Bottom padding
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildPriceComparisonSection() {
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Pricing',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: Colors.grey[900],
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: 16),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: widget.plans.map((plan) {
                final price = plan.getFormattedPrice(widget.billingInterval);
                final period = plan.getBillingPeriod(widget.billingInterval);
                final monthlyEquiv =
                    plan.getMonthlyEquivalent(widget.billingInterval);

                return Container(
                  width: 100,
                  margin: EdgeInsets.only(right: 12),
                  padding: EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: plan.isPopular == true
                          ? Colors.blue
                          : Colors.grey[300]!,
                    ),
                  ),
                  child: Column(
                    children: [
                      Text(
                        plan.name ?? 'Unknown',
                        style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          color: Colors.grey[900],
                          fontWeight: FontWeight.w600,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      SizedBox(height: 8),
                      Text(
                        price,
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          color: Colors.blue,
                          fontWeight: FontWeight.w800,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      if (price != 'Free')
                        Text(
                          period,
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Colors.grey[600],
                          ),
                          textAlign: TextAlign.center,
                        ),
                      if (widget.billingInterval == 'yearly' &&
                          monthlyEquiv > 0)
                        Padding(
                          padding: EdgeInsets.only(top: 4),
                          child: Text(
                            '\$${monthlyEquiv.toStringAsFixed(2)}/mo',
                            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                              color: Colors.grey[500],
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                    ],
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureComparisonSection() {
    // Extract all unique features
    final Set<String> allFeatures = {};
    for (final plan in widget.plans) {
      if (plan.features != null) {
        allFeatures.addAll(plan.features!);
      }
    }

    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[300]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Features',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: Colors.grey[900],
              fontWeight: FontWeight.w600,
            ),
          ),
          SizedBox(height: 16),
          ...allFeatures.take(8).map((feature) => _buildFeatureRow(feature)),
        ],
      ),
    );
  }

  Widget _buildFeatureRow(String feature) {
    return Padding(
      padding: EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 2,
            child: Text(
              feature,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Colors.grey[700],
              ),
            ),
          ),
          SizedBox(width: 16),
          Expanded(
            flex: 3,
            child: Row(
              children: widget.plans.map((plan) {
                final hasFeature = plan.hasFeature(feature);
                return Expanded(
                  child: Center(
                    child: Icon(
                      hasFeature ? Icons.check_circle : Icons.cancel_outlined,
                      color: hasFeature ? Colors.green[600] : Colors.grey[400],
                      size: 20,
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLimitsComparisonSection() {
    // Extract all unique limit types
    final Set<String> allLimitTypes = {};
    for (final plan in widget.plans) {
      if (plan.limits != null) {
        allLimitTypes.addAll(plan.limits!.keys);
      }
    }

    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.blue[50],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.analytics_outlined,
                color: Colors.blue[600],
                size: 20,
              ),
              SizedBox(width: 8),
              Text(
                'Usage Limits',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: Colors.grey[900],
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          SizedBox(height: 16),
          // Plan headers
          Row(
            children: [
              const Expanded(flex: 2, child: SizedBox()),
              SizedBox(width: 16),
              Expanded(
                flex: 3,
                child: Row(
                  children: widget.plans.map((plan) {
                    return Expanded(
                      child: Text(
                        plan.name ?? '',
                        style: Theme.of(context).textTheme.labelMedium?.copyWith(
                          color: Colors.grey[800],
                          fontWeight: FontWeight.w600,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
          SizedBox(height: 12),
          ...allLimitTypes.map((limitType) => _buildLimitRow(limitType)),
        ],
      ),
    );
  }

  Widget _buildLimitRow(String limitType) {
    return Padding(
      padding: EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            flex: 2,
            child: Text(
              _formatLimitKey(limitType),
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Colors.grey[700],
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          SizedBox(width: 16),
          Expanded(
            flex: 3,
            child: Row(
              children: widget.plans.map((plan) {
                final limitValue = plan.getFeatureLimit(limitType);
                final displayValue =
                    limitValue == -1 ? '∞' : limitValue.toString();
                final isUnlimited = limitValue == -1;

                return Expanded(
                  child: Container(
                    padding:
                        EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    margin: EdgeInsets.symmetric(horizontal: 2),
                    decoration: BoxDecoration(
                      color: isUnlimited
                          ? Colors.blue.withAlpha(26)
                          : Colors.white,
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: isUnlimited
                            ? Colors.blue.withAlpha(77)
                            : Colors.grey[300]!,
                      ),
                    ),
                    child: Text(
                      displayValue,
                      style: Theme.of(context).textTheme.labelMedium?.copyWith(
                        color:
                            isUnlimited ? Colors.blue : Colors.grey[700],
                        fontWeight:
                            isUnlimited ? FontWeight.w700 : FontWeight.w500,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  String _formatLimitKey(String key) {
    switch (key) {
      case 'ai_scans':
        return 'AI Scans/month';
      case 'meal_plans':
        return 'Meal Plans/month';
      case 'coach_chats':
        return 'Coach Chats/month';
      case 'workout_videos':
        return 'Video Quality';
      default:
        return key
            .replaceAll('_', ' ')
            .split(' ')
            .map((word) =>
                word[0].toUpperCase() + word.substring(1).toLowerCase())
            .join(' ');
    }
  }
}