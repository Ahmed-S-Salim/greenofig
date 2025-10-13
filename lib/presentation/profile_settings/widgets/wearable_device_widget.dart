import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

class WearableDeviceWidget extends StatelessWidget {
  final Map<String, dynamic> device;
  final VoidCallback onTap;

  const WearableDeviceWidget({
    super.key,
    required this.device,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final bool isConnected = device["isConnected"] as bool;
    final String deviceName = device["name"] as String;
    final String deviceType = device["type"] as String;
    final String lastSync = device["lastSync"] as String;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: EdgeInsets.all(3.w),
        margin: EdgeInsets.only(bottom: 1.h),
        decoration: BoxDecoration(
          border: Border.all(
            color: isConnected
                ? AppTheme.lightTheme.primaryColor.withValues(alpha: 0.3)
                : Theme.of(context).dividerColor,
          ),
          borderRadius: BorderRadius.circular(8),
          color: isConnected
              ? AppTheme.lightTheme.primaryColor.withValues(alpha: 0.05)
              : Theme.of(context).colorScheme.surface,
        ),
        child: Row(
          children: [
            Container(
              padding: EdgeInsets.all(2.w),
              decoration: BoxDecoration(
                color: isConnected
                    ? AppTheme.lightTheme.primaryColor
                    : Theme.of(context).colorScheme.onSurfaceVariant,
                borderRadius: BorderRadius.circular(8),
              ),
              child: CustomIconWidget(
                iconName: _getDeviceIcon(deviceType),
                color: Colors.white,
                size: 20,
              ),
            ),
            SizedBox(width: 3.w),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    deviceName,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w500,
                        ),
                  ),
                  SizedBox(height: 0.5.h),
                  Text(
                    isConnected ? "Last sync: $lastSync" : "Not connected",
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: isConnected
                              ? AppTheme.lightTheme.primaryColor
                              : Theme.of(context).colorScheme.onSurfaceVariant,
                        ),
                  ),
                ],
              ),
            ),
            Container(
              padding: EdgeInsets.symmetric(horizontal: 2.w, vertical: 0.5.h),
              decoration: BoxDecoration(
                color: isConnected
                    ? AppTheme.lightTheme.primaryColor
                    : Theme.of(context).colorScheme.onSurfaceVariant,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                isConnected ? "Connected" : "Connect",
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w500,
                    ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getDeviceIcon(String deviceType) {
    switch (deviceType.toLowerCase()) {
      case 'apple watch':
        return 'watch';
      case 'fitbit':
        return 'fitness_center';
      case 'samsung health':
        return 'favorite';
      case 'google fit':
        return 'directions_run';
      default:
        return 'watch';
    }
  }
}
