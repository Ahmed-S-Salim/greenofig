import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

class MessageActionsWidget extends StatelessWidget {
  final Map<String, dynamic> message;
  final VoidCallback onSaveToFavorites;
  final VoidCallback onAddToCalendar;
  final VoidCallback onShareWithTrainer;

  const MessageActionsWidget({
    Key? key,
    required this.message,
    required this.onSaveToFavorites,
    required this.onAddToCalendar,
    required this.onShareWithTrainer,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
      decoration: BoxDecoration(
        color: AppTheme.lightTheme.colorScheme.surface,
        borderRadius: BorderRadius.circular(3.w),
        boxShadow: [
          BoxShadow(
            color: AppTheme.shadowDark,
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildActionItem(
            icon: 'favorite_border',
            title: 'Save to Favorites',
            onTap: onSaveToFavorites,
          ),
          Divider(
            color: AppTheme.lightTheme.dividerColor,
            height: 2.h,
          ),
          _buildActionItem(
            icon: 'calendar_today',
            title: 'Add to Calendar',
            onTap: onAddToCalendar,
          ),
          Divider(
            color: AppTheme.lightTheme.dividerColor,
            height: 2.h,
          ),
          _buildActionItem(
            icon: 'share',
            title: 'Share with Trainer',
            onTap: onShareWithTrainer,
          ),
        ],
      ),
    );
  }

  Widget _buildActionItem({
    required String icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(vertical: 1.h),
        child: Row(
          children: [
            CustomIconWidget(
              iconName: icon,
              color: AppTheme.lightTheme.primaryColor,
              size: 5.w,
            ),
            SizedBox(width: 3.w),
            Text(
              title,
              style: AppTheme.lightTheme.textTheme.bodyMedium?.copyWith(
                color: AppTheme.textPrimaryDark,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}