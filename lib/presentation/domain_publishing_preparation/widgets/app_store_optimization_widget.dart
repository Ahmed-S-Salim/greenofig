import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

class AppStoreOptimizationWidget extends StatefulWidget {
  final String appName;
  final VoidCallback onRefresh;

  const AppStoreOptimizationWidget({
    Key? key,
    required this.appName,
    required this.onRefresh,
  }) : super(key: key);

  @override
  State<AppStoreOptimizationWidget> createState() =>
      _AppStoreOptimizationWidgetState();
}

class _AppStoreOptimizationWidgetState
    extends State<AppStoreOptimizationWidget> {
  bool _isLoading = false;

  final Map<String, Map<String, dynamic>> _storeStatus = {
    'ios': {
      'name': 'App Store',
      'status': 'ready',
      'icon': 'apple',
      'color': Colors.grey.shade800,
      'readiness': 0.92,
      'tasks_completed': 11,
      'tasks_total': 12,
    },
    'android': {
      'name': 'Google Play',
      'status': 'in_review',
      'icon': 'android',
      'color': Colors.green,
      'readiness': 0.88,
      'tasks_completed': 14,
      'tasks_total': 16,
    },
  };

  final List<Map<String, dynamic>> _iosChecklist = [
    {
      'title': 'App Store Connect Configuration',
      'status': 'completed',
      'description': 'Bundle ID, certificates, and profiles configured',
    },
    {
      'title': 'App Metadata & Screenshots',
      'status': 'completed',
      'description': 'App description, keywords, and required screenshots',
    },
    {
      'title': 'TestFlight Beta Testing',
      'status': 'completed',
      'description': 'Internal testing completed with 15 testers',
    },
    {
      'title': 'App Review Guidelines Compliance',
      'status': 'completed',
      'description': 'All guidelines requirements met',
    },
    {
      'title': 'Privacy Policy & Terms',
      'status': 'completed',
      'description': 'Legal documents linked and compliant',
    },
    {
      'title': 'Final Submission',
      'status': 'pending',
      'description': 'Ready for App Store review submission',
    },
  ];

  final List<Map<String, dynamic>> _androidChecklist = [
    {
      'title': 'Google Play Console Setup',
      'status': 'completed',
      'description': 'Developer account and app listing created',
    },
    {
      'title': 'App Signing & Security',
      'status': 'completed',
      'description': 'Play App Signing and security scan passed',
    },
    {
      'title': 'Store Listing Optimization',
      'status': 'completed',
      'description': 'Title, description, and keywords optimized',
    },
    {
      'title': 'Content Rating',
      'status': 'completed',
      'description': 'IARC content rating questionnaire completed',
    },
    {
      'title': 'Internal Testing Track',
      'status': 'completed',
      'description': 'Alpha testing completed with 20 testers',
    },
    {
      'title': 'Open Testing Track',
      'status': 'in_progress',
      'description': 'Beta version available to limited users',
    },
    {
      'title': 'Production Release',
      'status': 'pending',
      'description': 'Ready for production release',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // App Store Overview
        _buildAppStoreOverview(theme),

        SizedBox(height: 3.h),

        // Store Status Cards
        _buildStoreStatusCards(theme),

        SizedBox(height: 3.h),

        // ASO Metrics
        _buildASOMetrics(theme),

        SizedBox(height: 3.h),

        // iOS Checklist
        _buildPlatformChecklist(
            'iOS App Store', _iosChecklist, _storeStatus['ios']!, theme),

        SizedBox(height: 3.h),

        // Android Checklist
        _buildPlatformChecklist('Google Play Store', _androidChecklist,
            _storeStatus['android']!, theme),

        SizedBox(height: 3.h),

        // App Screenshots & Metadata
        _buildAppMetadata(theme),
      ],
    );
  }

  Widget _buildAppStoreOverview(ThemeData theme) {
    final overallReadiness = (_storeStatus['ios']!['readiness'] +
            _storeStatus['android']!['readiness']) /
        2;
    final readinessColor = _getReadinessColor(overallReadiness);

    return Container(
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            readinessColor.withAlpha(26),
            readinessColor.withAlpha(13),
          ],
        ),
        borderRadius: BorderRadius.circular(15),
        border: Border.all(
          color: readinessColor.withAlpha(77),
        ),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                padding: EdgeInsets.all(3.w),
                decoration: BoxDecoration(
                  color: readinessColor.withAlpha(26),
                  shape: BoxShape.circle,
                ),
                child: CustomIconWidget(
                  iconName: 'store',
                  color: readinessColor,
                  size: 8.w,
                ),
              ),
              SizedBox(width: 4.w),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'App Store Optimization',
                      style: GoogleFonts.inter(
                        fontSize: 18.sp,
                        fontWeight: FontWeight.w700,
                        color: theme.colorScheme.onSurface,
                      ),
                    ),
                    SizedBox(height: 0.5.h),
                    Text(
                      widget.appName,
                      style: GoogleFonts.inter(
                        fontSize: 14.sp,
                        fontWeight: FontWeight.w600,
                        color: theme.colorScheme.primary,
                      ),
                    ),
                    SizedBox(height: 1.h),
                    Container(
                      padding: EdgeInsets.symmetric(
                          horizontal: 2.w, vertical: 0.5.h),
                      decoration: BoxDecoration(
                        color: readinessColor.withAlpha(26),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        '${(overallReadiness * 100).toInt()}% Ready for Launch',
                        style: GoogleFonts.inter(
                          fontSize: 11.sp,
                          fontWeight: FontWeight.w600,
                          color: readinessColor,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: _refreshAppStoreStatus,
                icon: _isLoading
                    ? SizedBox(
                        width: 5.w,
                        height: 5.w,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor:
                              AlwaysStoppedAnimation<Color>(readinessColor),
                        ),
                      )
                    : Icon(
                        Icons.refresh,
                        color: readinessColor,
                        size: 6.w,
                      ),
              ),
            ],
          ),

          SizedBox(height: 3.h),

          // Progress Bar
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Overall Progress',
                    style: GoogleFonts.inter(
                      fontSize: 14.sp,
                      fontWeight: FontWeight.w600,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                  Text(
                    '25/28 Tasks Complete',
                    style: GoogleFonts.inter(
                      fontSize: 12.sp,
                      fontWeight: FontWeight.w500,
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
              SizedBox(height: 1.h),
              LinearProgressIndicator(
                value: overallReadiness,
                backgroundColor: theme.colorScheme.surfaceContainerHighest,
                valueColor: AlwaysStoppedAnimation<Color>(readinessColor),
                borderRadius: BorderRadius.circular(5),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStoreStatusCards(ThemeData theme) {
    return Row(
      children: [
        Expanded(
          child: _buildStoreCard(_storeStatus['ios']!, theme),
        ),
        SizedBox(width: 3.w),
        Expanded(
          child: _buildStoreCard(_storeStatus['android']!, theme),
        ),
      ],
    );
  }

  Widget _buildStoreCard(Map<String, dynamic> store, ThemeData theme) {
    final readiness = store['readiness'] as double;
    final readinessColor = _getReadinessColor(readiness);

    return Container(
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(15),
        border: Border.all(
          color: readinessColor.withAlpha(77),
        ),
        boxShadow: [
          BoxShadow(
            color: theme.shadowColor.withAlpha(25),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: EdgeInsets.all(2.w),
                decoration: BoxDecoration(
                  color: (store['color'] as Color).withAlpha(26),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: CustomIconWidget(
                  iconName: store['icon'],
                  color: store['color'] as Color,
                  size: 6.w,
                ),
              ),
              SizedBox(width: 3.w),
              Expanded(
                child: Text(
                  store['name'],
                  style: GoogleFonts.inter(
                    fontSize: 14.sp,
                    fontWeight: FontWeight.w700,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 2.h),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${(readiness * 100).toInt()}%',
                style: GoogleFonts.inter(
                  fontSize: 20.sp,
                  fontWeight: FontWeight.w800,
                  color: readinessColor,
                ),
              ),
              Text(
                '${store['tasks_completed']}/${store['tasks_total']}',
                style: GoogleFonts.inter(
                  fontSize: 12.sp,
                  fontWeight: FontWeight.w500,
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
          SizedBox(height: 1.h),
          LinearProgressIndicator(
            value: readiness,
            backgroundColor: theme.colorScheme.surfaceContainerHighest,
            valueColor: AlwaysStoppedAnimation<Color>(readinessColor),
            borderRadius: BorderRadius.circular(5),
          ),
          SizedBox(height: 2.h),
          Container(
            padding: EdgeInsets.symmetric(horizontal: 2.w, vertical: 1.h),
            decoration: BoxDecoration(
              color: _getStatusColor(store['status']).withAlpha(26),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              _getStatusText(store['status']),
              style: GoogleFonts.inter(
                fontSize: 10.sp,
                fontWeight: FontWeight.w600,
                color: _getStatusColor(store['status']),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildASOMetrics(ThemeData theme) {
    return Container(
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(15),
        border: Border.all(
          color: theme.colorScheme.outline.withAlpha(77),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CustomIconWidget(
                iconName: 'trending_up',
                color: theme.colorScheme.primary,
                size: 6.w,
              ),
              SizedBox(width: 3.w),
              Text(
                'ASO Optimization Metrics',
                style: GoogleFonts.inter(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.w700,
                  color: theme.colorScheme.onSurface,
                ),
              ),
            ],
          ),
          SizedBox(height: 3.h),
          Row(
            children: [
              Expanded(
                child: _buildASOMetricCard(
                    'Keywords', '85', 'Score', Colors.green, theme),
              ),
              SizedBox(width: 3.w),
              Expanded(
                child: _buildASOMetricCard(
                    'Screenshots', '8/8', 'Complete', Colors.blue, theme),
              ),
            ],
          ),
          SizedBox(height: 2.h),
          Row(
            children: [
              Expanded(
                child: _buildASOMetricCard(
                    'Description', '92%', 'Optimized', Colors.orange, theme),
              ),
              SizedBox(width: 3.w),
              Expanded(
                child: _buildASOMetricCard(
                    'Ratings', '4.8/5', 'Target', Colors.purple, theme),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildASOMetricCard(String title, String value, String subtitle,
      Color color, ThemeData theme) {
    return Container(
      padding: EdgeInsets.all(3.w),
      decoration: BoxDecoration(
        color: color.withAlpha(26),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: color.withAlpha(77),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: GoogleFonts.inter(
              fontSize: 12.sp,
              fontWeight: FontWeight.w600,
              color: theme.colorScheme.onSurface,
            ),
          ),
          SizedBox(height: 1.h),
          Text(
            value,
            style: GoogleFonts.inter(
              fontSize: 18.sp,
              fontWeight: FontWeight.w800,
              color: color,
            ),
          ),
          Text(
            subtitle,
            style: GoogleFonts.inter(
              fontSize: 10.sp,
              fontWeight: FontWeight.w500,
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPlatformChecklist(
      String platform,
      List<Map<String, dynamic>> checklist,
      Map<String, dynamic> storeInfo,
      ThemeData theme) {
    return Container(
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(15),
        border: Border.all(
          color: theme.colorScheme.outline.withAlpha(77),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: EdgeInsets.all(2.w),
                decoration: BoxDecoration(
                  color: (storeInfo['color'] as Color).withAlpha(26),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: CustomIconWidget(
                  iconName: storeInfo['icon'],
                  color: storeInfo['color'] as Color,
                  size: 6.w,
                ),
              ),
              SizedBox(width: 3.w),
              Expanded(
                child: Text(
                  platform,
                  style: GoogleFonts.inter(
                    fontSize: 18.sp,
                    fontWeight: FontWeight.w700,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
              ),
              Text(
                '${storeInfo['tasks_completed']}/${storeInfo['tasks_total']}',
                style: GoogleFonts.inter(
                  fontSize: 12.sp,
                  fontWeight: FontWeight.w600,
                  color: theme.colorScheme.primary,
                ),
              ),
            ],
          ),
          SizedBox(height: 3.h),
          ...checklist.map((item) => _buildChecklistItem(item, theme)).toList(),
        ],
      ),
    );
  }

  Widget _buildChecklistItem(Map<String, dynamic> item, ThemeData theme) {
    Color statusColor;
    IconData statusIcon;

    switch (item['status']) {
      case 'completed':
        statusColor = Colors.green;
        statusIcon = Icons.check_circle;
        break;
      case 'in_progress':
        statusColor = Colors.orange;
        statusIcon = Icons.schedule;
        break;
      default:
        statusColor = theme.colorScheme.outline;
        statusIcon = Icons.radio_button_unchecked;
    }

    return Container(
      margin: EdgeInsets.only(bottom: 2.h),
      padding: EdgeInsets.all(3.w),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest.withAlpha(128),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: statusColor.withAlpha(77),
        ),
      ),
      child: Row(
        children: [
          Icon(
            statusIcon,
            color: statusColor,
            size: 6.w,
          ),
          SizedBox(width: 3.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item['title'],
                  style: GoogleFonts.inter(
                    fontSize: 14.sp,
                    fontWeight: FontWeight.w600,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
                SizedBox(height: 0.5.h),
                Text(
                  item['description'],
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
    );
  }

  Widget _buildAppMetadata(ThemeData theme) {
    return Container(
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(15),
        border: Border.all(
          color: theme.colorScheme.outline.withAlpha(77),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CustomIconWidget(
                iconName: 'photo_library',
                color: theme.colorScheme.primary,
                size: 6.w,
              ),
              SizedBox(width: 3.w),
              Text(
                'App Metadata & Assets',
                style: GoogleFonts.inter(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.w700,
                  color: theme.colorScheme.onSurface,
                ),
              ),
            ],
          ),

          SizedBox(height: 3.h),

          // App Icon
          Row(
            children: [
              Container(
                width: 15.w,
                height: 15.w,
                decoration: BoxDecoration(
                  color: theme.colorScheme.primary.withAlpha(26),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: theme.colorScheme.primary.withAlpha(77),
                  ),
                ),
                child: Center(
                  child: CustomIconWidget(
                    iconName: 'fitness_center',
                    color: theme.colorScheme.primary,
                    size: 8.w,
                  ),
                ),
              ),
              SizedBox(width: 4.w),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Greenofig Health & Fitness',
                      style: GoogleFonts.inter(
                        fontSize: 16.sp,
                        fontWeight: FontWeight.w700,
                        color: theme.colorScheme.onSurface,
                      ),
                    ),
                    SizedBox(height: 0.5.h),
                    Text(
                      'AI-powered health companion for nutrition tracking, workout planning, and wellness coaching.',
                      style: GoogleFonts.inter(
                        fontSize: 12.sp,
                        fontWeight: FontWeight.w400,
                        color: theme.colorScheme.onSurfaceVariant,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          SizedBox(height: 3.h),

          // Keywords
          Text(
            'Target Keywords',
            style: GoogleFonts.inter(
              fontSize: 14.sp,
              fontWeight: FontWeight.w600,
              color: theme.colorScheme.onSurface,
            ),
          ),
          SizedBox(height: 1.h),
          Wrap(
            spacing: 2.w,
            runSpacing: 1.h,
            children: [
              'fitness app',
              'health tracker',
              'nutrition',
              'AI coach',
              'workout planner',
              'meal planning',
              'wellness',
              'health goals',
              'fitness tracker',
              'diet app'
            ]
                .map((keyword) => Container(
                      padding: EdgeInsets.symmetric(
                          horizontal: 2.w, vertical: 0.5.h),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.primary.withAlpha(26),
                        borderRadius: BorderRadius.circular(15),
                        border: Border.all(
                          color: theme.colorScheme.primary.withAlpha(77),
                        ),
                      ),
                      child: Text(
                        keyword,
                        style: GoogleFonts.inter(
                          fontSize: 10.sp,
                          fontWeight: FontWeight.w500,
                          color: theme.colorScheme.primary,
                        ),
                      ),
                    ))
                .toList(),
          ),

          SizedBox(height: 3.h),

          // Screenshots Status
          Container(
            padding: EdgeInsets.all(3.w),
            decoration: BoxDecoration(
              color: Colors.green.withAlpha(26),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: Colors.green.withAlpha(77),
              ),
            ),
            child: Row(
              children: [
                Icon(Icons.check_circle, color: Colors.green, size: 5.w),
                SizedBox(width: 3.w),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Screenshots & Preview Assets',
                        style: GoogleFonts.inter(
                          fontSize: 12.sp,
                          fontWeight: FontWeight.w600,
                          color: theme.colorScheme.onSurface,
                        ),
                      ),
                      Text(
                        'All required screenshots and app preview videos ready for both iOS and Android',
                        style: GoogleFonts.inter(
                          fontSize: 11.sp,
                          fontWeight: FontWeight.w400,
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Color _getReadinessColor(double readiness) {
    if (readiness >= 0.9) return Colors.green;
    if (readiness >= 0.7) return Colors.orange;
    return Colors.red;
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'ready':
        return Colors.green;
      case 'in_review':
        return Colors.orange;
      default:
        return Colors.red;
    }
  }

  String _getStatusText(String status) {
    switch (status) {
      case 'ready':
        return 'Ready to Submit';
      case 'in_review':
        return 'In Review';
      default:
        return 'Needs Work';
    }
  }

  void _refreshAppStoreStatus() async {
    setState(() => _isLoading = true);

    await Future.delayed(const Duration(seconds: 2));

    if (mounted) {
      setState(() => _isLoading = false);
      widget.onRefresh();

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('App store status refreshed for ${widget.appName}'),
          backgroundColor: Colors.green,
        ),
      );
    }
  }
}
