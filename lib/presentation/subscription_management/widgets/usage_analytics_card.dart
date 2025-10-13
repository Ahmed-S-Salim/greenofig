import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

class UsageAnalyticsCard extends StatelessWidget {
  final Map<String, dynamic> analyticsData;

  const UsageAnalyticsCard({
    Key? key,
    required this.analyticsData,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.h),
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: AppTheme.lightTheme.colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppTheme.lightTheme.colorScheme.outline,
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: AppTheme.lightTheme.shadowColor,
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(),
          SizedBox(height: 3.h),
          _buildUsageChart(),
          SizedBox(height: 3.h),
          _buildFeatureUsageList(),
          SizedBox(height: 2.h),
          _buildUpgradeRecommendation(),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      children: [
        CustomIconWidget(
          iconName: 'analytics',
          color: AppTheme.lightTheme.primaryColor,
          size: 24,
        ),
        SizedBox(width: 2.w),
        Expanded(
          child: Text(
            'Your Usage This Month',
            style: GoogleFonts.inter(
              fontSize: 16.sp,
              fontWeight: FontWeight.w600,
              color: AppTheme.lightTheme.colorScheme.onSurface,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildUsageChart() {
    return Container(
      height: 20.h,
      child: Semantics(
        label: "Monthly usage analytics chart showing feature utilization",
        child: PieChart(
          PieChartData(
            sections: _buildChartSections(),
            centerSpaceRadius: 8.w,
            sectionsSpace: 2,
            startDegreeOffset: -90,
          ),
        ),
      ),
    );
  }

  List<PieChartSectionData> _buildChartSections() {
    final usageData = analyticsData['featureUsage'] as Map<String, dynamic>;
    final colors = [
      AppTheme.lightTheme.primaryColor,
      AppTheme.lightTheme.colorScheme.secondary,
      AppTheme.lightTheme.colorScheme.tertiary,
      AppTheme.lightTheme.colorScheme.onSurfaceVariant,
    ];

    int index = 0;
    return usageData.entries.map((entry) {
      final percentage = (entry.value as num).toDouble();
      final color = colors[index % colors.length];
      index++;

      return PieChartSectionData(
        value: percentage,
        color: color,
        title: '${percentage.toInt()}%',
        radius: 8.w,
        titleStyle: GoogleFonts.inter(
          fontSize: 10.sp,
          fontWeight: FontWeight.w600,
          color: AppTheme.lightTheme.colorScheme.onPrimary,
        ),
      );
    }).toList();
  }

  Widget _buildFeatureUsageList() {
    final usageData = analyticsData['featureUsage'] as Map<String, dynamic>;
    final colors = [
      AppTheme.lightTheme.primaryColor,
      AppTheme.lightTheme.colorScheme.secondary,
      AppTheme.lightTheme.colorScheme.tertiary,
      AppTheme.lightTheme.colorScheme.onSurfaceVariant,
    ];

    int index = 0;
    return Column(
      children: usageData.entries.map((entry) {
        final color = colors[index % colors.length];
        final percentage = (entry.value as num).toDouble();
        index++;

        return Padding(
          padding: EdgeInsets.only(bottom: 1.h),
          child: Row(
            children: [
              Container(
                width: 3.w,
                height: 3.w,
                decoration: BoxDecoration(
                  color: color,
                  shape: BoxShape.circle,
                ),
              ),
              SizedBox(width: 3.w),
              Expanded(
                child: Text(
                  entry.key,
                  style: GoogleFonts.inter(
                    fontSize: 12.sp,
                    fontWeight: FontWeight.w400,
                    color: AppTheme.lightTheme.colorScheme.onSurface,
                  ),
                ),
              ),
              Text(
                '${percentage.toInt()}%',
                style: GoogleFonts.inter(
                  fontSize: 12.sp,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.lightTheme.colorScheme.onSurface,
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildUpgradeRecommendation() {
    final recommendedTier = analyticsData['recommendedUpgrade'] as String?;

    if (recommendedTier == null) return const SizedBox.shrink();

    return Container(
      padding: EdgeInsets.all(3.w),
      decoration: BoxDecoration(
        color: AppTheme.lightTheme.primaryColor.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppTheme.lightTheme.primaryColor.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          CustomIconWidget(
            iconName: 'lightbulb',
            color: AppTheme.lightTheme.primaryColor,
            size: 20,
          ),
          SizedBox(width: 2.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Upgrade Recommendation',
                  style: GoogleFonts.inter(
                    fontSize: 12.sp,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.lightTheme.primaryColor,
                  ),
                ),
                SizedBox(height: 0.5.h),
                Text(
                  'Based on your usage, $recommendedTier would unlock more features you need.',
                  style: GoogleFonts.inter(
                    fontSize: 10.sp,
                    fontWeight: FontWeight.w400,
                    color: AppTheme.lightTheme.colorScheme.onSurface,
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
