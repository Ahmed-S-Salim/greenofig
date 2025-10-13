enum DeviceType { bloodPressure, o2Sensor, heartRate, smartScale }

enum ConnectionStatus { connected, disconnected, syncing, error }

enum DataSyncStatus { pending, synced, failed }

class HealthDevice {
  final String id;
  final String userId;
  final String deviceName;
  final DeviceType deviceType;
  final String? manufacturer;
  final String? model;
  final String? serialNumber;
  final String? macAddress;
  final String? firmwareVersion;
  final ConnectionStatus connectionStatus;
  final int? batteryLevel;
  final DateTime? lastSyncAt;
  final bool isPrimary;
  final Map<String, dynamic> calibrationData;
  final Map<String, dynamic> deviceSettings;
  final DateTime createdAt;
  final DateTime updatedAt;

  HealthDevice({
    required this.id,
    required this.userId,
    required this.deviceName,
    required this.deviceType,
    this.manufacturer,
    this.model,
    this.serialNumber,
    this.macAddress,
    this.firmwareVersion,
    required this.connectionStatus,
    this.batteryLevel,
    this.lastSyncAt,
    required this.isPrimary,
    required this.calibrationData,
    required this.deviceSettings,
    required this.createdAt,
    required this.updatedAt,
  });

  factory HealthDevice.fromJson(Map<String, dynamic> json) {
    return HealthDevice(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      deviceName: json['device_name'] as String,
      deviceType: _parseDeviceType(json['device_type'] as String),
      manufacturer: json['manufacturer'] as String?,
      model: json['model'] as String?,
      serialNumber: json['serial_number'] as String?,
      macAddress: json['mac_address'] as String?,
      firmwareVersion: json['firmware_version'] as String?,
      connectionStatus:
          _parseConnectionStatus(json['connection_status'] as String),
      batteryLevel: json['battery_level'] as int?,
      lastSyncAt: json['last_sync_at'] != null
          ? DateTime.parse(json['last_sync_at'] as String)
          : null,
      isPrimary: json['is_primary'] as bool,
      calibrationData: json['calibration_data'] as Map<String, dynamic>? ?? {},
      deviceSettings: json['device_settings'] as Map<String, dynamic>? ?? {},
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'device_name': deviceName,
      'device_type': _deviceTypeToString(deviceType),
      'manufacturer': manufacturer,
      'model': model,
      'serial_number': serialNumber,
      'mac_address': macAddress,
      'firmware_version': firmwareVersion,
      'connection_status': _connectionStatusToString(connectionStatus),
      'battery_level': batteryLevel,
      'last_sync_at': lastSyncAt?.toIso8601String(),
      'is_primary': isPrimary,
      'calibration_data': calibrationData,
      'device_settings': deviceSettings,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  static DeviceType _parseDeviceType(String type) {
    switch (type) {
      case 'blood_pressure':
        return DeviceType.bloodPressure;
      case 'o2_sensor':
        return DeviceType.o2Sensor;
      case 'heart_rate':
        return DeviceType.heartRate;
      case 'smart_scale':
        return DeviceType.smartScale;
      default:
        throw ArgumentError('Unknown device type: $type');
    }
  }

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

  static ConnectionStatus _parseConnectionStatus(String status) {
    switch (status) {
      case 'connected':
        return ConnectionStatus.connected;
      case 'disconnected':
        return ConnectionStatus.disconnected;
      case 'syncing':
        return ConnectionStatus.syncing;
      case 'error':
        return ConnectionStatus.error;
      default:
        throw ArgumentError('Unknown connection status: $status');
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

  HealthDevice copyWith({
    String? id,
    String? userId,
    String? deviceName,
    DeviceType? deviceType,
    String? manufacturer,
    String? model,
    String? serialNumber,
    String? macAddress,
    String? firmwareVersion,
    ConnectionStatus? connectionStatus,
    int? batteryLevel,
    DateTime? lastSyncAt,
    bool? isPrimary,
    Map<String, dynamic>? calibrationData,
    Map<String, dynamic>? deviceSettings,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return HealthDevice(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      deviceName: deviceName ?? this.deviceName,
      deviceType: deviceType ?? this.deviceType,
      manufacturer: manufacturer ?? this.manufacturer,
      model: model ?? this.model,
      serialNumber: serialNumber ?? this.serialNumber,
      macAddress: macAddress ?? this.macAddress,
      firmwareVersion: firmwareVersion ?? this.firmwareVersion,
      connectionStatus: connectionStatus ?? this.connectionStatus,
      batteryLevel: batteryLevel ?? this.batteryLevel,
      lastSyncAt: lastSyncAt ?? this.lastSyncAt,
      isPrimary: isPrimary ?? this.isPrimary,
      calibrationData: calibrationData ?? this.calibrationData,
      deviceSettings: deviceSettings ?? this.deviceSettings,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  String toString() {
    return 'HealthDevice(id: $id, deviceName: $deviceName, deviceType: $deviceType, connectionStatus: $connectionStatus)';
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is HealthDevice &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;
}
