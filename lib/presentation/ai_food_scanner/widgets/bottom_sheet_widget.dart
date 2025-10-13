import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

class BottomSheetWidget extends StatelessWidget {
  final List<Map<String, dynamic>> recentScans;
  final VoidCallback onTipsPressed;
  final Function(Map<String, dynamic>) onRecentScanTap;

  const BottomSheetWidget({
    Key? key,
    required this.recentScans,
    required this.onTipsPressed,
    required this.onRecentScanTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.25,
      minChildSize: 0.15,
      maxChildSize: 0.6,
      builder: (context, scrollController) {
        return Container(
          decoration: BoxDecoration(
            color: AppTheme.lightTheme.colorScheme.surface,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(20),
              topRight: Radius.circular(20),
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.1),
                blurRadius: 10,
                offset: Offset(0, -2),
              ),
            ],
          ),
          child: Column(
            children: [
              // Drag Handle
              Container(
                margin: EdgeInsets.only(top: 1.h),
                width: 12.w,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),

              // Content
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
                  children: [
                    // Tips Section
                    _buildTipsSection(),

                    SizedBox(height: 3.h),

                    // Recent Scans Section
                    if (recentScans.isNotEmpty) _buildRecentScansSection(),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildTipsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Scanning Tips',
              style: AppTheme.lightTheme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            TextButton(
              onPressed: onTipsPressed,
              child: Text('View All'),
            ),
          ],
        ),
        SizedBox(height: 1.h),
        _buildTipItem(
          icon: 'lightbulb',
          text: 'Ensure good lighting for better recognition',
        ),
        _buildTipItem(
          icon: 'center_focus_strong',
          text: 'Keep food centered in the viewfinder',
        ),
        _buildTipItem(
          icon: 'straighten',
          text: 'Hold device steady for 2-3 seconds',
        ),
      ],
    );
  }

  Widget _buildTipItem({required String icon, required String text}) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 0.5.h),
      child: Row(
        children: [
          CustomIconWidget(
            iconName: icon,
            color: AppTheme.lightTheme.primaryColor,
            size: 16,
          ),
          SizedBox(width: 3.w),
          Expanded(
            child: Text(
              text,
              style: AppTheme.lightTheme.textTheme.bodySmall,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecentScansSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Recent Scans',
          style: AppTheme.lightTheme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        SizedBox(height: 1.h),
        Container(
          height: 12.h,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: recentScans.length > 5 ? 5 : recentScans.length,
            separatorBuilder: (context, index) => SizedBox(width: 3.w),
            itemBuilder: (context, index) {
              final scan = recentScans[index];
              return _buildRecentScanItem(scan);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildRecentScanItem(Map<String, dynamic> scan) {
    return GestureDetector(
      onTap: () => onRecentScanTap(scan),
      child: Container(
        width: 20.w,
        decoration: BoxDecoration(
          color: AppTheme.lightTheme.colorScheme.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: AppTheme.lightTheme.dividerColor,
            width: 1,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CustomImageWidget(
              imageUrl: scan['image'] as String,
              width: 12.w,
              height: 6.h,
              fit: BoxFit.cover,
              semanticLabel: scan['semanticLabel'] as String,
            ),
            SizedBox(height: 0.5.h),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 1.w),
              child: Text(
                scan['name'] as String,
                style: AppTheme.lightTheme.textTheme.bodySmall?.copyWith(
                  fontSize: 10.sp,
                ),
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
