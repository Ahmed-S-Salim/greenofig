import 'dart:async';
import 'package:flutter/foundation.dart';

/// Simple authentication service that works without backend
/// Stores auth state in memory for demo purposes
class SimpleAuthService {
  static SimpleAuthService? _instance;
  static SimpleAuthService get instance {
    _instance ??= SimpleAuthService._internal();
    return _instance!;
  }

  SimpleAuthService._internal();

  // Stream controller for auth state changes
  final StreamController<bool> _authStateController =
      StreamController<bool>.broadcast();

  // Current user data
  Map<String, dynamic>? _currentUser;
  bool _isAuthenticated = false;

  // Mock credentials
  static const Map<String, Map<String, dynamic>> _mockUsers = {
    'admin@greenofig.com': {
      'email': 'admin@greenofig.com',
      'password': 'admin123',
      'name': 'Admin User',
      'role': 'admin',
      'isAdmin': true,
    },
    'user@greenofig.com': {
      'email': 'user@greenofig.com',
      'password': 'user123',
      'name': 'Regular User',
      'role': 'basic_user',
      'isAdmin': false,
    },
    'demo@greenofig.com': {
      'email': 'demo@greenofig.com',
      'password': 'demo123',
      'name': 'Demo User',
      'role': 'premium_user',
      'isAdmin': false,
    },
  };

  /// Sign in with email and password
  Future<bool> signIn(String email, String password) async {
    try {
      debugPrint('🔐 Attempting sign in for: $email');

      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 500));

      final normalizedEmail = email.trim().toLowerCase();

      // Check if user exists and password matches
      if (_mockUsers.containsKey(normalizedEmail)) {
        final userData = _mockUsers[normalizedEmail]!;

        if (userData['password'] == password) {
          // Set current user (excluding password)
          _currentUser = {
            'email': userData['email'],
            'name': userData['name'],
            'role': userData['role'],
            'isAdmin': userData['isAdmin'],
          };

          _isAuthenticated = true;
          _authStateController.add(true);

          debugPrint('✅ Sign in successful for: $normalizedEmail');
          debugPrint('👤 User role: ${userData['role']}');
          debugPrint('🔑 Is admin: ${userData['isAdmin']}');

          return true;
        }
      }

      debugPrint('❌ Invalid credentials for: $normalizedEmail');
      return false;
    } catch (e) {
      debugPrint('❌ Sign in error: $e');
      return false;
    }
  }

  /// Sign out current user
  Future<void> signOut() async {
    debugPrint('🚪 Signing out user');
    _currentUser = null;
    _isAuthenticated = false;
    _authStateController.add(false);
    debugPrint('✅ Sign out successful');
  }

  /// Get current user
  Map<String, dynamic>? get currentUser => _currentUser;

  /// Check if user is authenticated
  bool get isAuthenticated => _isAuthenticated;

  /// Check if current user is admin
  bool get isAdmin {
    if (!_isAuthenticated || _currentUser == null) return false;
    return _currentUser!['isAdmin'] == true;
  }

  /// Get user role
  String get userRole {
    if (!_isAuthenticated || _currentUser == null) return 'guest';
    return _currentUser!['role'] ?? 'basic_user';
  }

  /// Get user name
  String get userName {
    if (!_isAuthenticated || _currentUser == null) return 'Guest';
    return _currentUser!['name'] ?? 'User';
  }

  /// Get user email
  String? get userEmail {
    if (!_isAuthenticated || _currentUser == null) return null;
    return _currentUser!['email'];
  }

  /// Stream of authentication state changes
  Stream<bool> get authStateChanges => _authStateController.stream;

  /// Dispose resources
  void dispose() {
    _authStateController.close();
  }

  /// Reset password (mock - just shows success)
  Future<bool> resetPassword(String email) async {
    debugPrint('🔐 Password reset requested for: $email');
    await Future.delayed(const Duration(milliseconds: 500));
    debugPrint('✅ Password reset email sent (mock)');
    return true;
  }

  /// Sign up new user (mock - just stores in memory temporarily)
  Future<bool> signUp(String email, String password, String name) async {
    try {
      debugPrint('📝 Attempting sign up for: $email');
      await Future.delayed(const Duration(milliseconds: 500));

      // For demo, automatically sign in the user
      _currentUser = {
        'email': email.trim().toLowerCase(),
        'name': name,
        'role': 'basic_user',
        'isAdmin': false,
      };

      _isAuthenticated = true;
      _authStateController.add(true);

      debugPrint('✅ Sign up successful for: $email');
      return true;
    } catch (e) {
      debugPrint('❌ Sign up error: $e');
      return false;
    }
  }
}
