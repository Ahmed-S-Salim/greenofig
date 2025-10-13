import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';
import '../../services/health_integration_service.dart';

class DeviceIntegrationScreen extends StatefulWidget {
  const DeviceIntegrationScreen({Key? key}) : super(key: key);

  @override
  State<DeviceIntegrationScreen> createState() =>
      _DeviceIntegrationScreenState();
}

class _DeviceIntegrationScreenState extends State<DeviceIntegrationScreen> {
  final HealthIntegrationService _healthService = HealthIntegrationService();
  List<Map<String, dynamic>> _devices = [];
  bool _isLoading = true;
  bool _permissionsGranted = false;

  @override
  void initState() {
    super.initState();
    _initializeDeviceIntegration();
  }

  Future<void> _initializeDeviceIntegration() async {
    setState(() => _isLoading = true);

    try {
      // Request health permissions first
      _permissionsGranted = await _healthService.requestHealthPermissions();

      // Load available devices
      _devices = _healthService.getAvailableDevices();

      setState(() => _isLoading = false);
    } catch (e) {
      setState(() => _isLoading = false);
      _showErrorSnackBar('Failed to initialize device integration: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Device Integration'),
        actions: [
          IconButton(
            icon: Icon(Icons.refresh),
            onPressed: _initializeDeviceIntegration,
          ),
        ],
      ),
      body: _isLoading
          ? _buildLoadingScreen()
          : !_permissionsGranted
              ? _buildPermissionScreen()
              : _buildDeviceList(),
    );
  }

  Widget _buildLoadingScreen() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(),
          SizedBox(height: 4.h),
          Text(
            'Initializing device integration...',
            style: Theme.of(context).textTheme.titleMedium,
          ),
        ],
      ),
    );
  }

  Widget _buildPermissionScreen() {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(6.w),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.security,
              size: 20.w,
              color: Theme.of(context).colorScheme.primary,
            ),
            SizedBox(height: 4.h),
            Text(
              'Permissions Required',
              style: Theme.of(context).textTheme.headlineMedium,
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 2.h),
            Text(
              'To connect to health devices, we need permission to access Bluetooth and location services. This allows us to discover and connect to nearby health monitoring devices.',
              style: Theme.of(context).textTheme.bodyLarge,
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 4.h),
            ElevatedButton.icon(
              onPressed: _initializeDeviceIntegration,
              icon: Icon(Icons.security),
              label: Text('Grant Permissions'),
              style: ElevatedButton.styleFrom(
                padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 2.h),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDeviceList() {
    return SingleChildScrollView(
      padding: EdgeInsets.all(4.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildStatusCard(),
          SizedBox(height: 6.h),
          Text(
            'Available Devices',
            style: Theme.of(context).textTheme.headlineMedium,
          ),
          SizedBox(height: 3.h),
          ...(_devices.map((device) => _buildDeviceCard(device)).toList()),
          SizedBox(height: 6.h),
          _buildHealthDataPreview(),
        ],
      ),
    );
  }

  Widget _buildStatusCard() {
    final connectedDevices =
        _devices.where((device) => device['connected'] as bool).length;

    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Theme.of(context).colorScheme.primaryContainer,
            Theme.of(context).colorScheme.primaryContainer.withAlpha(100),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Icon(
            Icons.devices_outlined,
            size: 12.w,
            color: Theme.of(context).colorScheme.primary,
          ),
          SizedBox(height: 2.h),
          Text(
            'Device Status',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
          ),
          SizedBox(height: 1.h),
          Text(
            '$connectedDevices of ${_devices.length} devices connected',
            style: Theme.of(context).textTheme.bodyLarge,
          ),
          if (connectedDevices > 0) ...[
            SizedBox(height: 2.h),
            ElevatedButton.icon(
              onPressed: _showHealthDataDialog,
              icon: Icon(Icons.health_and_safety),
              label: Text('View Health Data'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Theme.of(context).colorScheme.primary,
                foregroundColor: Theme.of(context).colorScheme.onPrimary,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildDeviceCard(Map<String, dynamic> device) {
    final bool isConnected = device['connected'] as bool;

    return Container(
      margin: EdgeInsets.only(bottom: 3.h),
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isConnected
              ? Theme.of(context).colorScheme.primary
              : Theme.of(context).dividerColor,
          width: isConnected ? 2 : 1,
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.all(3.w),
            decoration: BoxDecoration(
              color: isConnected
                  ? Theme.of(context).colorScheme.primaryContainer
                  : Theme.of(context).colorScheme.surfaceContainer,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              _getDeviceIcon(device['icon'] as String),
              color: isConnected
                  ? Theme.of(context).colorScheme.primary
                  : Theme.of(context).colorScheme.onSurfaceVariant,
              size: 8.w,
            ),
          ),
          SizedBox(width: 4.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  device['name'] as String,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                ),
                SizedBox(height: 0.5.h),
                Text(
                  device['description'] as String,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Theme.of(context).colorScheme.onSurfaceVariant,
                      ),
                ),
                if (isConnected) ...[
                  SizedBox(height: 1.h),
                  Row(
                    children: [
                      Icon(
                        Icons.check_circle,
                        color: Colors.green,
                        size: 4.w,
                      ),
                      SizedBox(width: 1.w),
                      Text(
                        'Connected',
                        style: TextStyle(
                          color: Colors.green,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
          Column(
            children: [
              ElevatedButton(
                onPressed: () => _handleDeviceConnection(device),
                style: ElevatedButton.styleFrom(
                  backgroundColor: isConnected
                      ? Theme.of(context).colorScheme.error
                      : Theme.of(context).colorScheme.primary,
                  foregroundColor: isConnected
                      ? Theme.of(context).colorScheme.onError
                      : Theme.of(context).colorScheme.onPrimary,
                  minimumSize: Size(20.w, 4.h),
                ),
                child: Text(
                  isConnected ? 'Disconnect' : 'Connect',
                  style: TextStyle(fontSize: 10.sp),
                ),
              ),
              if (isConnected) ...[
                SizedBox(height: 1.h),
                TextButton(
                  onPressed: () => _showDeviceData(device),
                  child: Text(
                    'View Data',
                    style: TextStyle(fontSize: 9.sp),
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildHealthDataPreview() {
    final connectedDevices =
        _devices.where((device) => device['connected'] as bool);

    if (connectedDevices.isEmpty) {
      return Container(
        padding: EdgeInsets.all(4.w),
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          children: [
            Icon(
              Icons.device_hub_outlined,
              size: 12.w,
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
            SizedBox(height: 2.h),
            Text(
              'No Devices Connected',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            SizedBox(height: 1.h),
            Text(
              'Connect to health devices to start monitoring your wellness data in real-time.',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
            ),
          ],
        ),
      );
    }

    return Container(
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Real-Time Health Data',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          SizedBox(height: 3.h),
          _buildHealthMetricPreview(
              'Heart Rate', '72 BPM', Icons.favorite, Colors.red),
          _buildHealthMetricPreview(
              'Steps', '8,542 / 10,000', Icons.directions_walk, Colors.blue),
          _buildHealthMetricPreview('SpO2', '98.5%', Icons.air, Colors.green),
          SizedBox(height: 3.h),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _showFullHealthDashboard,
              icon: Icon(Icons.dashboard),
              label: Text('View Full Dashboard'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHealthMetricPreview(
      String title, String value, IconData icon, Color color) {
    return Padding(
      padding: EdgeInsets.only(bottom: 2.h),
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.all(2.w),
            decoration: BoxDecoration(
              color: color.withAlpha(50),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color, size: 5.w),
          ),
          SizedBox(width: 3.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: Theme.of(context).textTheme.bodyMedium),
                Text(
                  value,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  IconData _getDeviceIcon(String iconName) {
    switch (iconName) {
      case 'watch':
        return Icons.watch;
      case 'favorite':
        return Icons.favorite;
      case 'monitor_heart':
        return Icons.monitor_heart;
      case 'air':
        return Icons.air;
      case 'scale':
        return Icons.scale;
      default:
        return Icons.device_unknown;
    }
  }

  Future<void> _handleDeviceConnection(Map<String, dynamic> device) async {
    final deviceType = device['type'] as String;
    final isConnected = device['connected'] as bool;

    try {
      if (isConnected) {
        final success = await _healthService.disconnectFromDevice(deviceType);
        if (success) {
          setState(() {
            device['connected'] = false;
          });
          _showSnackBar('Disconnected from ${device['name']}');
        }
      } else {
        _showConnectingDialog(device['name'] as String);
        final success = await _healthService.connectToDevice(deviceType);
        Navigator.pop(context); // Close connecting dialog

        if (success) {
          setState(() {
            device['connected'] = true;
          });
          _showSnackBar('Connected to ${device['name']}');
        } else {
          _showErrorSnackBar('Failed to connect to ${device['name']}');
        }
      }
    } catch (e) {
      Navigator.of(context).popUntil((route) => route.isFirst);
      _showErrorSnackBar('Connection error: $e');
    }
  }

  void _showConnectingDialog(String deviceName) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 3.h),
            Text(
              'Connecting to $deviceName...',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            SizedBox(height: 1.h),
            Text(
              'Please ensure your device is powered on and in pairing mode.',
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  void _showDeviceData(Map<String, dynamic> device) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.6,
        maxChildSize: 0.9,
        minChildSize: 0.3,
        builder: (context, scrollController) {
          return Container(
            padding: EdgeInsets.all(4.w),
            child: Column(
              children: [
                Text(
                  '${device['name']} Data',
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                SizedBox(height: 3.h),
                Expanded(
                  child: SingleChildScrollView(
                    controller: scrollController,
                    child: Column(
                      children: [
                        Text(
                            'Real-time data from ${device['name']} would appear here.'),
                        SizedBox(height: 2.h),
                        Text(
                            'This includes live readings, historical data, and device status.'),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  void _showHealthDataDialog() async {
    try {
      final healthSummary = await _healthService.getHealthSummary();

      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text('Health Data Summary'),
          content: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                    'Heart Rate: ${healthSummary['heartRate']['current']} BPM'),
                SizedBox(height: 1.h),
                Text(
                    'Steps: ${healthSummary['steps']['steps']} / ${healthSummary['steps']['goal']}'),
                SizedBox(height: 1.h),
                Text('SpO2: ${healthSummary['oxygenSaturation']}%'),
                SizedBox(height: 1.h),
                Text('Connected Devices:'),
                ...(healthSummary['connectedDevices'] as List)
                    .map((device) => Text('• $device'))
                    .toList(),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Close'),
            ),
          ],
        ),
      );
    } catch (e) {
      _showErrorSnackBar('Failed to load health data: $e');
    }
  }

  void _showFullHealthDashboard() {
    // Navigate to a dedicated health dashboard screen
    _showSnackBar('Health Dashboard feature coming soon!');
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Theme.of(context).colorScheme.error,
      ),
    );
  }
}
