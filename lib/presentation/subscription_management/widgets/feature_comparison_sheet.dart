import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

class FeatureComparisonSheet extends StatelessWidget {
  final List<Map<String, dynamic>> subscriptionTiers;

  const FeatureComparisonSheet({
    Key? key,
    required this.subscriptionTiers,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 80.h,
      decoration: BoxDecoration(
        color: AppTheme.lightTheme.colorScheme.surface,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
      ),
      child: Column(
        children: [
          _buildHeader(context),
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.all(4.w),
              child: _buildComparisonTable(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color: AppTheme.lightTheme.colorScheme.outline,
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              'Compare All Features',
              style: GoogleFonts.inter(
                fontSize: 18.sp,
                fontWeight: FontWeight.w700,
                color: AppTheme.lightTheme.colorScheme.onSurface,
              ),
            ),
          ),
          GestureDetector(
            onTap: () => Navigator.pop(context),
            child: CustomIconWidget(
              iconName: 'close',
              color: AppTheme.lightTheme.colorScheme.onSurface,
              size: 24,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildComparisonTable() {
    final allFeatures = _getAllUniqueFeatures();

    return Column(
      children: [
        _buildTableHeader(),
        SizedBox(height: 2.h),
        ...allFeatures.map((feature) => _buildFeatureRow(feature)),
      ],
    );
  }

  Widget _buildTableHeader() {
    return Row(
      children: [
        Expanded(
          flex: 2,
          child: Text(
            'Features',
            style: GoogleFonts.inter(
              fontSize: 14.sp,
              fontWeight: FontWeight.w600,
              color: AppTheme.lightTheme.colorScheme.onSurface,
            ),
          ),
        ),
        ...subscriptionTiers.map((tier) => Expanded(
              child: Text(
                tier['name'] as String,
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(
                  fontSize: 12.sp,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.lightTheme.colorScheme.onSurface,
                ),
              ),
            )),
      ],
    );
  }

  Widget _buildFeatureRow(String feature) {
    return Container(
      margin: EdgeInsets.only(bottom: 1.h),
      padding: EdgeInsets.symmetric(vertical: 1.h),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color:
                AppTheme.lightTheme.colorScheme.outline.withValues(alpha: 0.3),
            width: 0.5,
          ),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            flex: 2,
            child: Text(
              feature,
              style: GoogleFonts.inter(
                fontSize: 12.sp,
                fontWeight: FontWeight.w400,
                color: AppTheme.lightTheme.colorScheme.onSurface,
              ),
            ),
          ),
          ...subscriptionTiers.map((tier) => Expanded(
                child: Center(
                  child: _hasFeature(tier, feature)
                      ? CustomIconWidget(
                          iconName: 'check_circle',
                          color: AppTheme.lightTheme.colorScheme.secondary,
                          size: 20,
                        )
                      : CustomIconWidget(
                          iconName: 'cancel',
                          color:
                              AppTheme.lightTheme.colorScheme.onSurfaceVariant,
                          size: 20,
                        ),
                ),
              )),
        ],
      ),
    );
  }

  List<String> _getAllUniqueFeatures() {
    final Set<String> allFeatures = {};
    for (final tier in subscriptionTiers) {
      final features = tier['features'] as List<String>;
      allFeatures.addAll(features);
    }
    return allFeatures.toList()..sort();
  }

  bool _hasFeature(Map<String, dynamic> tier, String feature) {
    final features = tier['features'] as List<String>;
    return features.contains(feature);
  }
}
