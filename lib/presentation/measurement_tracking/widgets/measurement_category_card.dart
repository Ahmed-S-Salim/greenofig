import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

class MeasurementCategoryCard extends StatelessWidget {
  final Map<String, dynamic> category;
  final bool isMetricUnits;
  final VoidCallback onTap;

  const MeasurementCategoryCard({
    Key? key,
    required this.category,
    required this.isMetricUnits,
    required this.onTap,
  }) : super(key: key);

  String get displayValue {
    final value = double.tryParse(category['currentValue']) ?? 0.0;
    final unit = isMetricUnits ? category['unit'] : category['unitImperial'];

    if (category['id'] == 'weight' && !isMetricUnits) {
      return '${(value * 2.20462).toStringAsFixed(1)} $unit';
    } else if ((category['id'] == 'muscle_mass') && !isMetricUnits) {
      return '${(value * 2.20462).toStringAsFixed(1)} $unit';
    }

    return '${category['currentValue']} $unit';
  }

  String get trendDisplay {
    final trend = category['trend'];
    final trendValue = category['trendValue'];

    if (trend == 'stable') return '±${trendValue}';

    final sign = trend == 'up' ? '+' : '-';
    return '$sign${trendValue}';
  }

  Color get trendColor {
    final trend = category['trend'];
    switch (trend) {
      case 'up':
        return category['id'] == 'weight' || category['id'] == 'body_fat'
            ? Colors.red
            : Colors.green;
      case 'down':
        return category['id'] == 'weight' || category['id'] == 'body_fat'
            ? Colors.green
            : Colors.red;
      default:
        return Colors.orange;
    }
  }

  IconData get trendIcon {
    final trend = category['trend'];
    switch (trend) {
      case 'up':
        return Icons.trending_up;
      case 'down':
        return Icons.trending_down;
      default:
        return Icons.trending_flat;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              category['color'].withAlpha((0.1 * 255).round()),
              category['color'].withAlpha((0.05 * 255).round()),
            ],
          ),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: category['color'].withAlpha((0.3 * 255).round()),
            width: 1,
          ),
        ),
        child: Padding(
          padding: EdgeInsets.all(4.w),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header with icon and trend
              Row(
                children: [
                  Container(
                    width: 10.w,
                    height: 10.w,
                    decoration: BoxDecoration(
                      color: category['color'].withAlpha((0.2 * 255).round()),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Center(
                      child: CustomIconWidget(
                        iconName: category['icon'],
                        size: 5.w,
                        color: category['color'],
                      ),
                    ),
                  ),
                  const Spacer(),
                  Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: 2.w,
                      vertical: 0.5.h,
                    ),
                    decoration: BoxDecoration(
                      color: trendColor.withAlpha((0.1 * 255).round()),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          trendIcon,
                          size: 3.w,
                          color: trendColor,
                        ),
                        SizedBox(width: 1.w),
                        Text(
                          trendDisplay,
                          style: GoogleFonts.inter(
                            fontSize: 10.sp,
                            fontWeight: FontWeight.w600,
                            color: trendColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              SizedBox(height: 3.h),

              // Category name
              Text(
                category['name'],
                style: GoogleFonts.inter(
                  fontSize: 14.sp,
                  fontWeight: FontWeight.w600,
                  color: theme.colorScheme.onSurface,
                ),
              ),

              SizedBox(height: 1.h),

              // Current value
              Text(
                displayValue,
                style: GoogleFonts.inter(
                  fontSize: 20.sp,
                  fontWeight: FontWeight.w700,
                  color: category['color'],
                  height: 1.0,
                ),
              ),

              SizedBox(height: 1.h),

              // Target progress
              if (category['targetValue'] != null)
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Target: ${category['targetValue']} ${isMetricUnits ? category['unit'] : category['unitImperial']}',
                      style: GoogleFonts.inter(
                        fontSize: 11.sp,
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                    SizedBox(height: 1.h),
                    _buildProgressBar(theme),
                  ],
                ),

              const Spacer(),

              // Log new button
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: onTap,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: category['color'],
                    side: BorderSide(color: category['color'], width: 1.5),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    padding: EdgeInsets.symmetric(vertical: 1.h),
                  ),
                  child: Text(
                    'Log New',
                    style: GoogleFonts.inter(
                      fontSize: 12.sp,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProgressBar(ThemeData theme) {
    final currentValue = double.tryParse(category['currentValue']) ?? 0.0;
    final targetValue = double.tryParse(category['targetValue']) ?? 0.0;

    if (targetValue == 0) return const SizedBox.shrink();

    double progress = currentValue / targetValue;
    if (category['id'] == 'weight' || category['id'] == 'body_fat') {
      // For weight and body fat, being under target is good
      progress = 1.0 - (currentValue - targetValue).abs() / targetValue;
    }

    progress = progress.clamp(0.0, 1.0);

    return Container(
      height: 0.8.h,
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(4),
      ),
      child: FractionallySizedBox(
        alignment: Alignment.centerLeft,
        widthFactor: progress,
        child: Container(
          decoration: BoxDecoration(
            color: category['color'],
            borderRadius: BorderRadius.circular(4),
          ),
        ),
      ),
    );
  }
}
