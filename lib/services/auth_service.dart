import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter/foundation.dart';

class AuthService {
  static final SupabaseClient _client = Supabase.instance.client;
  static AuthService? _instance;

  // Singleton pattern to support both static and instance methods
  static AuthService get instance {
    _instance ??= AuthService._internal();
    return _instance!;
  }

  AuthService._internal();

  factory AuthService() {
    return instance;
  }

  // Instance getter for isLoggedIn
  bool get isLoggedIn => isAuthenticated;

  // Enhanced sign in with better error handling for admin credentials
  static Future<AuthResponse> signIn(String email, String password) async {
    try {
      debugPrint('🔐 Attempting sign in for: $email');

      // Validate admin credentials specifically
      if (email.trim().toLowerCase() == 'admin@greenofig.com') {
        debugPrint('🔑 Admin login detected');
      }

      final response = await _client.auth.signInWithPassword(
        email: email.trim(),
        password: password,
      );

      if (response.user != null) {
        debugPrint('✅ Sign in successful for: ${response.user!.email}');

        // Handle admin user setup
        if (email.trim().toLowerCase() == 'admin@greenofig.com') {
          await _setupAdminUser(response.user!);
        }
      } else {
        debugPrint('❌ Sign in failed: No user returned');
        throw Exception('Authentication failed: Invalid credentials');
      }

      return response;
    } catch (error) {
      debugPrint('❌ Sign in error: $error');

      // Enhanced error messages for common issues
      String errorMessage = 'Sign in failed';

      if (error.toString().contains('Invalid login credentials')) {
        if (email.trim().toLowerCase() == 'admin@greenofig.com') {
          errorMessage =
              'Admin credentials are incorrect. Please check your password.';
        } else {
          errorMessage = 'Invalid email or password. Please try again.';
        }
      } else if (error.toString().contains('Email not confirmed')) {
        errorMessage = 'Please confirm your email address before signing in.';
      } else if (error.toString().contains('Too many requests')) {
        errorMessage =
            'Too many login attempts. Please wait a moment and try again.';
      } else if (error.toString().contains('Network')) {
        errorMessage =
            'Network error. Please check your connection and try again.';
      }

      throw Exception(errorMessage);
    }
  }

  // Setup admin user profile
  static Future<void> _setupAdminUser(User user) async {
    try {
      // Check if admin profile exists
      final existingProfile = await _client
          .from('user_profiles')
          .select()
          .eq('id', user.id)
          .maybeSingle();

      if (existingProfile == null) {
        // Create admin profile
        await _client.from('user_profiles').upsert({
          'id': user.id,
          'email': user.email,
          'full_name': 'Admin User',
          'role': 'admin',
          'is_admin': true,
          'created_at': DateTime.now().toIso8601String(),
          'updated_at': DateTime.now().toIso8601String(),
        });
        debugPrint('✅ Admin profile created');
      } else {
        debugPrint('✅ Admin profile already exists');
      }
    } catch (e) {
      debugPrint('⚠️ Admin profile setup error: $e');
      // Don't throw error as login was successful
    }
  }

  // Enhanced sign up with better validation
  static Future<AuthResponse> signUp(
    String email,
    String password, {
    String? fullName,
    String? role,
  }) async {
    try {
      debugPrint('📝 Attempting sign up for: $email');

      // Validate inputs
      if (email.isEmpty || password.isEmpty) {
        throw Exception('Email and password are required');
      }

      if (password.length < 6) {
        throw Exception('Password must be at least 6 characters long');
      }

      final response = await _client.auth.signUp(
        email: email.trim(),
        password: password,
        data: {
          'full_name': fullName ?? email.split('@')[0],
          'role': role ?? 'basic_user',
          'created_at': DateTime.now().toIso8601String(),
        },
      );

      if (response.user != null) {
        debugPrint('✅ Sign up successful for: ${response.user!.email}');
      }

      return response;
    } catch (error) {
      debugPrint('❌ Sign up error: $error');

      String errorMessage = 'Sign up failed';

      if (error.toString().contains('User already registered')) {
        errorMessage =
            'An account with this email already exists. Please sign in instead.';
      } else if (error.toString().contains('Password should be at least')) {
        errorMessage = 'Password must be at least 6 characters long.';
      } else if (error.toString().contains('Unable to validate email')) {
        errorMessage = 'Please enter a valid email address.';
      }

      throw Exception(errorMessage);
    }
  }

  // Enhanced Google Sign-In with better error handling
  static Future<bool> signInWithGoogle() async {
    try {
      debugPrint('🔐 Attempting Google sign in');

      if (kIsWeb) {
        return await _signInWithGoogleWeb();
      } else {
        // For native platforms, use OAuth flow
        final result = await _client.auth.signInWithOAuth(
          OAuthProvider.google,
          redirectTo: 'https://greenofig.com/auth/callback',
        );
        return result;
      }
    } catch (error) {
      debugPrint('❌ Google sign in error: $error');

      String errorMessage = 'Google sign in failed';

      if (error.toString().contains('popup_blocked')) {
        errorMessage = 'Pop-up blocked. Please allow pop-ups and try again.';
      } else if (error.toString().contains('access_denied')) {
        errorMessage = 'Google sign in was cancelled.';
      } else if (error.toString().contains('network')) {
        errorMessage = 'Network error. Please check your connection.';
      }

      throw Exception(errorMessage);
    }
  }

  static Future<bool> _signInWithGoogleWeb() async {
    try {
      final success = await _client.auth.signInWithOAuth(
        OAuthProvider.google,
        redirectTo: kDebugMode
            ? 'http://localhost:3000/auth/callback'
            : 'https://greenofig.com/auth/callback',
      );
      debugPrint(success
          ? '✅ Google web sign in successful'
          : '❌ Google web sign in failed');
      return success;
    } catch (e) {
      debugPrint('❌ Google web sign in error: $e');
      rethrow;
    }
  }

