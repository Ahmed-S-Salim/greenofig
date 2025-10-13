import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

class QuickActionsMenu extends StatelessWidget {
  final VoidCallback onSwapRecipe;
  final VoidCallback onAddToFavorites;
  final VoidCallback onGenerateGroceryList;
  final VoidCallback onViewRecipe;

  const QuickActionsMenu({
    Key? key,
    required this.onSwapRecipe,
    required this.onAddToFavorites,
    required this.onGenerateGroceryList,
    required this.onViewRecipe,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: AppTheme.lightTheme.colorScheme.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        boxShadow: [
          BoxShadow(
            color: AppTheme.lightTheme.shadowColor.withValues(alpha: 0.1),
            blurRadius: 20,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle bar
          Container(
            width: 12.w,
            height: 0.5.h,
            decoration: BoxDecoration(
              color: AppTheme.lightTheme.colorScheme.onSurfaceVariant
                  .withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          SizedBox(height: 3.h),

          // Quick Actions Title
          Text(
            'Quick Actions',
            style: AppTheme.lightTheme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.w600,
              color: AppTheme.lightTheme.colorScheme.onSurface,
            ),
          ),
          SizedBox(height: 3.h),

          // Action Buttons
          Column(
            children: [
              _buildActionButton(
                icon: 'swap_horiz',
                title: 'Swap Recipe',
                subtitle: 'Find a similar alternative',
                onTap: onSwapRecipe,
                color: const Color(0xFF42A5F5),
              ),
              SizedBox(height: 2.h),
              _buildActionButton(
                icon: 'favorite_border',
                title: 'Add to Favorites',
                subtitle: 'Save for quick access',
                onTap: onAddToFavorites,
                color: const Color(0xFFEF5350),
              ),
              SizedBox(height: 2.h),
              _buildActionButton(
                icon: 'shopping_cart',
                title: 'Generate Grocery List',
                subtitle: 'Add ingredients to shopping list',
                onTap: onGenerateGroceryList,
                color: const Color(0xFF66BB6A),
              ),
              SizedBox(height: 2.h),
              _buildActionButton(
                icon: 'restaurant_menu',
                title: 'View Full Recipe',
                subtitle: 'See detailed instructions',
                onTap: onViewRecipe,
                color: const Color(0xFFFFB74D),
              ),
            ],
          ),
          SizedBox(height: 2.h),
        ],
      ),
    );
  }

  Widget _buildActionButton({
    required String icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    required Color color,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: EdgeInsets.all(4.w),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: color.withValues(alpha: 0.2),
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: EdgeInsets.all(3.w),
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(12),
              ),
              child: CustomIconWidget(
                iconName: icon,
                color: Colors.white,
                size: 24,
              ),
            ),
            SizedBox(width: 4.w),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: AppTheme.lightTheme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: AppTheme.lightTheme.colorScheme.onSurface,
                    ),
                  ),
                  SizedBox(height: 0.5.h),
                  Text(
                    subtitle,
                    style: AppTheme.lightTheme.textTheme.bodySmall?.copyWith(
                      color: AppTheme.lightTheme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
            CustomIconWidget(
              iconName: 'chevron_right',
              color: AppTheme.lightTheme.colorScheme.onSurfaceVariant,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }
}
