import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

class DietaryPreferenceWidget extends StatelessWidget {
  final String preference;
  final bool isSelected;
  final VoidCallback onTap;

  const DietaryPreferenceWidget({
    super.key,
    required this.preference,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: EdgeInsets.only(right: 2.w, bottom: 1.h),
        padding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 1.h),
        decoration: BoxDecoration(
          color: isSelected
              ? AppTheme.lightTheme.primaryColor.withValues(alpha: 0.1)
              : Theme.of(context).colorScheme.surface,
          border: Border.all(
            color: isSelected
                ? AppTheme.lightTheme.primaryColor
                : Theme.of(context).dividerColor,
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            CustomIconWidget(
              iconName: _getDietaryIcon(preference),
              color: isSelected
                  ? AppTheme.lightTheme.primaryColor
                  : Theme.of(context).colorScheme.onSurfaceVariant,
              size: 16,
            ),
            SizedBox(width: 2.w),
            Text(
              preference,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: isSelected
                        ? AppTheme.lightTheme.primaryColor
                        : Theme.of(context).colorScheme.onSurface,
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                  ),
            ),
          ],
        ),
      ),
    );
  }

  String _getDietaryIcon(String preference) {
    switch (preference.toLowerCase()) {
      case 'vegan':
        return 'eco';
      case 'vegetarian':
        return 'local_florist';
      case 'keto':
        return 'fitness_center';
      case 'paleo':
        return 'nature_people';
      case 'mediterranean':
        return 'restaurant';
      case 'halal':
        return 'mosque';
      case 'kosher':
        return 'star_of_david';
      case 'gluten-free':
        return 'no_food';
      case 'dairy-free':
        return 'block';
      case 'low-carb':
        return 'trending_down';
      default:
        return 'restaurant_menu';
    }
  }
}