  // Enhanced sign out with cleanup
  static Future<void> signOut() async {
    try {
      debugPrint('🚪 Signing out user');
      await _client.auth.signOut();
      debugPrint('✅ Sign out successful');
    } catch (error) {
      debugPrint('❌ Sign out error: $error');
      throw Exception('Sign out failed: $error');
    }
  }

  // Get current user with null safety
  static User? getCurrentUser() {
    final user = _client.auth.currentUser;
    if (user != null) {
      debugPrint('👤 Current user: ${user.email}');
    }
    return user;
  }

  // Get current session with null safety
  static Session? getCurrentSession() {
    final session = _client.auth.currentSession;
    return session;
  }

  // Enhanced authentication check
  static bool get isAuthenticated {
    final user = getCurrentUser();
    final isAuth = user != null;
    debugPrint('🔍 Authentication status: $isAuth');
    return isAuth;
  }

  // Listen to auth state changes
  static Stream<AuthState> get authStateChanges {
    return _client.auth.onAuthStateChange;
  }

  // Enhanced password reset
  static Future<void> resetPassword(String email) async {
    try {
      debugPrint('🔐 Attempting password reset for: $email');
      await _client.auth.resetPasswordForEmail(
        email.trim(),
        redirectTo: kDebugMode
            ? 'http://localhost:3000/auth/reset-password'
            : 'https://greenofig.com/auth/reset-password',
      );
      debugPrint('✅ Password reset email sent');
    } catch (error) {
      debugPrint('❌ Password reset error: $error');
      throw Exception('Password reset failed: $error');
    }
  }

  // Enhanced profile update
  static Future<UserResponse> updateProfile({
    String? email,
    String? password,
    Map<String, dynamic>? data,
  }) async {
    try {
      debugPrint('📝 Updating user profile');

      final response = await _client.auth.updateUser(
        UserAttributes(
          email: email?.trim(),
          password: password,
          data: {
            ...?data,
            'updated_at': DateTime.now().toIso8601String(),
          },
        ),
      );

      debugPrint('✅ Profile update successful');
      return response;
    } catch (error) {
      debugPrint('❌ Profile update error: $error');
      throw Exception('Profile update failed: $error');
    }
  }

  // Enhanced user profile retrieval
  static Future<Map<String, dynamic>?> getUserProfile() async {
    try {
      final user = getCurrentUser();
      if (user == null) {
        debugPrint('❌ No authenticated user for profile retrieval');
        return null;
      }

      debugPrint('🔍 Fetching profile for user: ${user.id}');

      final response = await _client
          .from('user_profiles')
          .select()
          .eq('id', user.id)
          .maybeSingle();

      if (response != null) {
        debugPrint('✅ User profile retrieved');
      } else {
        debugPrint('⚠️ No profile found, creating default profile');
        await upsertUserProfile({
          'full_name': user.email?.split('@')[0] ?? 'User',
          'role': 'basic_user',
        });

        // Retry fetching the profile
        return await _client
            .from('user_profiles')
            .select()
            .eq('id', user.id)
            .maybeSingle();
      }

      return response;
    } catch (error) {
      debugPrint('❌ Get user profile error: $error');
      throw Exception('Failed to get user profile: $error');
    }
  }

  // Enhanced profile upsert
  static Future<void> upsertUserProfile(
    Map<String, dynamic> profileData,
  ) async {
    try {
      final user = getCurrentUser();
      if (user == null) {
        throw Exception('No authenticated user');
      }

      debugPrint('📝 Upserting profile for user: ${user.id}');

      final data = {
        'id': user.id,
        'email': user.email ?? '',
        ...profileData,
        'updated_at': DateTime.now().toIso8601String(),
      };

      await _client.from('user_profiles').upsert(data);
      debugPrint('✅ Profile upsert successful');
    } catch (error) {
      debugPrint('❌ Profile upsert error: $error');
      throw Exception('Failed to update user profile: $error');
    }
  }

  // Check if email verification is required
  static bool get needsEmailVerification {
    final user = getCurrentUser();
    return user != null && user.emailConfirmedAt == null;
  }

  // Enhanced email confirmation resend
  static Future<void> resendEmailConfirmation() async {
    try {
      final user = getCurrentUser();
      if (user?.email == null) {
        throw Exception('No email found for current user');
      }

      debugPrint('📧 Resending email confirmation to: ${user!.email}');

      await _client.auth.resend(
        type: OtpType.signup,
        email: user.email!,
      );

      debugPrint('✅ Email confirmation resent');
    } catch (error) {
      debugPrint('❌ Resend confirmation error: $error');
      throw Exception('Failed to resend confirmation: $error');
    }
  }

  // Check if user is admin
  static Future<bool> isUserAdmin() async {
    try {
      final user = getCurrentUser();
      if (user == null) return false;

      final profile = await getUserProfile();
      return profile?['is_admin'] == true ||
          profile?['role'] == 'admin' ||
          user.email?.toLowerCase() == 'admin@greenofig.com';
    } catch (e) {
      debugPrint('❌ Admin check error: $e');
      return false;
    }
  }

  // Admin access helper
  static Future<bool> hasAdminAccess() async {
    try {
      final user = getCurrentUser();
      if (user == null) return false;

      // Check if email is admin email
      if (user.email?.toLowerCase() == 'admin@greenofig.com') {
        return true;
      }

      // Check database profile
      return await isUserAdmin();
    } catch (e) {
      debugPrint('❌ Admin access check error: $e');
      return false;
    }
  }
}
