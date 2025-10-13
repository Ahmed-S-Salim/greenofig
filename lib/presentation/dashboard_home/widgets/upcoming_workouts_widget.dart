import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

class UpcomingWorkoutsWidget extends StatelessWidget {
  final List<Map<String, dynamic>> upcomingWorkouts;

  const UpcomingWorkoutsWidget({
    Key? key,
    required this.upcomingWorkouts,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
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
                'Upcoming Workouts',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textPrimaryDark,
                    ),
              ),
              GestureDetector(
                onTap: () => Navigator.pushNamed(context, '/workout-programs'),
                child: Container(
                  padding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 1.h),
                  decoration: BoxDecoration(
                    color: AppTheme.lightTheme.primaryColor,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      CustomIconWidget(
                        iconName: 'fitness_center',
                        color: AppTheme.onPrimaryDark,
                        size: 3.5.w,
                      ),
                      SizedBox(width: 1.w),
                      Text(
                        'View All',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppTheme.onPrimaryDark,
                              fontWeight: FontWeight.w600,
                            ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 2.h),
          upcomingWorkouts.isEmpty
              ? _buildEmptyState(context)
              : Column(
                  children: upcomingWorkouts.take(3).map((workout) {
                    return Padding(
                      padding: EdgeInsets.only(bottom: 2.h),
                      child: _buildWorkoutItem(context, workout),
                    );
                  }).toList(),
                ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: AppTheme.lightTheme.primaryColor.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppTheme.lightTheme.primaryColor.withValues(alpha: 0.2),
          width: 1,
        ),
      ),
      child: Column(
        children: [
          CustomIconWidget(
            iconName: 'fitness_center',
            color: AppTheme.lightTheme.primaryColor,
            size: 8.w,
          ),
          SizedBox(height: 1.h),
          Text(
            'Start Today\'s Workout',
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  color: AppTheme.textPrimaryDark,
                  fontWeight: FontWeight.w600,
                ),
          ),
          SizedBox(height: 0.5.h),
          Text(
            'Schedule your first workout to get started!',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppTheme.textSecondaryDark,
                ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildWorkoutItem(BuildContext context, Map<String, dynamic> workout) {
    return GestureDetector(
      onTap: () => _startWorkout(context, workout),
      child: Container(
        padding: EdgeInsets.all(3.w),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppTheme.lightTheme.primaryColor.withValues(alpha: 0.1),
              AppTheme.lightTheme.colorScheme.secondary.withValues(alpha: 0.05),
            ],
          ),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: AppTheme.lightTheme.primaryColor.withValues(alpha: 0.2),
            width: 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: EdgeInsets.all(2.5.w),
                  decoration: BoxDecoration(
                    color: AppTheme.lightTheme.primaryColor,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: CustomIconWidget(
                    iconName: workout['icon'] as String,
                    color: AppTheme.onPrimaryDark,
                    size: 5.w,
                  ),
                ),
                SizedBox(width: 3.w),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        workout['name'] as String,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              fontWeight: FontWeight.w600,
                              color: AppTheme.textPrimaryDark,
                            ),
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        workout['type'] as String,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppTheme.textSecondaryDark,
                            ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding:
                      EdgeInsets.symmetric(horizontal: 2.w, vertical: 0.5.h),
                  decoration: BoxDecoration(
                    color:
                        AppTheme.lightTheme.primaryColor.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    workout['scheduledTime'] as String,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppTheme.lightTheme.primaryColor,
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                ),
              ],
            ),
            SizedBox(height: 2.h),
            Row(
              children: [
                _buildWorkoutDetail(context, 'Duration',
                    workout['duration'] as String, Icons.access_time),
                SizedBox(width: 4.w),
                _buildWorkoutDetail(context, 'Difficulty',
                    workout['difficulty'] as String, Icons.trending_up),
                SizedBox(width: 4.w),
                _buildWorkoutDetail(
                    context,
                    'Calories',
                    '${workout['estimatedCalories']}',
                    Icons.local_fire_department),
              ],
            ),
            SizedBox(height: 2.h),
            Container(
              width: double.infinity,
              padding: EdgeInsets.symmetric(vertical: 1.5.h),
              decoration: BoxDecoration(
                color: AppTheme.lightTheme.primaryColor,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CustomIconWidget(
                    iconName: 'play_arrow',
                    color: AppTheme.onPrimaryDark,
                    size: 4.w,
                  ),
                  SizedBox(width: 2.w),
                  Text(
                    'Start Workout',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppTheme.onPrimaryDark,
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWorkoutDetail(
      BuildContext context, String label, String value, IconData icon) {
    return Expanded(
      child: Row(
        children: [
          CustomIconWidget(
            iconName: icon.toString().split('.').last,
            color: AppTheme.textSecondaryDark,
            size: 3.5.w,
          ),
          SizedBox(width: 1.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  value,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppTheme.textPrimaryDark,
                        fontWeight: FontWeight.w600,
                      ),
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  label,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: AppTheme.textSecondaryDark,
                        fontSize: 9.sp,
                      ),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _startWorkout(BuildContext context, Map<String, dynamic> workout) {
    Navigator.pushNamed(context, '/workout-programs');
  }
}