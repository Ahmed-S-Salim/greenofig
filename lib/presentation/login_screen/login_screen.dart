import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:sizer/sizer.dart';

import '../../core/app_export.dart';
import '../../services/auth_service.dart';
import './widgets/custom_text_field.dart';
import './widgets/social_login_button.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _signIn() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      await AuthService.signIn(
        _emailController.text.trim(),
        _passwordController.text,
      );

      if (mounted) {
        Navigator.pushReplacementNamed(context, AppRoutes.dashboardHome);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Sign in failed: ${e.toString()}'),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _signInWithGoogle() async {
    setState(() => _isLoading = true);

    try {
      final success = await AuthService.signInWithGoogle();
      if (success && mounted) {
        Navigator.pushReplacementNamed(context, AppRoutes.dashboardHome);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Google sign in failed: ${e.toString()}'),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showForgotPasswordDialog() {
    final resetEmailController = TextEditingController();

    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          title: Text(
            'Reset Password',
            style: GoogleFonts.inter(
              fontWeight: FontWeight.w600,
            ),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Enter your email address and we\'ll send you a link to reset your password.',
                style: GoogleFonts.inter(fontSize: 13.sp),
              ),
              SizedBox(height: 2.h),
              CustomTextField(
                controller: resetEmailController,
                labelText: 'Email Address',
                hintText: 'Enter your email',
                keyboardType: TextInputType.emailAddress,
                prefixIcon: Icons.email_outlined,
                validator: (value) {
                  if (value?.isEmpty ?? true) return 'Email is required';
                  if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$')
                      .hasMatch(value!)) {
                    return 'Enter a valid email';
                  }
                  return null;
                },
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                resetEmailController.dispose();
                Navigator.of(dialogContext).pop();
              },
              child: Text(
                'Cancel',
                style: GoogleFonts.inter(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
              ),
            ),
            ElevatedButton(
              onPressed: () async {
                final email = resetEmailController.text.trim();
                if (email.isNotEmpty) {
                  try {
                    await AuthService.resetPassword(email);
                    resetEmailController.dispose();
                    Navigator.of(dialogContext).pop();

                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Password reset email sent! Check your inbox.'),
                          backgroundColor: Theme.of(context).colorScheme.tertiary,
                          duration: Duration(seconds: 4),
                        ),
                      );
                    }
                  } catch (e) {
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Failed to send reset email: ${e.toString()}'),
                          backgroundColor: Theme.of(context).colorScheme.error,
                        ),
                      );
                    }
                  }
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Theme.of(context).colorScheme.primary,
              ),
              child: Text(
                'Send Reset Link',
                style: GoogleFonts.inter(fontWeight: FontWeight.w600),
              ),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 4.h),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                SizedBox(height: 8.h),

                // Logo Section
                Container(
                  width: 35.w,
                  height: 35.w,
                  decoration: BoxDecoration(
                    color: Colors.transparent,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: theme.colorScheme.primary.withAlpha(77),
                        blurRadius: 30,
                        spreadRadius: 5,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: ClipOval(
                    child: Image.asset(
                      'assets/images/Remove_background_project-1760377849271.png',
                      width: 35.w,
                      height: 35.w,
                      fit: BoxFit.contain,
                      semanticLabel:
                          'Professional Greenofig logo featuring stylized G with organic tree and root system design conveying growth and natural wellness themes',
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: [
                                theme.colorScheme.primary,
                                theme.colorScheme.secondary,
                              ],
                            ),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            Icons.eco,
                            size: 12.w,
                            color: Colors.white,
                          ),
                        );
                      },
                    ),
                  ),
                ),

                SizedBox(height: 4.h),

                // Welcome Text
                Text(
                  'Welcome Back',
                  style: GoogleFonts.inter(
                    fontSize: 28.sp,
                    fontWeight: FontWeight.w700,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
                SizedBox(height: 1.h),
                Text(
                  'Sign in to access your health dashboard',
                  style: GoogleFonts.inter(
                    fontSize: 14.sp,
                    fontWeight: FontWeight.w400,
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                  textAlign: TextAlign.center,
                ),

                SizedBox(height: 4.h),

                // Email Field
                CustomTextField(
                  controller: _emailController,
                  labelText: 'Email Address',
                  hintText: 'Enter your email for health tracking',
                  keyboardType: TextInputType.emailAddress,
                  prefixIcon: Icons.email_outlined,
                  validator: (value) {
                    if (value?.isEmpty ?? true) return 'Email is required';
                    if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$')
                        .hasMatch(value!)) {
                      return 'Enter a valid email address';
                    }
                    return null;
                  },
                ),

                SizedBox(height: 2.h),

                // Password Field
                CustomTextField(
                  controller: _passwordController,
                  labelText: 'Password',
                  hintText: 'Enter secure password',
                  obscureText: _obscurePassword,
                  prefixIcon: Icons.lock_outline,
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscurePassword
                          ? Icons.visibility_off
                          : Icons.visibility,
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                    onPressed: () {
                      setState(() => _obscurePassword = !_obscurePassword);
                    },
                  ),
                  validator: (value) {
                    if (value?.isEmpty ?? true) return 'Password is required';
                    if (value!.length < 6)
                      return 'Password must be at least 6 characters';
                    return null;
                  },
                ),

                SizedBox(height: 1.h),

                // Forgot Password
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: _isLoading ? null : _showForgotPasswordDialog,
                    child: Text(
                      'Forgot Password?',
                      style: GoogleFonts.inter(
                        fontSize: 13.sp,
                        fontWeight: FontWeight.w500,
                        color: theme.colorScheme.primary,
                      ),
                    ),
                  ),
                ),

                SizedBox(height: 3.h),

                // Sign In Button
                SizedBox(
                  width: double.infinity,
                  height: 6.h,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _signIn,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: theme.colorScheme.primary,
                      foregroundColor: theme.colorScheme.onPrimary,
                      elevation: 2,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: _isLoading
                        ? SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                theme.colorScheme.onPrimary,
                              ),
                            ),
                          )
                        : Text(
                            'Sign In',
                            style: GoogleFonts.inter(
                              fontSize: 16.sp,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                  ),
                ),

                SizedBox(height: 3.h),

                // Divider
                Row(
                  children: [
                    Expanded(
                      child: Divider(
                        color: theme.dividerColor,
                        thickness: 1,
                      ),
                    ),
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 4.w),
                      child: Text(
                        'OR',
                        style: GoogleFonts.inter(
                          fontSize: 12.sp,
                          fontWeight: FontWeight.w500,
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ),
                    Expanded(
                      child: Divider(
                        color: theme.dividerColor,
                        thickness: 1,
                      ),
                    ),
                  ],
                ),

                SizedBox(height: 3.h),

                // Google Sign In Button
                SocialLoginButton(
                  onPressed: _isLoading ? null : _signInWithGoogle,
                  icon: Icons.g_mobiledata,
                  text: 'Continue with Google',
                  backgroundColor:
                      isDark ? theme.colorScheme.surface : Colors.white,
                  textColor: theme.colorScheme.onSurface,
                  borderColor: theme.colorScheme.outline,
                ),

                SizedBox(height: 4.h),

                // Sign Up Link
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'Don\'t have an account? ',
                      style: GoogleFonts.inter(
                        fontSize: 14.sp,
                        fontWeight: FontWeight.w400,
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                    TextButton(
                      onPressed: _isLoading
                          ? null
                          : () {
                              Navigator.pushNamed(
                                  context, AppRoutes.authenticationScreen);
                            },
                      child: Text(
                        'Sign Up',
                        style: GoogleFonts.inter(
                          fontSize: 14.sp,
                          fontWeight: FontWeight.w600,
                          color: theme.colorScheme.primary,
                        ),
                      ),
                    ),
                  ],
                ),

                SizedBox(height: 4.h),

                // Demo Credentials Section
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
                      Text(
                        'Demo Credentials',
                        style: GoogleFonts.inter(
                          fontSize: 14.sp,
                          fontWeight: FontWeight.w600,
                          color: theme.colorScheme.primary,
                        ),
                      ),
                      SizedBox(height: 1.h),
                      _buildCredentialRow(
                        'Admin: admin@greenofig.com / password123',
                        theme,
                      ),
                      SizedBox(height: 0.5.h),
                      _buildCredentialRow(
                        'User: user@greenofig.com / password123',
                        theme,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCredentialRow(String text, ThemeData theme) {
    return Row(
      children: [
        Expanded(
          child: Text(
            text,
            style: GoogleFonts.inter(
              fontSize: 12.sp,
              fontWeight: FontWeight.w400,
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
        ),
        IconButton(
          icon: Icon(
            Icons.copy,
            size: 16,
            color: theme.colorScheme.primary,
          ),
          onPressed: () async {
            // Extract credentials from the text
            final credentials = text.split(': ').last;
            await Clipboard.setData(ClipboardData(text: credentials));

            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Credentials copied to clipboard!'),
                  backgroundColor: theme.colorScheme.primary,
                  duration: Duration(seconds: 2),
                  behavior: SnackBarBehavior.floating,
                ),
              );
            }
          },
        ),
      ],
    );
  }
}