import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ThemeProvider extends ChangeNotifier {
  static const String _themeKey = 'theme_mode';

  ThemeMode _themeMode =
      ThemeMode.dark; // Default to dark theme as per existing design

  ThemeProvider() {
    _loadThemeFromPreferences();
  }

  ThemeMode get themeMode => _themeMode;

  bool get isDarkMode => _themeMode == ThemeMode.dark;
  bool get isLightMode => _themeMode == ThemeMode.light;
  bool get isSystemMode => _themeMode == ThemeMode.system;

  void setLightTheme() {
    _themeMode = ThemeMode.light;
    _saveThemeToPreferences();
    notifyListeners();
  }

  void setDarkTheme() {
    _themeMode = ThemeMode.dark;
    _saveThemeToPreferences();
    notifyListeners();
  }

  void setSystemTheme() {
    _themeMode = ThemeMode.system;
    _saveThemeToPreferences();
    notifyListeners();
  }

  void toggleTheme() {
    if (_themeMode == ThemeMode.light) {
      setDarkTheme();
    } else if (_themeMode == ThemeMode.dark) {
      setSystemTheme();
    } else {
      setLightTheme();
    }
  }

  String getThemeModeName() {
    switch (_themeMode) {
      case ThemeMode.light:
        return 'Light';
      case ThemeMode.dark:
        return 'Dark';
      case ThemeMode.system:
        return 'System';
    }
  }

  IconData getThemeIcon() {
    switch (_themeMode) {
      case ThemeMode.light:
        return Icons.light_mode_outlined;
      case ThemeMode.dark:
        return Icons.dark_mode_outlined;
      case ThemeMode.system:
        return Icons.brightness_auto_outlined;
    }
  }

  Future<void> _loadThemeFromPreferences() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final themeIndex = prefs.getInt(_themeKey) ?? ThemeMode.dark.index;
      _themeMode = ThemeMode.values[themeIndex];
      notifyListeners();
    } catch (e) {
      // If there's an error loading preferences, stick with dark theme default
      _themeMode = ThemeMode.dark;
    }
  }

  Future<void> _saveThemeToPreferences() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setInt(_themeKey, _themeMode.index);
    } catch (e) {
      // Silently handle save errors - theme will still work for current session
      debugPrint('Failed to save theme preference: $e');
    }
  }
}
