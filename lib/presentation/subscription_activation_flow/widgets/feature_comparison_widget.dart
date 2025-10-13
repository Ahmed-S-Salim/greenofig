import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

class FeatureComparisonWidget extends StatefulWidget {
  final List<Map<String, dynamic>> plans;

  const FeatureComparisonWidget({
    Key? key,
    required this.plans,
  }) : super(key: key);

  @override
  State<FeatureComparisonWidget> createState() =>
      _FeatureComparisonWidgetState();
}

class _FeatureComparisonWidgetState extends State<FeatureComparisonWidget> {
  bool _isExpanded = false;

  // Comprehensive feature comparison data
  final List<Map<String, dynamic>> _allFeatures = [
    {
      'category': 'Core Features',
      'features': [
        {
          'name': 'AI Food Scanning',
          'basic': '50 scans/month',
          'premium': 'Unlimited',
          'pro': 'Unlimited + Advanced AI',
        },
        {
          'name': 'Meal Planning',
          'basic': 'Basic templates',
          'premium': 'Personalized plans',
          'pro': 'AI-generated + Custom',
        },
        {
          'name': 'Workout Tracking',
          'basic': 'Basic logging',
          'premium': 'Advanced analytics',
          'pro': 'Professional coaching',
        },
        {
          'name': 'Progress Photos',
          'basic': true,
          'premium': true,
          'pro': 'Enhanced with AI analysis',
        },
      ]
    },
    {
      'category': 'Advanced Features',
      'features': [
        {
          'name': 'Health Device Sync',
          'basic': false,
          'premium': 'Smart watches & scales',
          'pro': 'All devices + advanced metrics',
        },
        {
          'name': 'Nutrition Coaching',
          'basic': false,
          'premium': 'AI recommendations',
          'pro': 'Personal AI coach',
        },
        {
          'name': 'Custom Workouts',
          'basic': false,
          'premium': false,
          'pro': 'Full workout builder',
        },
        {
          'name': 'Biometric Tracking',
          'basic': 'Basic metrics',
          'premium': 'Advanced analytics',
          'pro': 'Professional insights',
        },
      ]
    },
    {
      'category': 'Premium Services',
      'features': [
        {
          'name': 'Live Coaching Sessions',
          'basic': false,
          'premium': false,
          'pro': 'Monthly sessions',
        },
        {
          'name': 'Family Plan',
          'basic': false,
          'premium': false,
          'pro': 'Up to 4 users',
        },
        {
          'name': 'Meal Delivery Integration',
          'basic': false,
          'premium': false,
          'pro': true,
        },
        {
          'name': 'White-glove Support',
          'basic': 'Community',
          'premium': 'Priority support',
          'pro': 'Dedicated specialist',
        },
      ]
    },
    {
      'category': 'Storage & Limits',
      'features': [
        {
          'name': 'Cloud Storage',
          'basic': '500MB',
          'premium': '5GB',
          'pro': 'Unlimited',
        },
        {
          'name': 'Recipe Database',
          'basic': '100 recipes',
          'premium': '1,000 recipes',
          'pro': 'Unlimited + custom',
        },
        {
          'name': 'Export Data',
          'basic': false,
          'premium': 'PDF reports',
          'pro': 'Full data export',
        },
      ]
    }
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      child: Column(
        children: [
          // Toggle button
          GestureDetector(
            onTap: () => setState(() => _isExpanded = !_isExpanded),
            child: Container(
              padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.5.h),
              decoration: BoxDecoration(
                color: theme.colorScheme.primary.withAlpha(26),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: theme.colorScheme.primary.withAlpha(77),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    _isExpanded
                        ? 'Hide Comparison'
                        : 'Show Detailed Comparison',
                    style: GoogleFonts.inter(
                      fontSize: 14.sp,
                      fontWeight: FontWeight.w600,
                      color: theme.colorScheme.primary,
                    ),
                  ),
                  SizedBox(width: 2.w),
                  AnimatedRotation(
                    turns: _isExpanded ? 0.5 : 0.0,
                    duration: const Duration(milliseconds: 300),
                    child: Icon(
                      Icons.expand_more,
                      color: theme.colorScheme.primary,
                      size: 5.w,
                    ),
                  ),
                ],
              ),
            ),
          ),

