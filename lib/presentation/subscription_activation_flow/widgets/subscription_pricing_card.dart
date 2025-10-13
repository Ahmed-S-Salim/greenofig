import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

class SubscriptionPricingCard extends StatelessWidget {
  final Map<String, dynamic> plan;
  final bool isAnnual;
  final bool isSelected;
  final VoidCallback onTap;

  const SubscriptionPricingCard({
    Key? key,
    required this.plan,
    required this.isAnnual,
    required this.isSelected,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final price = isAnnual ? plan['yearlyPrice'] : plan['monthlyPrice'];
    final originalPrice = isAnnual ? (plan['monthlyPrice'] * 12) : null;
    final savings = originalPrice != null ? (originalPrice - price) : 0;

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        decoration: BoxDecoration(
          gradient: isSelected
              ? LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    plan['color'].withAlpha((0.1 * 255).round()),
                    plan['color'].withAlpha((0.05 * 255).round()),
                  ],
                )
              : null,
          color: isSelected ? null : theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected
                ? plan['color']
                : theme.colorScheme.outline.withAlpha(77),
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: plan['color'].withAlpha(77),
                    blurRadius: 20,
                    spreadRadius: 2,
                    offset: const Offset(0, 8),
                  ),
                ]
              : [
                  BoxShadow(
                    color: theme.shadowColor.withAlpha(25),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
        ),
        child: Stack(
          children: [
            // Popular Badge
            if (plan['isPopular'])
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                child: Container(
                  padding: EdgeInsets.symmetric(vertical: 1.h),
                  decoration: BoxDecoration(
                    color: plan['color'],
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(20),
                      topRight: Radius.circular(20),
                    ),
                  ),
                  child: Text(
                    '⭐ MOST POPULAR',
                    style: GoogleFonts.inter(
                      fontSize: 12.sp,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),

            // Main Content
            Padding(
              padding: EdgeInsets.all(5.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header spacing for popular badge
                  if (plan['isPopular']) SizedBox(height: 2.h),

                  // Plan Header
                  Row(
                    children: [
                      Container(
                        padding: EdgeInsets.all(3.w),
                        decoration: BoxDecoration(
                          color: plan['color'].withAlpha((0.1 * 255).round()),
                          borderRadius: BorderRadius.circular(15),
                        ),
                        child: CustomIconWidget(
                          iconName: _getIconForPlan(plan['id']),
                          color: plan['color'],
                          size: 8.w,
                        ),
                      ),
                      SizedBox(width: 4.w),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              plan['name'],
                              style: GoogleFonts.inter(
                                fontSize: 20.sp,
                                fontWeight: FontWeight.w700,
                                color: theme.colorScheme.onSurface,
                              ),
                            ),
                            Text(
                              plan['description'],
                              style: GoogleFonts.inter(
                                fontSize: 12.sp,
                                fontWeight: FontWeight.w400,
                                color: theme.colorScheme.onSurfaceVariant,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: 3.h),

                  // Price Section
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        '\$${price.toStringAsFixed(2)}',
                        style: GoogleFonts.inter(
                          fontSize: 32.sp,
                          fontWeight: FontWeight.w800,
                          color: plan['color'],
                          height: 1.0,
                        ),
                      ),
                      SizedBox(width: 1.w),
                      Padding(
                        padding: EdgeInsets.only(bottom: 1.h),
                        child: Text(
                          isAnnual ? '/year' : '/month',
                          style: GoogleFonts.inter(
                            fontSize: 14.sp,
                            fontWeight: FontWeight.w500,
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ),
                    ],
                  ),

                  // Savings indicator
                  if (isAnnual && savings > 0) ...[
                    SizedBox(height: 1.h),
                    Container(
                      padding: EdgeInsets.symmetric(
                          horizontal: 3.w, vertical: 0.5.h),
                      decoration: BoxDecoration(
                        color: Colors.green.withAlpha(26),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: Colors.green.withAlpha(77),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.savings,
                            size: 3.w,
                            color: Colors.green,
                          ),
                          SizedBox(width: 1.w),
                          Text(
                            'Save \$${savings.toStringAsFixed(2)} annually',
                            style: GoogleFonts.inter(
                              fontSize: 11.sp,
                              fontWeight: FontWeight.w600,
                              color: Colors.green,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  SizedBox(height: 3.h),

                  // Features List
                  ...List.generate(plan['features'].length, (index) {
                    final feature = plan['features'][index];
                    return Padding(
                      padding: EdgeInsets.only(bottom: 1.5.h),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            margin: EdgeInsets.only(top: 0.5.h),
                            padding: EdgeInsets.all(1.w),
                            decoration: BoxDecoration(
                              color:
                                  plan['color'].withAlpha((0.1 * 255).round()),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              Icons.check,
                              size: 3.w,
                              color: plan['color'],
                            ),
                          ),
                          SizedBox(width: 3.w),
                          Expanded(
                            child: Text(
                              feature,
                              style: GoogleFonts.inter(
                                fontSize: 13.sp,
                                fontWeight: FontWeight.w500,
                                color: theme.colorScheme.onSurface,
                                height: 1.4,
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }),

                  SizedBox(height: 2.h),

                  // Usage Limits (if applicable)
                  if (plan['limits'] != null) _buildLimitsSection(theme),

                  SizedBox(height: 3.h),

                  // Select Button
                  SizedBox(
                    width: double.infinity,
                    height: 5.h,
                    child: ElevatedButton(
                      onPressed: onTap,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isSelected
                            ? plan['color']
                            : theme.colorScheme.surfaceContainerHighest,
                        foregroundColor: isSelected
                            ? Colors.white
                            : theme.colorScheme.onSurfaceVariant,
                        elevation: isSelected ? 4 : 0,
                        shadowColor: plan['color'].withAlpha(102),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(25),
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          if (isSelected) ...[
                            Icon(
                              Icons.check_circle,
                              size: 4.w,
                            ),
                            SizedBox(width: 2.w),
                          ],
                          Text(
                            isSelected ? 'Selected' : 'Select Plan',
                            style: GoogleFonts.inter(
                              fontSize: 14.sp,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Selection Indicator
            if (isSelected)
              Positioned(
                top: plan['isPopular'] ? 5.h : 2.h,
                right: 4.w,
                child: Container(
                  padding: EdgeInsets.all(1.w),
                  decoration: BoxDecoration(
                    color: plan['color'],
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: plan['color'].withAlpha(102),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Icon(
                    Icons.check,
                    size: 4.w,
                    color: Colors.white,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildLimitsSection(ThemeData theme) {
    final limits = plan['limits'] as Map<String, dynamic>;

    return Container(
      padding: EdgeInsets.all(3.w),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest.withAlpha(128),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: theme.colorScheme.outline.withAlpha(77),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Plan Limits:',
            style: GoogleFonts.inter(
              fontSize: 12.sp,
              fontWeight: FontWeight.w600,
              color: theme.colorScheme.onSurface,
            ),
          ),
          SizedBox(height: 1.h),
          ...limits.entries.map((entry) {
            String displayValue;
            if (entry.value == -1) {
              displayValue = 'Unlimited';
            } else {
              displayValue = entry.value.toString();
            }

            return Padding(
              padding: EdgeInsets.only(bottom: 0.5.h),
              child: Row(
                children: [
                  Text(
                    '• ${_formatLimitKey(entry.key)}:',
                    style: GoogleFonts.inter(
                      fontSize: 11.sp,
                      fontWeight: FontWeight.w500,
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                  SizedBox(width: 2.w),
                  Text(
                    displayValue,
                    style: GoogleFonts.inter(
                      fontSize: 11.sp,
                      fontWeight: FontWeight.w600,
                      color: plan['color'],
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
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
      case 'workouts':
        return 'Workout Level';
      case 'storage':
        return 'Storage';
      default:
        return key
            .replaceAll('_', ' ')
            .split(' ')
            .map((word) => word[0].toUpperCase() + word.substring(1))
            .join(' ');
    }
  }

  String _getIconForPlan(String planId) {
    switch (planId) {
      case 'basic':
        return 'fitness_center';
      case 'premium':
        return 'workspace_premium';
      case 'pro':
        return 'diamond';
      default:
        return 'star';
    }
  }
}
