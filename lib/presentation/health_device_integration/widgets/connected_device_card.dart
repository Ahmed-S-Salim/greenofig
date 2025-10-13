import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';
import '../../../models/health_device.dart' as health_model;

class ConnectedDeviceCard extends StatelessWidget {
  final health_model.HealthDevice device;
  final VoidCallback onDisconnect;
  final VoidCallback onViewHistory;
  final VoidCallback onSettings;

  const ConnectedDeviceCard({
    Key? key,
    required this.device,
    required this.onDisconnect,
    required this.onViewHistory,
    required this.onSettings,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isConnected = device.connectionStatus == health_model.ConnectionStatus.connected;
    final isSyncing = device.connectionStatus == health_model.ConnectionStatus.syncing;

    return Container(
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isConnected
              ? theme.colorScheme.primary.withAlpha(77)
              : theme.colorScheme.outline.withAlpha(77),
        ),
        boxShadow: [
          BoxShadow(
            color: theme.shadowColor.withAlpha(25),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: EdgeInsets.all(4.w),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Row
            Row(
              children: [
                // Device Icon
                Container(
                  width: 12.w,
                  height: 12.w,
                  decoration: BoxDecoration(
                    color: isConnected
                        ? theme.colorScheme.primary.withAlpha(51)
                        : theme.colorScheme.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    _getDeviceIcon(device.deviceType),
                    color: isConnected
                        ? theme.colorScheme.primary
                        : theme.colorScheme.onSurfaceVariant,
                    size: 6.w,
                  ),
                ),

                SizedBox(width: 4.w),

                // Device Info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        device.deviceName,
                        style: GoogleFonts.inter(
                          fontSize: 16.sp,
                          fontWeight: FontWeight.w600,
                          color: theme.colorScheme.onSurface,
                        ),
                      ),
                      SizedBox(height: 0.5.h),
                      Text(
                        '${device.manufacturer ?? 'Unknown'} ${device.model ?? ''}',
                        style: GoogleFonts.inter(
                          fontSize: 12.sp,
                          fontWeight: FontWeight.w400,
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),

                // Status Indicator
                Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: 2.w,
                    vertical: 0.5.h,
                  ),
                  decoration: BoxDecoration(
                    color: _getStatusColor(device.connectionStatus, theme)
                        .withAlpha(51),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: BoxDecoration(
                          color:
                              _getStatusColor(device.connectionStatus, theme),
                          shape: BoxShape.circle,
                        ),
                      ),
                      SizedBox(width: 1.w),
                      Text(
                        _getStatusText(device.connectionStatus),
                        style: GoogleFonts.inter(
                          fontSize: 10.sp,
                          fontWeight: FontWeight.w500,
                          color:
                              _getStatusColor(device.connectionStatus, theme),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            SizedBox(height: 2.h),

            // Device Details
            Row(
              children: [
                // Battery Level
                if (device.batteryLevel != null) ...[
                  Expanded(
                    child: _buildDetailItem(
                      context,
                      'Battery',
                      '${device.batteryLevel}%',
                      Icons.battery_full,
                    ),
                  ),
                ],

                // Last Sync
                if (device.lastSyncAt != null) ...[
                  Expanded(
                    child: _buildDetailItem(
                      context,
                      'Last Sync',
                      _formatLastSync(device.lastSyncAt!),
                      Icons.sync,
                    ),
                  ),
                ],

                // Primary Device
                if (device.isPrimary) ...[
                  Expanded(
                    child: _buildDetailItem(
                      context,
                      'Primary',
                      'Yes',
                      Icons.star,
                    ),
                  ),
                ],
              ],
            ),

            SizedBox(height: 2.h),

            // Action Buttons
            Row(
              children: [
                // View History Button
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: onViewHistory,
                    icon: Icon(
                      Icons.history,
                      size: 16,
                    ),
                    label: Text(
                      'History',
                      style: GoogleFonts.inter(
                        fontSize: 12.sp,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    style: OutlinedButton.styleFrom(
                      padding: EdgeInsets.symmetric(vertical: 1.h),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                  ),
                ),

                SizedBox(width: 2.w),

                // Settings Button
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: onSettings,
                    icon: Icon(
                      Icons.settings,
                      size: 16,
                    ),
                    label: Text(
                      'Settings',
                      style: GoogleFonts.inter(
                        fontSize: 12.sp,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    style: OutlinedButton.styleFrom(
                      padding: EdgeInsets.symmetric(vertical: 1.h),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                  ),
                ),

                SizedBox(width: 2.w),

                // Disconnect Button
                IconButton(
                  onPressed: onDisconnect,
                  icon: Icon(
                    Icons.link_off,
                    color: theme.colorScheme.error,
                    size: 20,
                  ),
                  style: IconButton.styleFrom(
                    backgroundColor: theme.colorScheme.error.withAlpha(25),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
              ],
            ),

            // Sync Status for syncing devices
            if (isSyncing) ...[
              SizedBox(height: 2.h),
              LinearProgressIndicator(
                backgroundColor: theme.colorScheme.surfaceContainerHighest,
                valueColor:
                    AlwaysStoppedAnimation<Color>(theme.colorScheme.primary),
              ),
              SizedBox(height: 1.h),
              Text(
                'Syncing health data...',
                style: GoogleFonts.inter(
                  fontSize: 11.sp,
                  fontWeight: FontWeight.w400,
                  color: theme.colorScheme.onSurfaceVariant,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildDetailItem(
    BuildContext context,
    String label,
    String value,
    IconData icon,
  ) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(
              icon,
              size: 12,
              color: theme.colorScheme.onSurfaceVariant,
            ),
            SizedBox(width: 1.w),
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 10.sp,
                fontWeight: FontWeight.w400,
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
        SizedBox(height: 0.5.h),
        Text(
          value,
          style: GoogleFonts.inter(
            fontSize: 12.sp,
            fontWeight: FontWeight.w600,
            color: theme.colorScheme.onSurface,
          ),
        ),
      ],
    );
  }

  IconData _getDeviceIcon(health_model.DeviceType deviceType) {
    switch (deviceType) {
      case health_model.DeviceType.bloodPressure:
        return Icons.monitor_heart;
      case health_model.DeviceType.o2Sensor:
        return Icons.air;
      case health_model.DeviceType.heartRate:
        return Icons.favorite;
      case health_model.DeviceType.smartScale:
        return Icons.monitor_weight;
    }
  }

  Color _getStatusColor(health_model.ConnectionStatus status, ThemeData theme) {
    switch (status) {
      case health_model.ConnectionStatus.connected:
        return Colors.green;
      case health_model.ConnectionStatus.syncing:
        return theme.colorScheme.primary;
      case health_model.ConnectionStatus.disconnected:
        return theme.colorScheme.onSurfaceVariant;
      case health_model.ConnectionStatus.error:
        return theme.colorScheme.error;
    }
  }

  String _getStatusText(health_model.ConnectionStatus status) {
    switch (status) {
      case health_model.ConnectionStatus.connected:
        return 'Connected';
      case health_model.ConnectionStatus.syncing:
        return 'Syncing';
      case health_model.ConnectionStatus.disconnected:
        return 'Disconnected';
      case health_model.ConnectionStatus.error:
        return 'Error';
    }
  }

  String _formatLastSync(DateTime lastSync) {
    final now = DateTime.now();
    final difference = now.difference(lastSync);

    if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else {
      return '${difference.inDays}d ago';
    }
  }
}