          if (_isExpanded) ...[
            SizedBox(height: 3.h),
            _buildComparisonTable(theme),
          ],
        ],
      ),
    );
  }

  Widget _buildComparisonTable(ThemeData theme) {
    return Container(
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(15),
        border: Border.all(
          color: theme.colorScheme.outline.withAlpha(77),
        ),
      ),
      child: Column(
        children: [
          // Table Header
          Container(
            padding: EdgeInsets.all(3.w),
            decoration: BoxDecoration(
              color: theme.colorScheme.surfaceContainerHighest.withAlpha(128),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(15),
                topRight: Radius.circular(15),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  flex: 2,
                  child: Text(
                    'Features',
                    style: GoogleFonts.inter(
                      fontSize: 14.sp,
                      fontWeight: FontWeight.w700,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                ),
                ...[
                  {'name': 'Basic', 'color': const Color(0xFF4CAF50)},
                  {'name': 'Premium', 'color': const Color(0xFF2196F3)},
                  {'name': 'Pro', 'color': const Color(0xFFFF9800)},
                ]
                    .map((plan) => Expanded(
                          child: Column(
                            children: [
                              Text(
                                plan['name'] as String,
                                style: GoogleFonts.inter(
                                  fontSize: 12.sp,
                                  fontWeight: FontWeight.w700,
                                  color: plan['color'] as Color,
                                ),
                                textAlign: TextAlign.center,
                              ),
                              SizedBox(height: 0.5.h),
                              Container(
                                height: 0.3.h,
                                width: 8.w,
                                decoration: BoxDecoration(
                                  color: plan['color'] as Color,
                                  borderRadius: BorderRadius.circular(2),
                                ),
                              ),
                            ],
                          ),
                        ))
                    .toList(),
              ],
            ),
          ),

          // Feature Categories
          ..._allFeatures
              .map((category) => _buildFeatureCategory(
                    category['category'] as String,
                    category['features'] as List<Map<String, dynamic>>,
                    theme,
                  ))
              .toList(),
        ],
      ),
    );
  }

  Widget _buildFeatureCategory(String categoryName,
      List<Map<String, dynamic>> features, ThemeData theme) {
    return Column(
      children: [
        // Category Header
        Container(
          width: double.infinity,
          padding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 1.5.h),
          decoration: BoxDecoration(
            color: theme.colorScheme.primaryContainer.withAlpha(77),
            border: Border(
              top: BorderSide(
                color: theme.colorScheme.outline.withAlpha(77),
                width: 0.5,
              ),
            ),
          ),
          child: Text(
            categoryName,
            style: GoogleFonts.inter(
              fontSize: 13.sp,
              fontWeight: FontWeight.w700,
              color: theme.colorScheme.primary,
            ),
          ),
        ),

        // Category Features
        ...features.map((feature) => _buildFeatureRow(feature, theme)).toList(),
      ],
    );
  }

  Widget _buildFeatureRow(Map<String, dynamic> feature, ThemeData theme) {
    return Container(
      padding: EdgeInsets.all(2.5.w),
      decoration: BoxDecoration(
        border: Border(
          top: BorderSide(
            color: theme.colorScheme.outline.withAlpha(51),
            width: 0.5,
          ),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            flex: 2,
            child: Text(
              feature['name'],
              style: GoogleFonts.inter(
                fontSize: 12.sp,
                fontWeight: FontWeight.w500,
                color: theme.colorScheme.onSurface,
              ),
            ),
          ),
          ...[
            {'key': 'basic', 'color': const Color(0xFF4CAF50)},
            {'key': 'premium', 'color': const Color(0xFF2196F3)},
            {'key': 'pro', 'color': const Color(0xFFFF9800)},
          ]
              .map((plan) => Expanded(
                    child: _buildFeatureCell(
                      feature[plan['key']],
                      plan['color'] as Color,
                      theme,
                    ),
                  ))
              .toList(),
        ],
      ),
    );
  }

  Widget _buildFeatureCell(dynamic value, Color planColor, ThemeData theme) {
    Widget content;

    if (value is bool) {
      content = Icon(
        value ? Icons.check_circle : Icons.cancel,
        color: value ? planColor : theme.colorScheme.outline,
        size: 5.w,
      );
    } else if (value is String) {
      content = Text(
        value,
        style: GoogleFonts.inter(
          fontSize: 10.sp,
          fontWeight: FontWeight.w600,
          color: theme.colorScheme.onSurface,
        ),
        textAlign: TextAlign.center,
        maxLines: 2,
        overflow: TextOverflow.ellipsis,
      );
    } else {
      content = Icon(
        Icons.remove,
        color: theme.colorScheme.outline,
        size: 4.w,
      );
    }

    return Container(
      padding: EdgeInsets.symmetric(horizontal: 1.w, vertical: 1.h),
      child: content,
    );
  }
}
