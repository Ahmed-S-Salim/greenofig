import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../core/app_export.dart';
import '../../services/auth_service.dart';
import './widgets/dietary_preference_widget.dart';
import './widgets/notification_time_widget.dart';
import './widgets/settings_item_widget.dart';
import './widgets/settings_section_widget.dart';
import './widgets/toggle_switch_widget.dart';
import './widgets/user_profile_header_widget.dart';
import './widgets/wearable_device_widget.dart';

class ProfileSettings extends StatefulWidget {
  const ProfileSettings({Key? key}) : super(key: key);

  @override
  State<ProfileSettings> createState() => _ProfileSettingsState();
}

class _ProfileSettingsState extends State<ProfileSettings> {
  // User profile data
  Map<String, dynamic> _userProfile = {};
  bool _isLoading = true;

  // Settings state
  bool _pushNotifications = true;
  bool _emailNotifications = false;
  bool _workoutReminders = true;
  bool _mealReminders = true;
  bool _waterReminders = true;
  bool _sleepMode = false;
  bool _privacyMode = false;
  bool _dataSync = true;
  bool _biometricLock = false;

  // Profile customization
  String _selectedDietaryPreference = 'None';
  TimeOfDay _workoutTime = const TimeOfDay(hour: 7, minute: 0);
  TimeOfDay _bedtimeReminder = const TimeOfDay(hour: 22, minute: 0);
  String _fitnessGoal = 'General Health';
  String _activityLevel = 'Moderate';

  final List<String> _dietaryOptions = [
    'None',
    'Vegetarian',
    'Vegan',
    'Keto',
    'Mediterranean',
    'Paleo',
    'Low Carb',
    'Gluten-Free',
    'Diabetic',
    'Heart Healthy'
  ];

  final List<String> _fitnessGoals = [
    'Weight Loss',
    'Muscle Gain',
    'General Health',
    'Endurance',
    'Strength',
    'Flexibility'
  ];

  final List<String> _activityLevels = [
    'Sedentary',
    'Light',
    'Moderate',
    'Active',
    'Very Active'
  ];

  @override
  void initState() {
    super.initState();
    _loadUserProfile();
  }

