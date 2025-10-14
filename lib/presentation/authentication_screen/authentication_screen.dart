import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:sizer/sizer.dart';

import '../../core/app_export.dart';
import '../../core/image_constants.dart';
import '../../services/simple_auth_service.dart';
import './widgets/biometric_prompt.dart';
import './widgets/custom_text_field.dart';
import './widgets/social_login_button.dart';

class AuthenticationScreen extends StatefulWidget {
  const AuthenticationScreen({super.key});

  @override
  State<AuthenticationScreen> createState() => _AuthenticationScreenState();
}

class _AuthenticationScreenState extends State<AuthenticationScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  bool _isLoading = false;
  bool _isFormValid = false;
  bool _showBiometricPrompt = false;

  // Mock credentials for demonstration
  final Map<String, String> _mockCredentials = {
    'admin@greenofig.com': 'admin123',
    'user@greenofig.com': 'user123',
    'demo@greenofig.com': 'demo123',
  };

  @override
  void initState() {
    super.initState();
    _emailController.addListener(_validateForm);
    _passwordController.addListener(_validateForm);
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _validateForm() {
    final isValid = _emailController.text.isNotEmpty &&
        _passwordController.text.isNotEmpty &&
        _isValidEmail(_emailController.text);

    if (_isFormValid != isValid) {
      setState(() {
        _isFormValid = isValid;
      });
    }
  }

  bool _isValidEmail(String email) {
    return RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}\$').hasMatch(email);
  }

  String? _validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter your email address';
    }
    if (!_isValidEmail(value)) {
      return 'Please enter a valid email address for your health account';
    }
    return null;
  }

  String? _validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter your password';
    }
    if (value.length < 6) {
      return 'Password must be at least 6 characters for security';
    }
    return null;
  }

  Future<void> _signIn() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final email = _emailController.text.trim();
      final password = _passwordController.text;

      // Use SimpleAuthService to sign in
      final success = await SimpleAuthService.instance.signIn(email, password);

      if (success) {
        HapticFeedback.lightImpact();

        // Show success message
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'Welcome back to Greenofig! Your health journey continues.',
                style: AppTheme.lightTheme.textTheme.bodyMedium?.copyWith(
                  color: AppTheme.lightTheme.colorScheme.onPrimary,
                ),
              ),
              backgroundColor: AppTheme.lightTheme.colorScheme.primary,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          );
        }

        // Show biometric prompt for future logins
        setState(() {
          _showBiometricPrompt = true;
        });
      } else {
        // Show error for invalid credentials
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'Invalid credentials. Please check your email and password.',
                style: AppTheme.lightTheme.textTheme.bodyMedium?.copyWith(
                  color: AppTheme.lightTheme.colorScheme.onError,
                ),
              ),
              backgroundColor: AppTheme.lightTheme.colorScheme.error,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Network error. Please check your connection and try again.',
              style: AppTheme.lightTheme.textTheme.bodyMedium?.copyWith(
                color: AppTheme.lightTheme.colorScheme.onError,
              ),
            ),
            backgroundColor: AppTheme.lightTheme.colorScheme.error,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _forgotPassword() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: Text(
          'Reset Password',
          style: AppTheme.lightTheme.textTheme.titleLarge?.copyWith(
            color: AppTheme.lightTheme.colorScheme.onSurface,
            fontWeight: FontWeight.w600,
          ),
        ),
        content: Text(
          'A password reset link will be sent to your registered email address. Please check your inbox and follow the instructions.',
          style: AppTheme.lightTheme.textTheme.bodyMedium?.copyWith(
            color: AppTheme.lightTheme.colorScheme.onSurfaceVariant,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Cancel',
              style: AppTheme.lightTheme.textTheme.labelLarge?.copyWith(
                color: AppTheme.lightTheme.colorScheme.onSurfaceVariant,
              ),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    'Password reset link sent to your email.',
                    style: AppTheme.lightTheme.textTheme.bodyMedium?.copyWith(
                      color: AppTheme.lightTheme.colorScheme.onPrimary,
                    ),
                  ),
                  backgroundColor: AppTheme.lightTheme.colorScheme.primary,
                  behavior: SnackBarBehavior.floating,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.lightTheme.colorScheme.primary,
              foregroundColor: AppTheme.lightTheme.colorScheme.onPrimary,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: Text(
              'Send Reset Link',
              style: AppTheme.lightTheme.textTheme.labelLarge?.copyWith(
                color: AppTheme.lightTheme.colorScheme.onPrimary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _socialLogin(String provider) {
    HapticFeedback.selectionClick();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Connecting to $provider with health data permissions...',
          style: AppTheme.lightTheme.textTheme.bodyMedium?.copyWith(
            color: AppTheme.lightTheme.colorScheme.onPrimary,
          ),
        ),
        backgroundColor: AppTheme.lightTheme.colorScheme.primary,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }

  void _navigateToSignUp() {
    Navigator.pushNamed(context, '/onboarding-flow');
  }

  void _onBiometricSuccess() {
    setState(() {
      _showBiometricPrompt = false;
    });
    Navigator.pushReplacementNamed(context, '/dashboard-home');
  }

  void _onBiometricCancel() {
    setState(() {
      _showBiometricPrompt = false;
    });
    Navigator.pushReplacementNamed(context, '/dashboard-home');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.lightTheme.scaffoldBackgroundColor,
      body: SafeArea(
        child: Stack(
          children: [
            SingleChildScrollView(
              padding: EdgeInsets.symmetric(horizontal: 6.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  SizedBox(height: 6.h),

                  // Logo Section
                  CustomImageWidget(
                    imageUrl: ImageConstant.greenofigLogo,
                    height: 20.h,
                    width: 50.w,
                    fit: BoxFit.contain,
                  ),
                  SizedBox(height: 2.h),
                  Text(
                    'Greenofig',
                    style:
                        AppTheme.lightTheme.textTheme.headlineMedium?.copyWith(
                      color: AppTheme.lightTheme.colorScheme.primary,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  SizedBox(height: 1.h),
                  Text(
                    'Your AI-Powered Health Companion',
                    style: AppTheme.lightTheme.textTheme.bodyLarge?.copyWith(
                      color: AppTheme.lightTheme.colorScheme.onSurfaceVariant,
                    ),
                    textAlign: TextAlign.center,
                  ),

                  SizedBox(height: 6.h),

                  // Sign In Form
                  Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Welcome Back',
                          style: AppTheme.lightTheme.textTheme.headlineSmall
                              ?.copyWith(
                            color: AppTheme.lightTheme.colorScheme.onSurface,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        SizedBox(height: 1.h),
                        Text(
                          'Sign in to continue your wellness journey',
                          style: AppTheme.lightTheme.textTheme.bodyMedium
                              ?.copyWith(
                            color: AppTheme
                                .lightTheme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                        SizedBox(height: 4.h),

                        // Email Field
                        CustomTextField(
                          label: 'Email Address',
                          hint: 'Enter your email',
                          iconName: 'email',
                          keyboardType: TextInputType.emailAddress,
                          controller: _emailController,
                          validator: _validateEmail,
                          onChanged: _validateForm,
                        ),
                        SizedBox(height: 3.h),

                        // Password Field
                        CustomTextField(
                          label: 'Password',
                          hint: 'Enter your password',
                          iconName: 'lock',
                          isPassword: true,
                          controller: _passwordController,
                          validator: _validatePassword,
                          onChanged: _validateForm,
                        ),
                        SizedBox(height: 2.h),

                        // Forgot Password Link
                        Align(
                          alignment: Alignment.centerRight,
                          child: TextButton(
                            onPressed: _forgotPassword,
                            style: TextButton.styleFrom(
                              padding: EdgeInsets.symmetric(
                                  horizontal: 2.w, vertical: 1.h),
                            ),
                            child: Text(
                              'Forgot Password?',
                              style: AppTheme.lightTheme.textTheme.bodyMedium
                                  ?.copyWith(
                                color: AppTheme.lightTheme.colorScheme.primary,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ),
                        SizedBox(height: 3.h),

                        // Sign In Button
                        SizedBox(
                          width: double.infinity,
                          height: 6.5.h,
                          child: ElevatedButton(
                            onPressed:
                                _isFormValid && !_isLoading ? _signIn : null,
                            style: ElevatedButton.styleFrom(
                              backgroundColor:
                                  AppTheme.lightTheme.colorScheme.primary,
                              foregroundColor:
                                  AppTheme.lightTheme.colorScheme.onPrimary,
                              disabledBackgroundColor: AppTheme
                                  .lightTheme.colorScheme.onSurface
                                  .withValues(alpha: 0.12),
                              elevation: _isFormValid ? 2 : 0,
                              shadowColor:
                                  AppTheme.lightTheme.colorScheme.shadow,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: _isLoading
                                ? SizedBox(
                                    width: 6.w,
                                    height: 6.w,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      valueColor: AlwaysStoppedAnimation<Color>(
                                        AppTheme
                                            .lightTheme.colorScheme.onPrimary,
                                      ),
                                    ),
                                  )
                                : Text(
                                    'Sign In',
                                    style: AppTheme
                                        .lightTheme.textTheme.labelLarge
                                        ?.copyWith(
                                      color: AppTheme
                                          .lightTheme.colorScheme.onPrimary,
                                      fontWeight: FontWeight.w600,
                                      fontSize: 16.sp,
                                    ),
                                  ),
                          ),
                        ),
                        SizedBox(height: 4.h),

                        // Divider
                        Row(
                          children: [
                            Expanded(
                              child: Divider(
                                color: AppTheme.lightTheme.colorScheme.outline,
                                thickness: 1,
                              ),
                            ),
                            Padding(
                              padding: EdgeInsets.symmetric(horizontal: 4.w),
                              child: Text(
                                'Or continue with',
                                style: AppTheme.lightTheme.textTheme.bodySmall
                                    ?.copyWith(
                                  color: AppTheme
                                      .lightTheme.colorScheme.onSurfaceVariant,
                                ),
                              ),
                            ),
                            Expanded(
                              child: Divider(
                                color: AppTheme.lightTheme.colorScheme.outline,
                                thickness: 1,
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: 3.h),

                        // Social Login Buttons
                        SocialLoginButton(
                          iconName: 'login',
                          label: 'Continue with Google',
                          onPressed: () => _socialLogin('Google'),
                        ),
                        SocialLoginButton(
                          iconName: 'apple',
                          label: 'Continue with Apple',
                          onPressed: () => _socialLogin('Apple'),
                        ),
                        SocialLoginButton(
                          iconName: 'facebook',
                          label: 'Continue with Facebook',
                          onPressed: () => _socialLogin('Facebook'),
                        ),
                        SizedBox(height: 4.h),

                        // Sign Up Link
                        Center(
                          child: TextButton(
                            onPressed: _navigateToSignUp,
                            style: TextButton.styleFrom(
                              padding: EdgeInsets.symmetric(
                                  horizontal: 4.w, vertical: 2.h),
                            ),
                            child: RichText(
                              text: TextSpan(
                                text: 'New to Greenofig? ',
                                style: AppTheme.lightTheme.textTheme.bodyMedium
                                    ?.copyWith(
                                  color: AppTheme
                                      .lightTheme.colorScheme.onSurfaceVariant,
                                ),
                                children: [
                                  TextSpan(
                                    text: 'Sign Up',
                                    style: AppTheme
                                        .lightTheme.textTheme.bodyMedium
                                        ?.copyWith(
                                      color: AppTheme
                                          .lightTheme.colorScheme.primary,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                        SizedBox(height: 4.h),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Biometric Prompt Overlay
            if (_showBiometricPrompt)
              Container(
                color: Colors.black.withValues(alpha: 0.5),
                child: Center(
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: 8.w),
                    child: BiometricPrompt(
                      onSuccess: _onBiometricSuccess,
                      onCancel: _onBiometricCancel,
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
