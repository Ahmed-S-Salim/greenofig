import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';
import '../health_device_integration/widgets/device_category_card.dart';
import '../health_device_integration/widgets/connected_device_card.dart';
import '../health_device_integration/widgets/device_pairing_modal.dart';
import '../../services/health_device_service.dart';
import '../../models/health_device.dart' as health_models;
import '../../core/app_export.dart';

class HealthDeviceIntegration extends StatefulWidget {
  const HealthDeviceIntegration({Key? key}) : super(key: key);

  @override
  State<HealthDeviceIntegration> createState() =>
      _HealthDeviceIntegrationState();
}

class _HealthDeviceIntegrationState extends State<HealthDeviceIntegration> {
  List<health_models.HealthDevice> _connectedDevices = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadConnectedDevices();
  }

  Future<void> _loadConnectedDevices() async {
    try {
      final devices = await HealthDeviceService.getUserDevices();
      setState(() {
        _connectedDevices = devices;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load devices: ${e.toString()}'),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      }
    }
  }

  Future<void> _showAddDeviceModal(health_models.DeviceType deviceType) async {
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DevicePairingModal(
        deviceType: deviceType,
        onDevicePaired: () {
          _loadConnectedDevices();
        },
      ),
    );
  }

  Future<void> _disconnectDevice(String deviceId) async {
    try {
      await HealthDeviceService.disconnectDevice(deviceId);
      await _loadConnectedDevices();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Device disconnected successfully'),
            backgroundColor: Theme.of(context).colorScheme.primary,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to disconnect device: ${e.toString()}'),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        title: Text(
          'Health Devices',
          style: GoogleFonts.inter(
            fontSize: 20.sp,
            fontWeight: FontWeight.w600,
            color: theme.colorScheme.onSurface,
          ),
        ),
        backgroundColor: theme.scaffoldBackgroundColor,
        elevation: 0,
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back,
            color: theme.colorScheme.onSurface,
          ),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: Icon(
              Icons.help_outline,
              color: theme.colorScheme.primary,
            ),
            onPressed: _showHelpDialog,
          ),
        ],
      ),
      body: _isLoading
          ? Center(
              child: CircularProgressIndicator(
                color: theme.colorScheme.primary,
              ),
            )
          : RefreshIndicator(
              onRefresh: _loadConnectedDevices,
              color: theme.colorScheme.primary,
              child: SingleChildScrollView(
                physics: AlwaysScrollableScrollPhysics(),
                padding: EdgeInsets.all(4.w),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Header Section
                    Text(
                      'Connect Your Health Devices',
                      style: GoogleFonts.inter(
                        fontSize: 24.sp,
                        fontWeight: FontWeight.w700,
                        color: theme.colorScheme.onSurface,
                      ),
                    ),
                    SizedBox(height: 1.h),
                    Text(
                      'Sync your health data automatically from compatible devices for comprehensive tracking.',
                      style: GoogleFonts.inter(
                        fontSize: 14.sp,
                        fontWeight: FontWeight.w400,
                        color: theme.colorScheme.onSurfaceVariant,
                        height: 1.4,
                      ),
                    ),

                    SizedBox(height: 4.h),

                    // Device Categories
                    Text(
                      'Device Categories',
                      style: GoogleFonts.inter(
                        fontSize: 18.sp,
                        fontWeight: FontWeight.w600,
                        color: theme.colorScheme.onSurface,
                      ),
                    ),
                    SizedBox(height: 2.h),

                    // O2 Sensors
                    DeviceCategoryCard(
                      title: 'O2 Sensors',
                      description:
                          'Pulse oximeters for blood oxygen monitoring',
                      icon: Icons.air,
                      deviceCount: _getDeviceCount(health_models.DeviceType.o2Sensor),
                      onAddDevice: () =>
                          _showAddDeviceModal(health_models.DeviceType.o2Sensor),
                    ),
                    SizedBox(height: 2.h),

                    // Blood Pressure Monitors
                    DeviceCategoryCard(
                      title: 'Blood Pressure Monitors',
                      description: 'Digital BP cuffs for pressure tracking',
                      icon: Icons.monitor_heart,
                      deviceCount: _getDeviceCount(health_models.DeviceType.bloodPressure),
                      onAddDevice: () =>
                          _showAddDeviceModal(health_models.DeviceType.bloodPressure),
                    ),
                    SizedBox(height: 2.h),

                    // Heart Rate Devices
                    DeviceCategoryCard(
                      title: 'Heart Rate Devices',
                      description:
                          'Chest straps and wearables for HR monitoring',
                      icon: Icons.favorite,
                      deviceCount: _getDeviceCount(health_models.DeviceType.heartRate),
                      onAddDevice: () =>
                          _showAddDeviceModal(health_models.DeviceType.heartRate),
                    ),
                    SizedBox(height: 2.h),

                    // Smart Scales
                    DeviceCategoryCard(
                      title: 'Smart Scales',
                      description: 'Body composition and weight tracking',
                      icon: Icons.monitor_weight,
                      deviceCount: _getDeviceCount(health_models.DeviceType.smartScale),
                      onAddDevice: () =>
                          _showAddDeviceModal(health_models.DeviceType.smartScale),
                    ),

                    SizedBox(height: 4.h),

                    // Connected Devices Section
                    if (_connectedDevices.isNotEmpty) ...[
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Connected Devices',
                            style: GoogleFonts.inter(
                              fontSize: 18.sp,
                              fontWeight: FontWeight.w600,
                              color: theme.colorScheme.onSurface,
                            ),
                          ),
                          Text(
                            '${_connectedDevices.length} device${_connectedDevices.length == 1 ? '' : 's'}',
                            style: GoogleFonts.inter(
                              fontSize: 12.sp,
                              fontWeight: FontWeight.w500,
                              color: theme.colorScheme.primary,
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: 2.h),

                      // Connected Device Cards
                      ListView.separated(
                        shrinkWrap: true,
                        physics: NeverScrollableScrollPhysics(),
                        itemCount: _connectedDevices.length,
                        separatorBuilder: (context, index) =>
                            SizedBox(height: 2.h),
                        itemBuilder: (context, index) {
                          final device = _connectedDevices[index];
                          return ConnectedDeviceCard(
                            device: device,
                            onDisconnect: () => _disconnectDevice(device.id),
                            onViewHistory: () => _navigateToDeviceHistory(device),
                            onSettings: () => _navigateToDeviceSettings(device),
                          );
                        },
                      ),
                    ] else ...[
                      // No Devices Message
                      Container(
                        width: double.infinity,
                        padding: EdgeInsets.all(6.w),
                        decoration: BoxDecoration(
                          color: theme.colorScheme.surface,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: theme.colorScheme.outline.withAlpha(77),
                          ),
                        ),
                        child: Column(
                          children: [
                            Icon(
                              Icons.devices_other,
                              size: 16.w,
                              color: theme.colorScheme.onSurfaceVariant,
                            ),
                            SizedBox(height: 2.h),
                            Text(
                              'No Devices Connected',
                              style: GoogleFonts.inter(
                                fontSize: 16.sp,
                                fontWeight: FontWeight.w600,
                                color: theme.colorScheme.onSurface,
                              ),
                            ),
                            SizedBox(height: 1.h),
                            Text(
                              'Start connecting your health devices to automatically sync your vitals and track your wellness journey.',
                              style: GoogleFonts.inter(
                                fontSize: 13.sp,
                                fontWeight: FontWeight.w400,
                                color: theme.colorScheme.onSurfaceVariant,
                                height: 1.4,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                    ],

                    SizedBox(height: 4.h),

                    // Troubleshooting Section
                    Container(
                      padding: EdgeInsets.all(4.w),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.surface,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: theme.colorScheme.outline.withAlpha(77),
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(
                                Icons.help_center,
                                color: theme.colorScheme.primary,
                                size: 20,
                              ),
                              SizedBox(width: 2.w),
                              Text(
                                'Need Help?',
                                style: GoogleFonts.inter(
                                  fontSize: 14.sp,
                                  fontWeight: FontWeight.w600,
                                  color: theme.colorScheme.onSurface,
                                ),
                              ),
                            ],
                          ),
                          SizedBox(height: 1.h),
                          Text(
                            '• Ensure Bluetooth is enabled on your device\n'
                            '• Keep devices within 3 feet during pairing\n'
                            '• Check device compatibility list\n'
                            '• Restart the app if connection fails',
                            style: GoogleFonts.inter(
                              fontSize: 12.sp,
                              fontWeight: FontWeight.w400,
                              color: theme.colorScheme.onSurfaceVariant,
                              height: 1.5,
                            ),
                          ),
                        ],
                      ),
                    ),

                    SizedBox(height: 6.h),
                  ],
                ),
              ),
            ),
    );
  }

  int _getDeviceCount(health_models.DeviceType deviceType) {
    return _connectedDevices
        .where((device) => device.deviceType == deviceType)
        .length;
  }

  void _showHelpDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(Icons.help_outline, color: Theme.of(context).colorScheme.primary),
            SizedBox(width: 2.w),
            Text('Device Integration Help'),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'How to Connect Devices',
                style: GoogleFonts.inter(
                  fontSize: 16.sp,
                  fontWeight: FontWeight.w600,
                ),
              ),
              SizedBox(height: 1.h),
              Text(
                '1. Tap on a device category card\n'
                '2. Enable Bluetooth on your phone\n'
                '3. Turn on your health device\n'
                '4. Follow the pairing instructions\n'
                '5. Grant necessary permissions',
                style: GoogleFonts.inter(fontSize: 13.sp, height: 1.5),
              ),
              SizedBox(height: 2.h),
              Text(
                'Supported Devices',
                style: GoogleFonts.inter(
                  fontSize: 16.sp,
                  fontWeight: FontWeight.w600,
                ),
              ),
              SizedBox(height: 1.h),
              Text(
                '• O2 Sensors: Most Bluetooth pulse oximeters\n'
                '• BP Monitors: Compatible digital cuffs\n'
                '• Heart Rate: Chest straps, smartwatches\n'
                '• Smart Scales: Wi-Fi/Bluetooth scales',
                style: GoogleFonts.inter(fontSize: 13.sp, height: 1.5),
              ),
              SizedBox(height: 2.h),
              Text(
                'Troubleshooting',
                style: GoogleFonts.inter(
                  fontSize: 16.sp,
                  fontWeight: FontWeight.w600,
                ),
              ),
              SizedBox(height: 1.h),
              Text(
                '• Keep devices close during pairing\n'
                '• Restart Bluetooth if connection fails\n'
                '• Check device battery level\n'
                '• Ensure location permissions are granted',
                style: GoogleFonts.inter(fontSize: 13.sp, height: 1.5),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Close'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Visit Settings > Devices for more information'),
                  backgroundColor: Theme.of(context).colorScheme.primary,
                ),
              );
            },
            child: Text('Got It'),
          ),
        ],
      ),
    );
  }

  void _navigateToDeviceHistory(health_models.HealthDevice device) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Device History'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Viewing history for:',
              style: GoogleFonts.inter(fontWeight: FontWeight.w600),
            ),
            SizedBox(height: 1.h),
            Text('Device: ${device.deviceName}'),
            Text('Type: ${device.deviceType.toString().split('.').last}'),
            Text('Last Sync: ${device.lastSyncAt?.toString().split('.')[0] ?? 'Never'}'),
            SizedBox(height: 2.h),
            Text(
              'Recent readings and sync history will appear here.',
              style: GoogleFonts.inter(
                fontSize: 12.sp,
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Close'),
          ),
        ],
      ),
    );
  }

  void _navigateToDeviceSettings(health_models.HealthDevice device) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Device Settings'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              device.deviceName,
              style: GoogleFonts.inter(
                fontSize: 16.sp,
                fontWeight: FontWeight.w700,
              ),
            ),
            SizedBox(height: 2.h),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: Icon(Icons.sync),
              title: Text('Auto Sync'),
              subtitle: Text('Automatically sync data'),
              trailing: Switch(
                value: true,
                onChanged: (value) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Auto sync ${value ? 'enabled' : 'disabled'}'),
                    ),
                  );
                },
              ),
            ),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: Icon(Icons.notifications),
              title: Text('Notifications'),
              subtitle: Text('Device alerts and reminders'),
              trailing: Switch(
                value: false,
                onChanged: (value) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Notifications ${value ? 'enabled' : 'disabled'}'),
                    ),
                  );
                },
              ),
            ),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: Icon(Icons.delete, color: Colors.red),
              title: Text('Remove Device', style: TextStyle(color: Colors.red)),
              onTap: () {
                Navigator.pop(context);
                _disconnectDevice(device.id);
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Done'),
          ),
        ],
      ),
    );
  }
}