  Future<void> _loadUserProfile() async {
    try {
      final profile = await AuthService.getUserProfile();
      if (profile != null && mounted) {
        setState(() {
          _userProfile = profile;
          _isLoading = false;

          // Load existing settings from profile
          _pushNotifications = profile['push_notifications'] ?? true;
          _emailNotifications = profile['email_notifications'] ?? false;
          _workoutReminders = profile['workout_reminders'] ?? true;
          _mealReminders = profile['meal_reminders'] ?? true;
          _waterReminders = profile['water_reminders'] ?? true;
          _sleepMode = profile['sleep_mode'] ?? false;
          _privacyMode = profile['privacy_mode'] ?? false;
          _dataSync = profile['data_sync'] ?? true;
          _biometricLock = profile['biometric_lock'] ?? false;

          _selectedDietaryPreference = profile['dietary_preference'] ?? 'None';
          _fitnessGoal = profile['fitness_goal'] ?? 'General Health';
          _activityLevel = profile['activity_level'] ?? 'Moderate';
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load profile: ${e.toString()}'),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      }
    }
  }

  Future<void> _saveSettings() async {
    try {
      final updatedProfile = {
        ..._userProfile,
        'push_notifications': _pushNotifications,
        'email_notifications': _emailNotifications,
        'workout_reminders': _workoutReminders,
        'meal_reminders': _mealReminders,
        'water_reminders': _waterReminders,
        'sleep_mode': _sleepMode,
        'privacy_mode': _privacyMode,
        'data_sync': _dataSync,
        'biometric_lock': _biometricLock,
        'dietary_preference': _selectedDietaryPreference,
        'fitness_goal': _fitnessGoal,
        'activity_level': _activityLevel,
        'workout_time': '${_workoutTime.hour}:${_workoutTime.minute}',
        'bedtime_reminder':
            '${_bedtimeReminder.hour}:${_bedtimeReminder.minute}',
        'updated_at': DateTime.now().toIso8601String(),
      };

      await AuthService.updateProfile(data: updatedProfile);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Profile settings saved successfully!'),
            backgroundColor: Theme.of(context).colorScheme.primary,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to save settings: ${e.toString()}'),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      }
    }
  }

  Future<void> _signOut() async {
    final shouldSignOut = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Theme.of(context).colorScheme.surface,
        title: Text(
          'Sign Out',
          style: GoogleFonts.inter(
            color: Theme.of(context).colorScheme.onSurface,
            fontWeight: FontWeight.w600,
          ),
        ),
        content: Text(
          'Are you sure you want to sign out?',
          style: GoogleFonts.inter(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(
              'Cancel',
              style: GoogleFonts.inter(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: Text(
              'Sign Out',
              style: GoogleFonts.inter(
                color: Theme.of(context).colorScheme.error,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );

    if (shouldSignOut == true) {
      try {
        await AuthService.signOut();
        if (mounted) {
          Navigator.pushReplacementNamed(context, AppRoutes.loginScreen);
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Failed to sign out: ${e.toString()}'),
              backgroundColor: Theme.of(context).colorScheme.error,
            ),
          );
        }
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
          'Profile Settings',
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
          TextButton(
            onPressed: _saveSettings,
            child: Text(
              'Save',
              style: GoogleFonts.inter(
                fontSize: 14.sp,
                fontWeight: FontWeight.w600,
                color: theme.colorScheme.primary,
              ),
            ),
          ),
        ],
      ),
      body: _isLoading
          ? Center(
              child: CircularProgressIndicator(
                color: theme.colorScheme.primary,
              ),
            )
          : SingleChildScrollView(
              padding: EdgeInsets.all(4.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // User Profile Header
                  UserProfileHeaderWidget(
                    userData: _userProfile,
                    onAvatarTap: _navigateToProfileEdit,
                  ),

                  SizedBox(height: 4.h),

                  // Health & Fitness Goals Section
                  SettingsSectionWidget(
                    title: 'Health & Fitness Goals',
                    children: [
                      // Dietary Preferences
                      DietaryPreferenceWidget(
                        preference: _selectedDietaryPreference,
                        isSelected: true,
                        onTap: () {
                          _showSelectionDialog(
                            'Select Dietary Preference',
                            _dietaryOptions,
                            _selectedDietaryPreference,
                            (value) => setState(
                                () => _selectedDietaryPreference = value),
                          );
                        },
                      ),

                      SizedBox(height: 2.h),

                      // Fitness Goal
                      SettingsItemWidget(
                        title: 'Fitness Goal',
                        subtitle: _fitnessGoal,
                        onTap: () {
                          _showSelectionDialog(
                            'Select Fitness Goal',
                            _fitnessGoals,
                            _fitnessGoal,
                            (value) => setState(() => _fitnessGoal = value),
                          );
                        },
                      ),

                      // Activity Level
                      SettingsItemWidget(
                        title: 'Activity Level',
                        subtitle: _activityLevel,
                        onTap: () {
                          _showSelectionDialog(
                            'Select Activity Level',
                            _activityLevels,
                            _activityLevel,
                            (value) => setState(() => _activityLevel = value),
                          );
                        },
                      ),
                    ],
                  ),

                  SizedBox(height: 3.h),

                  // Notifications Section
                  SettingsSectionWidget(
                    title: 'Notifications',
                    children: [
                      SettingsItemWidget(
                        title: 'Push Notifications',
                        subtitle: 'Receive workout and health reminders',
                        trailing: ToggleSwitchWidget(
                          value: _pushNotifications,
                          onChanged: (value) =>
                              setState(() => _pushNotifications = value),
                        ),
                      ),
                      SettingsItemWidget(
                        title: 'Email Notifications',
                        subtitle: 'Weekly health reports and updates',
                        trailing: ToggleSwitchWidget(
                          value: _emailNotifications,
                          onChanged: (value) =>
                              setState(() => _emailNotifications = value),
                        ),
                      ),
                      SettingsItemWidget(
                        title: 'Workout Reminders',
                        subtitle: 'Daily workout schedule alerts',
                        trailing: ToggleSwitchWidget(
                          value: _workoutReminders,
                          onChanged: (value) =>
                              setState(() => _workoutReminders = value),
                        ),
                      ),
                      SettingsItemWidget(
                        title: 'Meal Reminders',
                        subtitle: 'Nutrition tracking reminders',
                        trailing: ToggleSwitchWidget(
                          value: _mealReminders,
                          onChanged: (value) =>
                              setState(() => _mealReminders = value),
                        ),
                      ),
                      SettingsItemWidget(
                        title: 'Water Reminders',
                        subtitle: 'Hydration tracking alerts',
                        trailing: ToggleSwitchWidget(
                          value: _waterReminders,
                          onChanged: (value) =>
                              setState(() => _waterReminders = value),
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: 3.h),

                  // Reminder Times Section
                  SettingsSectionWidget(
                    title: 'Reminder Times',
                    children: [
                      NotificationTimeWidget(
                        label: 'Workout Reminder',
                        time: _workoutTime,
                        onTap: () async {
                          final time = await showTimePicker(
                            context: context,
                            initialTime: _workoutTime,
                          );
                          if (time != null) {
                            setState(() => _workoutTime = time);
                          }
                        },
                      ),
                      NotificationTimeWidget(
                        label: 'Bedtime Reminder',
                        time: _bedtimeReminder,
                        onTap: () async {
                          final time = await showTimePicker(
                            context: context,
                            initialTime: _bedtimeReminder,
                          );
                          if (time != null) {
                            setState(() => _bedtimeReminder = time);
                          }
                        },
                      ),
                    ],
                  ),

                  SizedBox(height: 3.h),

                  // Privacy & Security Section
                  SettingsSectionWidget(
                    title: 'Privacy & Security',
                    children: [
                      SettingsItemWidget(
                        title: 'Privacy Mode',
                        subtitle: 'Hide sensitive health data',
                        trailing: ToggleSwitchWidget(
                          value: _privacyMode,
                          onChanged: (value) =>
                              setState(() => _privacyMode = value),
                        ),
                      ),
                      SettingsItemWidget(
                        title: 'Biometric Lock',
                        subtitle: 'Require fingerprint or face unlock',
                        trailing: ToggleSwitchWidget(
                          value: _biometricLock,
                          onChanged: (value) =>
                              setState(() => _biometricLock = value),
                        ),
                      ),
                      SettingsItemWidget(
                        title: 'Data Sync',
                        subtitle: 'Sync data across devices',
                        trailing: ToggleSwitchWidget(
                          value: _dataSync,
                          onChanged: (value) =>
                              setState(() => _dataSync = value),
                        ),
                      ),
                      SettingsItemWidget(
                        title: 'Sleep Mode',
                        subtitle: 'Disable notifications during bedtime',
                        trailing: ToggleSwitchWidget(
                          value: _sleepMode,
                          onChanged: (value) =>
                              setState(() => _sleepMode = value),
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: 3.h),

                  // Connected Devices Section
                  SettingsSectionWidget(
                    title: 'Connected Devices',
                    children: [
                      WearableDeviceWidget(
                        device: {
                          'name': 'Health Devices',
                          'type': 'O2, Blood Pressure, Heart Rate',
                          'isConnected': true,
                          'lastSync': '2 hours ago',
                        },
                        onTap: () {
                          Navigator.pushNamed(
                              context, AppRoutes.healthDeviceIntegration);
                        },
                      ),
                    ],
                  ),

                  SizedBox(height: 3.h),

                  // Account Actions Section
                  SettingsSectionWidget(
                    title: 'Account',
                    children: [
                      SettingsItemWidget(
                        title: 'Export Health Data',
                        subtitle: 'Download your health information',
                        onTap: _exportHealthData,
                      ),
                      SettingsItemWidget(
                        title: 'Delete Account',
                        subtitle: 'Permanently delete your account',
                        onTap: _showDeleteAccountDialog,
                      ),
                    ],
                  ),

                  SizedBox(height: 4.h),

                  // Sign Out Button
                  SizedBox(
                    width: double.infinity,
                    height: 6.h,
                    child: OutlinedButton(
                      onPressed: _signOut,
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: theme.colorScheme.error),
                        foregroundColor: theme.colorScheme.error,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: Text(
                        'Sign Out',
                        style: GoogleFonts.inter(
                          fontSize: 16.sp,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),

                  SizedBox(height: 6.h),
                ],
              ),
            ),
    );
  }

  void _showSelectionDialog(
    String title,
    List<String> options,
    String currentValue,
    Function(String) onSelected,
  ) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Theme.of(context).colorScheme.surface,
        title: Text(
          title,
          style: GoogleFonts.inter(
            color: Theme.of(context).colorScheme.onSurface,
            fontWeight: FontWeight.w600,
          ),
        ),
        content: SizedBox(
          width: double.maxFinite,
          child: ListView.builder(
            shrinkWrap: true,
            itemCount: options.length,
            itemBuilder: (context, index) {
              final option = options[index];
              return ListTile(
                title: Text(
                  option,
                  style: GoogleFonts.inter(
                    color: Theme.of(context).colorScheme.onSurface,
                  ),
                ),
                trailing: currentValue == option
                    ? Icon(
                        Icons.check,
                        color: Theme.of(context).colorScheme.primary,
                      )
                    : null,
                onTap: () {
                  onSelected(option);
                  Navigator.of(context).pop();
                },
              );
            },
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text(
              'Cancel',
              style: GoogleFonts.inter(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _navigateToProfileEdit() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Edit Profile'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Profile editing functionality',
              style: GoogleFonts.inter(fontWeight: FontWeight.w600),
            ),
            SizedBox(height: 2.h),
            Text('Here you can edit:'),
            Text('• Profile photo'),
            Text('• Name and bio'),
            Text('• Contact information'),
            Text('• Health metrics'),
          ],
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
                  content: Text('Profile edit screen coming soon!'),
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

  void _exportHealthData() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(Icons.file_download, color: Theme.of(context).colorScheme.primary),
            SizedBox(width: 2.w),
            Text('Export Health Data'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Your health data export will include:',
              style: GoogleFonts.inter(fontWeight: FontWeight.w600),
            ),
            SizedBox(height: 2.h),
            ...['Workout history', 'Meal logs', 'Body measurements', 'Device data', 'Health goals', 'Progress reports']
                .map((item) => Padding(
              padding: EdgeInsets.only(bottom: 0.5.h),
              child: Row(
                children: [
                  Icon(Icons.check_circle, size: 16, color: Colors.green),
                  SizedBox(width: 2.w),
                  Expanded(child: Text(item)),
                ],
              ),
            )),
            SizedBox(height: 2.h),
            Text(
              'Format: JSON',
              style: GoogleFonts.inter(
                fontSize: 12.sp,
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
            Text(
              'Size: ~5-10 MB',
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
            child: Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);

              // Simulate export process
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Preparing your health data export...'),
                  duration: Duration(seconds: 2),
                ),
              );

              Future.delayed(Duration(seconds: 2), () {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Health data exported successfully!'),
                      backgroundColor: Colors.green,
                      action: SnackBarAction(
                        label: 'View',
                        textColor: Colors.white,
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Download would start in production'),
                            ),
                          );
                        },
                      ),
                    ),
                  );
                }
              });
            },
            child: Text('Export Data'),
          ),
        ],
      ),
    );
  }

  void _showDeleteAccountDialog() {
    final confirmController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(Icons.warning, color: Colors.red),
            SizedBox(width: 2.w),
            Text(
              'Delete Account',
              style: TextStyle(color: Colors.red),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'This action cannot be undone!',
              style: GoogleFonts.inter(
                fontWeight: FontWeight.w700,
                color: Colors.red,
              ),
            ),
            SizedBox(height: 2.h),
            Text('Deleting your account will permanently remove:'),
            SizedBox(height: 1.h),
            ...['All workout data', 'Meal history', 'Body measurements', 'Device connections', 'Personal information', 'Progress photos']
                .map((item) => Padding(
              padding: EdgeInsets.only(bottom: 0.5.h),
              child: Row(
                children: [
                  Icon(Icons.close, size: 16, color: Colors.red),
                  SizedBox(width: 2.w),
                  Expanded(child: Text(item)),
                ],
              ),
            )),
            SizedBox(height: 2.h),
            Text(
              'Type "DELETE" to confirm:',
              style: GoogleFonts.inter(fontWeight: FontWeight.w600),
            ),
            SizedBox(height: 1.h),
            TextField(
              controller: confirmController,
              decoration: InputDecoration(
                hintText: 'Type DELETE',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              confirmController.dispose();
              Navigator.pop(context);
            },
            child: Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              if (confirmController.text == 'DELETE') {
                confirmController.dispose();
                Navigator.pop(context);

                // Show final confirmation
                showDialog(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: Text('Final Confirmation'),
                    content: Text('Are you absolutely sure you want to delete your account?'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: Text('Cancel'),
                      ),
                      ElevatedButton(
                        onPressed: () async {
                          Navigator.pop(context);

                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Deleting account...'),
                              duration: Duration(seconds: 2),
                            ),
                          );

                          // Simulate account deletion
                          await Future.delayed(Duration(seconds: 2));

                          if (mounted) {
                            await AuthService.signOut();
                            Navigator.pushReplacementNamed(context, AppRoutes.loginScreen);

                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('Account deleted successfully'),
                                backgroundColor: Colors.red,
                              ),
                            );
                          }
                        },
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                        child: Text('Delete Forever'),
                      ),
                    ],
                  ),
                );
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Please type "DELETE" to confirm'),
                    backgroundColor: Colors.orange,
                  ),
                );
              }
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: Text('Delete Account'),
          ),
        ],
      ),
    );
  }
}
