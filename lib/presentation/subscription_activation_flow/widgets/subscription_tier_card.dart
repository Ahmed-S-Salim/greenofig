import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

class SubscriptionTierCard extends StatelessWidget {
  final Map<String, dynamic> plan;
  final bool isYearly;
  final bool isLoading;
  final VoidCallback onSubscribe;

  const SubscriptionTierCard({
    Key? key,
    required this.plan,
    required this.isYearly,
    required this.isLoading,
    required this.onSubscribe,
  }) : super(key: key);

  double get price =>
      isYearly ? plan['yearlyPrice'] / 12 : plan['monthlyPrice'];

  String get priceDisplay {
    final billing = isYearly ? '/mo (billed yearly)' : '/month';
    return '\$${price.toStringAsFixed(2)}$billing';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isPopular = plan['isPopular'] ?? false;

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            theme.colorScheme.surface,
            theme.colorScheme.surface.withAlpha((0.8 * 255).round()),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isPopular
              ? plan['color']
              : theme.colorScheme.outline.withAlpha((0.3 * 255).round()),
          width: isPopular ? 2 : 1,
        ),
        boxShadow: isPopular
            ? [
                BoxShadow(
                  color: plan['color'].withAlpha(51),
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
          // Popular badge
          if (isPopular)
            Positioned(
              top: -1,
              left: 6.w,
              right: 6.w,
              child: Container(
                padding: EdgeInsets.symmetric(vertical: 0.5.h),
                decoration: BoxDecoration(
                  color: plan['color'],
                  borderRadius: const BorderRadius.vertical(
                    bottom: Radius.circular(12),
                  ),
                ),
                child: Center(
                  child: Text(
                    'MOST POPULAR',
                    style: GoogleFonts.inter(
                      fontSize: 12.sp,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ),
            ),

          Padding(
            padding: EdgeInsets.all(6.w),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (isPopular) SizedBox(height: 2.h),

                // Plan header
                Row(
                  children: [
                    Container(
                      width: 12.w,
                      height: 12.w,
                      decoration: BoxDecoration(
                        color: plan['color'].withAlpha((0.2 * 255).round()),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Center(
                        child: Text(
                          plan['name'][0],
                          style: GoogleFonts.inter(
                            fontSize: 18.sp,
                            fontWeight: FontWeight.w700,
                            color: plan['color'],
                          ),
                        ),
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
                              fontSize: 24.sp,
                              fontWeight: FontWeight.w700,
                              color: theme.colorScheme.onSurface,
                            ),
                          ),
                          if (isYearly && plan['yearlyDiscount'] > 0)
                            Container(
                              padding: EdgeInsets.symmetric(
                                horizontal: 2.w,
                                vertical: 0.3.h,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.green,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                'Save ${plan['yearlyDiscount']}%',
                                style: GoogleFonts.inter(
                                  fontSize: 10.sp,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),

                SizedBox(height: 3.h),

                // Price
                Row(
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: [
                    Text(
                      '\$${price.toStringAsFixed(0)}',
                      style: GoogleFonts.inter(
                        fontSize: 36.sp,
                        fontWeight: FontWeight.w800,
                        color: plan['color'],
                        height: 1.0,
                      ),
                    ),
                    Text(
                      '.${(price % 1 * 100).round().toString().padLeft(2, '0')}',
                      style: GoogleFonts.inter(
                        fontSize: 18.sp,
                        fontWeight: FontWeight.w600,
                        color: plan['color'],
                      ),
                    ),
                    SizedBox(width: 2.w),
                    Text(
                      isYearly ? '/mo\n(billed yearly)' : '/month',
                      style: GoogleFonts.inter(
                        fontSize: 12.sp,
                        fontWeight: FontWeight.w500,
                        color: theme.colorScheme.onSurfaceVariant,
                        height: 1.2,
                      ),
                    ),
                  ],
                ),

                SizedBox(height: 3.h),

                // Description
                Text(
                  plan['description'],
                  style: GoogleFonts.inter(
                    fontSize: 14.sp,
                    color: theme.colorScheme.onSurfaceVariant,
                    height: 1.4,
                  ),
                ),

                SizedBox(height: 4.h),

                // Features
                ...List.generate(
                  (plan['features'] as List).length.clamp(0, 4),
                  (index) => Padding(
                    padding: EdgeInsets.only(bottom: 1.h),
                    child: Row(
                      children: [
                        Container(
                          width: 5.w,
                          height: 5.w,
                          decoration: BoxDecoration(
                            color: plan['color'].withAlpha((0.2 * 255).round()),
                            shape: BoxShape.circle,
                          ),
                          child: Center(
                            child: Icon(
                              Icons.check,
                              size: 3.w,
                              color: plan['color'],
                            ),
                          ),
                        ),
                        SizedBox(width: 3.w),
                        Expanded(
                          child: Text(
                            plan['features'][index],
                            style: GoogleFonts.inter(
                              fontSize: 14.sp,
                              color: theme.colorScheme.onSurface,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                if ((plan['features'] as List).length > 4)
                  Padding(
                    padding: EdgeInsets.only(top: 1.h),
                    child: Text(
                      '+${(plan['features'] as List).length - 4} more features',
                      style: GoogleFonts.inter(
                        fontSize: 12.sp,
                        fontWeight: FontWeight.w500,
                        color: plan['color'],
                      ),
                    ),
                  ),

                SizedBox(height: 4.h),

                // Subscribe button
                SizedBox(
                  width: double.infinity,
                  height: 6.h,
                  child: ElevatedButton(
                    onPressed: isLoading ? null : onSubscribe,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: plan['color'],
                      foregroundColor: Colors.white,
                      elevation: 0,
                      disabledBackgroundColor:
                          plan['color'].withAlpha((0.5 * 255).round()),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: isLoading
                        ? SizedBox(
                            width: 5.w,
                            height: 5.w,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2,
                            ),
                          )
                        : Text(
                            'Choose ${plan['name']}',
                            style: GoogleFonts.inter(
                              fontSize: 16.sp,
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
}
