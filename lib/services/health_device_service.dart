import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/health_device.dart';
import './auth_service.dart';

class HealthDeviceService {
  static final SupabaseClient _client = Supabase.instance.client;

  // Get all devices for the current user
  static Future<List<HealthDevice>> getUserDevices() async {
    try {
      final user = AuthService.getCurrentUser();
      if (user == null) throw Exception('No authenticated user');

      final response = await _client
          .from('health_devices')
          .select()
          .eq('user_id', user.id)
          .order('created_at', ascending: false);

      return response
          .map<HealthDevice>((json) => HealthDevice.fromJson(json))
          .toList();
    } catch (error) {
      throw Exception('Failed to fetch devices: $error');
    }
  }

  // Get devices by type
  static Future<List<HealthDevice>> getDevicesByType(
      DeviceType deviceType) async {
    try {
      final user = AuthService.getCurrentUser();
      if (user == null) throw Exception('No authenticated user');

      final deviceTypeString = _deviceTypeToString(deviceType);

      final response = await _client
          .from('health_devices')
          .select()
          .eq('user_id', user.id)
          .eq('device_type', deviceTypeString)
          .order('created_at', ascending: false);

      return response
          .map<HealthDevice>((json) => HealthDevice.fromJson(json))
          .toList();
    } catch (error) {
      throw Exception('Failed to fetch devices by type: $error');
    }
  }

  // Pair a new device
  static Future<HealthDevice> pairDevice({
    required DeviceType deviceType,
    required String deviceName,
    String? manufacturer,
    String? model,
    String? macAddress,
    String? serialNumber,
    Map<String, dynamic>? deviceSettings,
  }) async {
    try {
      final user = AuthService.getCurrentUser();
      if (user == null) throw Exception('No authenticated user');

      final deviceData = {
        'user_id': user.id,
        'device_name': deviceName,
        'device_type': _deviceTypeToString(deviceType),
        'manufacturer': manufacturer,
        'model': model,
        'mac_address': macAddress,
        'serial_number': serialNumber,
        'connection_status': 'connected',
        'battery_level': 85, // Mock initial battery level
        'is_primary': false,
        'device_settings': deviceSettings ?? {},
        'calibration_data': {},
        'last_sync_at': DateTime.now().toIso8601String(),
      };

      final response = await _client
          .from('health_devices')
          .insert(deviceData)
          .select()
          .single();

      return HealthDevice.fromJson(response);
    } catch (error) {
      throw Exception('Failed to pair device: $error');
    }
  }

  // Update device connection status
  static Future<void> updateConnectionStatus(
      String deviceId, ConnectionStatus status) async {
    try {
      final statusString = _connectionStatusToString(status);

      await _client.from('health_devices').update({
        'connection_status': statusString,
        'last_sync_at': status == ConnectionStatus.connected
            ? DateTime.now().toIso8601String()
            : null,
        'updated_at': DateTime.now().toIso8601String(),
      }).eq('id', deviceId);
    } catch (error) {
      throw Exception('Failed to update connection status: $error');
    }
  }

  // Disconnect device
  static Future<void> disconnectDevice(String deviceId) async {
    try {
      await _client.from('health_devices').update({
        'connection_status': 'disconnected',
        'updated_at': DateTime.now().toIso8601String(),
      }).eq('id', deviceId);
    } catch (error) {
      throw Exception('Failed to disconnect device: $error');
    }
  }

  // Remove device permanently
  static Future<void> removeDevice(String deviceId) async {
    try {
      await _client.from('health_devices').delete().eq('id', deviceId);
    } catch (error) {
      throw Exception('Failed to remove device: $error');
    }
  }

  // Set device as primary
  static Future<void> setPrimaryDevice(
      String deviceId, DeviceType deviceType) async {
    try {
      final user = AuthService.getCurrentUser();
      if (user == null) throw Exception('No authenticated user');

      final deviceTypeString = _deviceTypeToString(deviceType);

      // First, unset all devices of this type as primary
      await _client
          .from('health_devices')
          .update({'is_primary': false})
          .eq('user_id', user.id)
          .eq('device_type', deviceTypeString);

      // Then set the selected device as primary
      await _client.from('health_devices').update({
        'is_primary': true,
        'updated_at': DateTime.now().toIso8601String(),
      }).eq('id', deviceId);
    } catch (error) {
      throw Exception('Failed to set primary device: $error');
    }
  }

  // Update device settings
  static Future<void> updateDeviceSettings(
      String deviceId, Map<String, dynamic> settings) async {
    try {
      await _client.from('health_devices').update({
        'device_settings': settings,
        'updated_at': DateTime.now().toIso8601String(),
      }).eq('id', deviceId);
    } catch (error) {
      throw Exception('Failed to update device settings: $error');
    }
  }

  // Get device by ID
  static Future<HealthDevice?> getDeviceById(String deviceId) async {
    try {
      final response = await _client
          .from('health_devices')
          .select()
          .eq('id', deviceId)
          .maybeSingle();

      return response != null ? HealthDevice.fromJson(response) : null;
    } catch (error) {
      throw Exception('Failed to fetch device: $error');
    }
  }

  // Sync device data (simulate)
  static Future<void> syncDeviceData(String deviceId) async {
    try {
      // Update status to syncing
      await updateConnectionStatus(deviceId, ConnectionStatus.syncing);

      // Simulate sync delay
      await Future.delayed(Duration(seconds: 2));

      // Update status to connected
      await updateConnectionStatus(deviceId, ConnectionStatus.connected);
    } catch (error) {
      // Set error status if sync fails
      await updateConnectionStatus(deviceId, ConnectionStatus.error);
      throw Exception('Failed to sync device data: $error');
    }
  }

  // Get connected devices count
  static Future<int> getConnectedDevicesCount() async {
    try {
      final user = AuthService.getCurrentUser();
      if (user == null) return 0;

      final response = await _client
          .from('health_devices')
          .select('id')
          .eq('user_id', user.id)
          .eq('connection_status', 'connected')
          .count();

      return response.count;
    } catch (error) {
      return 0;
    }
  }

  // Helper methods for enum conversions
  static String _deviceTypeToString(DeviceType type) {
    switch (type) {
      case DeviceType.bloodPressure:
        return 'blood_pressure';
      case DeviceType.o2Sensor:
        return 'o2_sensor';
      case DeviceType.heartRate:
        return 'heart_rate';
      case DeviceType.smartScale:
        return 'smart_scale';
    }
  }

  static String _connectionStatusToString(ConnectionStatus status) {
    switch (status) {
      case ConnectionStatus.connected:
        return 'connected';
      case ConnectionStatus.disconnected:
        return 'disconnected';
      case ConnectionStatus.syncing:
        return 'syncing';
      case ConnectionStatus.error:
        return 'error';
    }
  }

}
