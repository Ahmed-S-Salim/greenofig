import 'package:flutter/material.dart';
import 'package:flutter_slidable/flutter_slidable.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

class RecentMealsWidget extends StatelessWidget {
  final List<Map<String, dynamic>> recentMeals;

  const RecentMealsWidget({
    Key? key,
    required this.recentMeals,
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
                'Recent Meals',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textPrimaryDark,
                    ),
              ),
              GestureDetector(
                onTap: () => Navigator.pushNamed(context, '/ai-food-scanner'),
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
                        iconName: 'camera_alt',
                        color: AppTheme.onPrimaryDark,
                        size: 3.5.w,
                      ),
                      SizedBox(width: 1.w),
                      Text(
                        'Scan',
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
          recentMeals.isEmpty
              ? _buildEmptyState(context)
              : Column(
                  children: recentMeals.take(4).map((meal) {
                    return Padding(
                      padding: EdgeInsets.only(bottom: 2.h),
                      child: _buildMealItem(context, meal),
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
            iconName: 'restaurant',
            color: AppTheme.lightTheme.primaryColor,
            size: 8.w,
          ),
          SizedBox(height: 1.h),
          Text(
            'Log Your First Meal',
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  color: AppTheme.textPrimaryDark,
                  fontWeight: FontWeight.w600,
                ),
          ),
          SizedBox(height: 0.5.h),
          Text(
            'Start tracking your nutrition today!',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppTheme.textSecondaryDark,
                ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildMealItem(BuildContext context, Map<String, dynamic> meal) {
    return Slidable(
      key: ValueKey(meal['id']),
      endActionPane: ActionPane(
        motion: const ScrollMotion(),
        children: [
          SlidableAction(
            onPressed: (context) => _editMeal(context, meal),
            backgroundColor: AppTheme.lightTheme.primaryColor,
            foregroundColor: AppTheme.onPrimaryDark,
            icon: Icons.edit,
            label: 'Edit',
            borderRadius: BorderRadius.circular(12),
          ),
          SlidableAction(
            onPressed: (context) => _favoriteMeal(context, meal),
            backgroundColor: AppTheme.warningDark,
            foregroundColor: AppTheme.onPrimaryDark,
            icon: Icons.favorite,
            label: 'Favorite',
            borderRadius: BorderRadius.circular(12),
          ),
          SlidableAction(
            onPressed: (context) => _shareMeal(context, meal),
            backgroundColor: AppTheme.successDark,
            foregroundColor: AppTheme.onPrimaryDark,
            icon: Icons.share,
            label: 'Share',
            borderRadius: BorderRadius.circular(12),
          ),
        ],
      ),
      child: Container(
        padding: EdgeInsets.all(3.w),
        decoration: BoxDecoration(
          color: AppTheme.lightTheme.colorScheme.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: AppTheme.dividerDark,
            width: 1,
          ),
        ),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: CustomImageWidget(
                imageUrl: meal['image'] as String,
                width: 15.w,
                height: 15.w,
                fit: BoxFit.cover,
                semanticLabel: meal['semanticLabel'] as String,
              ),
            ),
            SizedBox(width: 3.w),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          meal['name'] as String,
                          style:
                              Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    fontWeight: FontWeight.w600,
                                    color: AppTheme.textPrimaryDark,
                                  ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Container(
                        padding: EdgeInsets.symmetric(
                            horizontal: 2.w, vertical: 0.5.h),
                        decoration: BoxDecoration(
                          color:
                              _getConfidenceColor(meal['aiConfidence'] as int)
                                  .withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          '${meal['aiConfidence']}%',
                          style:
                              Theme.of(context).textTheme.bodySmall?.copyWith(
                                    color: _getConfidenceColor(
                                        meal['aiConfidence'] as int),
                                    fontWeight: FontWeight.w600,
                                  ),
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 0.5.h),
                  Text(
                    '${meal['calories']} cal • ${meal['time']}',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppTheme.textSecondaryDark,
                        ),
                  ),
                  SizedBox(height: 0.5.h),
                  Row(
                    children: [
                      _buildMacroChip(context, 'P', '${meal['protein']}g',
                          AppTheme.lightTheme.primaryColor),
                      SizedBox(width: 1.w),
                      _buildMacroChip(context, 'C', '${meal['carbs']}g',
                          AppTheme.warningDark),
                      SizedBox(width: 1.w),
                      _buildMacroChip(
                          context, 'F', '${meal['fat']}g', AppTheme.errorDark),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMacroChip(
      BuildContext context, String label, String value, Color color) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 1.5.w, vertical: 0.5.h),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        '$label: $value',
        style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: color,
              fontWeight: FontWeight.w500,
              fontSize: 10.sp,
            ),
      ),
    );
  }

  Color _getConfidenceColor(int confidence) {
    if (confidence >= 90) return AppTheme.successDark;
    if (confidence >= 70) return AppTheme.warningDark;
    return AppTheme.errorDark;
  }

  void _editMeal(BuildContext context, Map<String, dynamic> meal) {
    // Navigate to meal editing screen
    Navigator.pushNamed(context, '/meal-planning');
  }

  void _favoriteMeal(BuildContext context, Map<String, dynamic> meal) {
    // Add meal to favorites
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${meal['name']} added to favorites!'),
        backgroundColor: AppTheme.successDark,
      ),
    );
  }

  void _shareMeal(BuildContext context, Map<String, dynamic> meal) {
    // Share meal recipe
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Sharing ${meal['name']} recipe...'),
        backgroundColor: AppTheme.lightTheme.primaryColor,
      ),
    );
  }
}