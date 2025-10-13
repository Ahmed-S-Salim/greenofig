import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

class CalorieProgressWidget extends StatelessWidget {
  final int consumedCalories;
  final int targetCalories;
  final int burnedCalories;

  const CalorieProgressWidget({
    Key? key,
    required this.consumedCalories,
    required this.targetCalories,
    required this.burnedCalories,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final double progressPercentage =
        (consumedCalories / targetCalories).clamp(0.0, 1.0);
    final int remainingCalories =
        (targetCalories - consumedCalories).clamp(0, targetCalories);

    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: AppTheme.lightTheme.colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppTheme.shadowDark,
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Today\'s Calories',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textPrimaryDark,
                    ),
              ),
              GestureDetector(
                onTap: () => Navigator.pushNamed(context, '/meal-planning'),
                child: CustomIconWidget(
                  iconName: 'more_horiz',
                  color: AppTheme.textSecondaryDark,
                  size: 5.w,
                ),
              ),
            ],
          ),
          SizedBox(height: 3.h),
          Row(
            children: [
              Expanded(
                flex: 2,
                child: SizedBox(
                  height: 30.w,
                  child: Semantics(
                    label:
                        "Calorie Progress Chart showing $consumedCalories out of $targetCalories calories consumed",
                    child: PieChart(
                      PieChartData(
                        sectionsSpace: 2,
                        centerSpaceRadius: 12.w,
                        sections: [
                          PieChartSectionData(
                            color: AppTheme.lightTheme.primaryColor,
                            value: progressPercentage * 100,
                            title: '',
                            radius: 4.w,
                          ),
                          PieChartSectionData(
                            color: AppTheme.lightTheme.primaryColor
                                .withValues(alpha: 0.2),
                            value: (1 - progressPercentage) * 100,
                            title: '',
                            radius: 4.w,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              SizedBox(width: 4.w),
              Expanded(
                flex: 3,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildCalorieRow(
                      context,
                      'Consumed',
                      consumedCalories.toString(),
                      AppTheme.lightTheme.primaryColor,
                    ),
                    SizedBox(height: 1.h),
                    _buildCalorieRow(
                      context,
                      'Burned',
                      burnedCalories.toString(),
                      AppTheme.warningDark,
                    ),
                    SizedBox(height: 1.h),
                    _buildCalorieRow(
                      context,
                      'Remaining',
                      remainingCalories.toString(),
                      AppTheme.textSecondaryDark,
                    ),
                    SizedBox(height: 2.h),
                    Container(
                      width: double.infinity,
                      padding:
                          EdgeInsets.symmetric(vertical: 1.h, horizontal: 3.w),
                      decoration: BoxDecoration(
                        color: AppTheme.lightTheme.primaryColor
                            .withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '${(progressPercentage * 100).toInt()}% of daily goal',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppTheme.lightTheme.primaryColor,
                              fontWeight: FontWeight.w600,
                            ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCalorieRow(
      BuildContext context, String label, String value, Color color) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Container(
              width: 3.w,
              height: 3.w,
              decoration: BoxDecoration(
                color: color,
                shape: BoxShape.circle,
              ),
            ),
            SizedBox(width: 2.w),
            Text(
              label,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppTheme.textSecondaryDark,
                  ),
            ),
          ],
        ),
        Text(
          value,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppTheme.textPrimaryDark,
                fontWeight: FontWeight.w600,
              ),
        ),
      ],
    );
  }
}