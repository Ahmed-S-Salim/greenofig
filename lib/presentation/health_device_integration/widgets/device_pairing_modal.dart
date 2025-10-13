import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:sizer/sizer.dart';
import '../../../models/health_device.dart' as health_models;
import '../../../services/health_device_service.dart';

class DevicePairingModal extends StatefulWidget {
  final health_models.DeviceType deviceType;
  final VoidCallback onDevicePaired;

  const DevicePairingModal({
    Key? key,
    required this.deviceType,
    required this.onDevicePaired,
  }) : super(key: key);

  @override
  State<DevicePairingModal> createState() => _DevicePairingModalState();
}

class _DevicePairingModalState extends State<DevicePairingModal> {
  bool _isScanning = false;
  List<Map<String, dynamic>> _discoveredDevices = [];
  String? _pairingError;

  @override
  void initState() {
    super.initState();
    _startDeviceDiscovery();
  }

  Future<void> _startDeviceDiscovery() async {
    setState(() {
      _isScanning = true;
      _pairingError = null;
      _discoveredDevices.clear();
    });

    try {
      await Future.delayed(Duration(seconds: 2)); // Simulate scanning

      // Mock discovered devices based on device type
      final mockDevices = _getMockDevices(widget.deviceType);

      setState(() {
        _discoveredDevices = mockDevices;
        _isScanning = false;
      });
    } catch (e) {
      setState(() {
        _pairingError = 'Failed to scan for devices: ${e.toString()}';
        _isScanning = false;
      });
    }
  }

  List<Map<String, dynamic>> _getMockDevices(health_models.DeviceType deviceType) {
    switch (deviceType) {
      case health_models.DeviceType.bloodPressure:
        return [
          {
            'name': 'Omron HEM-7120',
            'manufacturer': 'Omron',
            'model': 'HEM-7120',
            'signal_strength': -45,
            'mac_address': '00:11:22:AA:BB:CC',
          },
          {
            'name': 'Withings BPM Core',
            'manufacturer': 'Withings',
            'model': 'BPM Core',
            'signal_strength': -60,
            'mac_address': '00:11:22:DD:EE:FF',
          },
        ];
      case health_models.DeviceType.o2Sensor:
        return [
          {
            'name': 'Masimo MightySat RX',
            'manufacturer': 'Masimo',
            'model': 'MightySat RX',
            'signal_strength': -35,
            'mac_address': '00:11:22:11:22:33',
          },
          {
            'name': 'Nonin Onyx Vantage',
            'manufacturer': 'Nonin',
            'model': 'Onyx Vantage',
            'signal_strength': -55,
            'mac_address': '00:11:22:44:55:66',
          },
        ];
      case health_models.DeviceType.heartRate:
        return [
          {
            'name': 'Polar H10',
            'manufacturer': 'Polar',
            'model': 'H10',
            'signal_strength': -40,
            'mac_address': '00:11:22:77:88:99',
          },
          {
            'name': 'Garmin HRM-Pro',
            'manufacturer': 'Garmin',
            'model': 'HRM-Pro',
            'signal_strength': -50,
            'mac_address': '00:11:22:AA:BB:DD',
          },
        ];
      case health_models.DeviceType.smartScale:
        return [
          {
            'name': 'Withings Body+',
            'manufacturer': 'Withings',
            'model': 'Body+',
            'signal_strength': -45,
            'mac_address': '00:11:22:EE:FF:00',
          },
          {
            'name': 'Fitbit Aria Air',
            'manufacturer': 'Fitbit',
            'model': 'Aria Air',
            'signal_strength': -65,
            'mac_address': '00:11:22:11:33:55',
          },
        ];
    }
  }

