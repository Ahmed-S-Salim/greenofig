
import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';


class UsageAnalyticsCard extends StatefulWidget {
  final Map<String, dynamic> analytics;

  const UsageAnalyticsCard({
    super.key,
    required this.analytics,
  });

  @override
  State<UsageAnalyticsCard> createState() => _UsageAnalyticsCardState();
}

class _UsageAnalyticsCardState extends State<UsageAnalyticsCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _progressAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    _progressAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOutCubic,
    ));

    // Start animation after widget is built
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _animationController.forward();
    });
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final planName = widget.analytics['plan_name']?.toString() ?? 'Basic';

    return Container(
      padding: EdgeInsets.all(20.h),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16.h),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.shade900.withAlpha(20),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Container(
                padding: EdgeInsets.all(8.h),
                decoration: BoxDecoration(
                  color: Theme.of(context).primaryColor.withAlpha(26),
                  borderRadius: BorderRadius.circular(10.h),
                ),
                child: Icon(
                  Icons.analytics_outlined,
                  color: Theme.of(context).primaryColor,
                  size: 20.0,
                ),
              ),
              SizedBox(width: 12.h),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Usage This Month',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: Colors.grey.shade900,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Text(
                    '$planName Plan',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.grey.shade600,
                    ),
                  ),
                ],
              ),
              const Spacer(),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 10.h, vertical: 6.0),
                decoration: BoxDecoration(
                  color: _getPlanColor(planName).withAlpha(26),
                  borderRadius: BorderRadius.circular(12.h),
                ),
                child: Text(
                  _getPlanBadgeText(planName),
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: _getPlanColor(planName),
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),

          SizedBox(height: 20.0),

          // Usage metrics
          Column(
            children: [
              _buildUsageItem(
                'AI Food Scans',
                Icons.camera_alt_outlined,
                widget.analytics['ai_scans_used'] as int? ?? 0,
                widget.analytics['ai_scans_limit'] as int? ?? 10,
                Colors.blue.shade600,
              ),
              SizedBox(height: 16.0),
              _buildUsageItem(
                'Meal Plans',
                Icons.restaurant_menu_outlined,
                widget.analytics['meal_plans_used'] as int? ?? 0,
                widget.analytics['meal_plans_limit'] as int? ?? 5,
                Colors.green.shade600,
              ),
              SizedBox(height: 16.0),
              _buildUsageItem(
                'Coach Chats',
                Icons.chat_outlined,
                widget.analytics['coach_chats_used'] as int? ?? 0,
                widget.analytics['coach_chats_limit'] as int? ?? 0,
                Colors.purple.shade600,
              ),
            ],
          ),

          SizedBox(height: 20.0),

          // Upgrade suggestion
          if (_shouldShowUpgradeSuggestion()) _buildUpgradeSuggestion(),
        ],
      ),
    );
  }

  Widget _buildUsageItem(
    String title,
    IconData icon,
    int used,
    int limit,
    Color color,
  ) {
    final isUnlimited = limit == -1;
    final progress = isUnlimited ? 0.3 : (limit > 0 ? used / limit : 0.0);
    final isNearLimit = !isUnlimited && progress >= 0.8;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(
              icon,
              size: 18.0,
              color: color,
            ),
            SizedBox(width: 8.h),
            Text(
              title,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.grey.shade800,
                fontWeight: FontWeight.w500,
              ),
            ),
            const Spacer(),
            Text(
              isUnlimited ? '$used used' : '$used / $limit',
              style: Theme.of(context).textTheme.labelMedium?.copyWith(
                color: isNearLimit ? Colors.orange.shade600 : Colors.grey.shade600,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),

        SizedBox(height: 8.0),

        // Progress bar
        Container(
          height: 6.0,
          decoration: BoxDecoration(
            color: color.withAlpha(26),
            borderRadius: BorderRadius.circular(3.h),
          ),
          child: LayoutBuilder(
            builder: (context, constraints) {
              return AnimatedBuilder(
                animation: _progressAnimation,
                builder: (context, child) {
                  final animatedProgress = progress * _progressAnimation.value;

                  return Stack(
                    children: [
                      if (!isUnlimited)
                        Container(
                          width: constraints.maxWidth *
                              animatedProgress.clamp(0.0, 1.0),
                          height: 6.0,
                          decoration: BoxDecoration(
                            color: isNearLimit ? Colors.orange.shade600 : color,
                            borderRadius: BorderRadius.circular(3.h),
                          ),
                        ),

                      // Unlimited indicator
                      if (isUnlimited)
                        Container(
                          width: constraints.maxWidth * animatedProgress,
                          height: 6.0,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [color, color.withAlpha(77)],
                            ),
                            borderRadius: BorderRadius.circular(3.h),
                          ),
                        ),
                    ],
                  );
                },
              );
            },
          ),
        ),

        // Status indicator
        if (isNearLimit)
          Padding(
            padding: EdgeInsets.only(top: 4.0),
            child: Text(
              'Close to limit',
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                color: Colors.orange.shade600,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),

        if (isUnlimited)
          Padding(
            padding: EdgeInsets.only(top: 4.0),
            child: Text(
              'Unlimited',
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                color: Theme.of(context).primaryColor,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildUpgradeSuggestion() {
    return Container(
      padding: EdgeInsets.all(16.h),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Theme.of(context).primaryColor.withAlpha(26),
            Colors.blue.shade600.withAlpha(13),
          ],
        ),
        borderRadius: BorderRadius.circular(12.h),
        border: Border.all(
          color: Theme.of(context).primaryColor.withAlpha(51),
        ),
      ),
      child: Row(
        children: [
          Icon(
            Icons.trending_up_rounded,
            color: Theme.of(context).primaryColor,
            size: 20.0,
          ),
          SizedBox(width: 12.h),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Ready for More?',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    color: Theme.of(context).primaryColor,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  'Upgrade to unlock unlimited features',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey.shade700,
                  ),
                ),
              ],
            ),
          ),
          Icon(
            Icons.arrow_forward_ios_rounded,
            color: Theme.of(context).primaryColor,
            size: 16.0,
          ),
        ],
      ),
    );
  }

  Color _getPlanColor(String planName) {
    final lowerPlan = planName.toLowerCase();
    if (lowerPlan.contains('elite')) return Colors.purple.shade600;
    if (lowerPlan.contains('pro')) return Colors.orange.shade600;
    if (lowerPlan.contains('premium')) return Theme.of(context).primaryColor;
    return Colors.grey.shade600;
  }

  String _getPlanBadgeText(String planName) {
    final lowerPlan = planName.toLowerCase();
    if (lowerPlan.contains('elite')) return 'ELITE';
    if (lowerPlan.contains('pro')) return 'PRO';
    if (lowerPlan.contains('premium')) return 'PREMIUM';
    return 'BASIC';
  }

  bool _shouldShowUpgradeSuggestion() {
    final planName =
        widget.analytics['plan_name']?.toString().toLowerCase() ?? 'basic';
    if (planName.contains('elite')) return false;

    // Show upgrade suggestion if any usage is above 70%
    final aiScansUsed = widget.analytics['ai_scans_used'] as int? ?? 0;
    final aiScansLimit = widget.analytics['ai_scans_limit'] as int? ?? 10;
    final mealPlansUsed = widget.analytics['meal_plans_used'] as int? ?? 0;
    final mealPlansLimit = widget.analytics['meal_plans_limit'] as int? ?? 5;

    if (aiScansLimit > 0 && (aiScansUsed / aiScansLimit) >= 0.7) return true;
    if (mealPlansLimit > 0 && (mealPlansUsed / mealPlansLimit) >= 0.7)
      return true;

    return false;
  }
}