  Future<void> _pairDevice(Map<String, dynamic> deviceInfo) async {
    try {
      await HealthDeviceService.pairDevice(
        deviceType: widget.deviceType,
        deviceName: deviceInfo['name'],
        manufacturer: deviceInfo['manufacturer'],
        model: deviceInfo['model'],
        macAddress: deviceInfo['mac_address'],
      );

      widget.onDevicePaired();

      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Device paired successfully!'),
            backgroundColor: Theme.of(context).colorScheme.primary,
          ),
        );
      }
    } catch (e) {
      setState(() {
        _pairingError = 'Failed to pair device: ${e.toString()}';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      height: 80.h,
      decoration: BoxDecoration(
        color: theme.scaffoldBackgroundColor,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
      ),
      child: Column(
        children: [
          // Handle Bar
          Container(
            margin: EdgeInsets.only(top: 1.h),
            width: 12.w,
            height: 4,
            decoration: BoxDecoration(
              color: theme.colorScheme.onSurfaceVariant.withAlpha(77),
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          SizedBox(height: 2.h),

          // Header
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 6.w),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Add ${_getDeviceTypeName(widget.deviceType)}',
                        style: GoogleFonts.inter(
                          fontSize: 20.sp,
                          fontWeight: FontWeight.w700,
                          color: theme.colorScheme.onSurface,
                        ),
                      ),
                      SizedBox(height: 0.5.h),
                      Text(
                        'Ensure your device is in pairing mode',
                        style: GoogleFonts.inter(
                          fontSize: 13.sp,
                          fontWeight: FontWeight.w400,
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: Icon(
                    Icons.close,
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),

          SizedBox(height: 3.h),

          // Content
          Expanded(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 6.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Scan Status
                  if (_isScanning) ...[
                    Center(
                      child: Column(
                        children: [
                          SizedBox(height: 6.h),
                          CircularProgressIndicator(
                            color: theme.colorScheme.primary,
                          ),
                          SizedBox(height: 3.h),
                          Text(
                            'Scanning for devices...',
                            style: GoogleFonts.inter(
                              fontSize: 16.sp,
                              fontWeight: FontWeight.w500,
                              color: theme.colorScheme.onSurface,
                            ),
                          ),
                          SizedBox(height: 1.h),
                          Text(
                            'Make sure your device is powered on and in pairing mode',
                            style: GoogleFonts.inter(
                              fontSize: 13.sp,
                              fontWeight: FontWeight.w400,
                              color: theme.colorScheme.onSurfaceVariant,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  ] else if (_pairingError != null) ...[
                    // Error State
                    Center(
                      child: Column(
                        children: [
                          SizedBox(height: 4.h),
                          Icon(
                            Icons.error_outline,
                            size: 16.w,
                            color: theme.colorScheme.error,
                          ),
                          SizedBox(height: 2.h),
                          Text(
                            'Pairing Failed',
                            style: GoogleFonts.inter(
                              fontSize: 16.sp,
                              fontWeight: FontWeight.w600,
                              color: theme.colorScheme.error,
                            ),
                          ),
                          SizedBox(height: 1.h),
                          Text(
                            _pairingError!,
                            style: GoogleFonts.inter(
                              fontSize: 13.sp,
                              fontWeight: FontWeight.w400,
                              color: theme.colorScheme.onSurfaceVariant,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          SizedBox(height: 3.h),
                          ElevatedButton(
                            onPressed: _startDeviceDiscovery,
                            child: Text('Try Again'),
                          ),
                        ],
                      ),
                    ),
                  ] else if (_discoveredDevices.isEmpty) ...[
                    // No devices found
                    Center(
                      child: Column(
                        children: [
                          SizedBox(height: 4.h),
                          Icon(
                            Icons.bluetooth_searching,
                            size: 16.w,
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                          SizedBox(height: 2.h),
                          Text(
                            'No Devices Found',
                            style: GoogleFonts.inter(
                              fontSize: 16.sp,
                              fontWeight: FontWeight.w600,
                              color: theme.colorScheme.onSurface,
                            ),
                          ),
                          SizedBox(height: 1.h),
                          Text(
                            'Make sure your device is powered on and in pairing mode, then try scanning again.',
                            style: GoogleFonts.inter(
                              fontSize: 13.sp,
                              fontWeight: FontWeight.w400,
                              color: theme.colorScheme.onSurfaceVariant,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          SizedBox(height: 3.h),
                          OutlinedButton.icon(
                            onPressed: _startDeviceDiscovery,
                            icon: Icon(Icons.refresh),
                            label: Text('Scan Again'),
                          ),
                        ],
                      ),
                    ),
                  ] else ...[
                    // Discovered devices list
                    Text(
                      'Available Devices',
                      style: GoogleFonts.inter(
                        fontSize: 16.sp,
                        fontWeight: FontWeight.w600,
                        color: theme.colorScheme.onSurface,
                      ),
                    ),
                    SizedBox(height: 2.h),

                    Expanded(
                      child: ListView.separated(
                        itemCount: _discoveredDevices.length,
                        separatorBuilder: (context, index) =>
                            SizedBox(height: 2.h),
                        itemBuilder: (context, index) {
                          final device = _discoveredDevices[index];
                          return _buildDeviceCard(device, theme);
                        },
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),

          // Bottom Actions
          if (!_isScanning && _pairingError == null) ...[
            Padding(
              padding: EdgeInsets.all(6.w),
              child: OutlinedButton.icon(
                onPressed: _startDeviceDiscovery,
                icon: Icon(Icons.refresh),
                label: Text('Scan Again'),
                style: OutlinedButton.styleFrom(
                  minimumSize: Size(double.infinity, 6.h),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildDeviceCard(Map<String, dynamic> device, ThemeData theme) {
    final signalStrength = device['signal_strength'] as int;
    final isStrongSignal = signalStrength > -50;

    return Container(
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: theme.colorScheme.outline.withAlpha(77),
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => _pairDevice(device),
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: EdgeInsets.all(4.w),
            child: Row(
              children: [
                // Device Icon
                Container(
                  width: 12.w,
                  height: 12.w,
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primary.withAlpha(51),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    _getDeviceIcon(widget.deviceType),
                    color: theme.colorScheme.primary,
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
                        device['name'],
                        style: GoogleFonts.inter(
                          fontSize: 14.sp,
                          fontWeight: FontWeight.w600,
                          color: theme.colorScheme.onSurface,
                        ),
                      ),
                      SizedBox(height: 0.5.h),
                      Text(
                        '${device['manufacturer']} ${device['model']}',
                        style: GoogleFonts.inter(
                          fontSize: 12.sp,
                          fontWeight: FontWeight.w400,
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),

                // Signal Strength
                Column(
                  children: [
                    Icon(
                      isStrongSignal
                          ? Icons.signal_wifi_4_bar
                          : Icons.help_outline,
                      color: isStrongSignal
                          ? Colors.green
                          : theme.colorScheme.onSurfaceVariant,
                      size: 20,
                    ),
                    SizedBox(height: 0.5.h),
                    Text(
                      '${signalStrength}dBm',
                      style: GoogleFonts.inter(
                        fontSize: 10.sp,
                        fontWeight: FontWeight.w400,
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),

                SizedBox(width: 2.w),

                // Pair Button
                Icon(
                  Icons.arrow_forward_ios,
                  size: 16,
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  IconData _getDeviceIcon(health_models.DeviceType deviceType) {
    switch (deviceType) {
      case health_models.DeviceType.bloodPressure:
        return Icons.monitor_heart;
      case health_models.DeviceType.o2Sensor:
        return Icons.air;
      case health_models.DeviceType.heartRate:
        return Icons.favorite;
      case health_models.DeviceType.smartScale:
        return Icons.monitor_weight;
    }
  }

  String _getDeviceTypeName(health_models.DeviceType deviceType) {
    switch (deviceType) {
      case health_models.DeviceType.bloodPressure:
        return 'Blood Pressure Monitor';
      case health_models.DeviceType.o2Sensor:
        return 'O2 Sensor';
      case health_models.DeviceType.heartRate:
        return 'Heart Rate Monitor';
      case health_models.DeviceType.smartScale:
        return 'Smart Scale';
    }
  }
}