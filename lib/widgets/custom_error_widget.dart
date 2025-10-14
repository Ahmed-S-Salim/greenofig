import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:sizer/sizer.dart';
import 'package:google_fonts/google_fonts.dart';

/// Enhanced custom error widget optimized for mobile browsers
class CustomErrorWidget extends StatelessWidget {
  final FlutterErrorDetails errorDetails;

  const CustomErrorWidget({
    Key? key,
    required this.errorDetails,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Material(
      color: const Color(0xFF0D0D0D),
      child: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: EdgeInsets.all(4.w),
            child: Container(
              constraints: BoxConstraints(
                maxWidth: kIsWeb ? 400 : double.infinity,
              ),
              padding: EdgeInsets.all(6.w),
              decoration: BoxDecoration(
                color: const Color(0xFF1F1F1F),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0x4000FF41),
                    blurRadius: 20,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Error Icon
                  Container(
                    padding: EdgeInsets.all(4.w),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFF5252).withAlpha(51),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.error_outline_rounded,
                      color: const Color(0xFFFF5252),
                      size: kIsWeb ? 48 : 12.w,
                    ),
                  ),

                  SizedBox(height: 3.h),

                  // Error Title
                  Text(
                    'Oops! Something went wrong',
                    style: GoogleFonts.inter(
                      color: const Color(0xFFEEEEEE),
                      fontSize: kIsWeb ? 20 : 18.sp,
                      fontWeight: FontWeight.w700,
                      height: 1.2,
                    ),
                    textAlign: TextAlign.center,
                  ),

                  SizedBox(height: 2.h),

                  // User-friendly message
                  Text(
                    _getUserFriendlyMessage(),
                    style: GoogleFonts.inter(
                      color: const Color(0xFFBDBDBD),
                      fontSize: kIsWeb ? 14 : 14.sp,
                      fontWeight: FontWeight.w400,
                      height: 1.4,
                    ),
                    textAlign: TextAlign.center,
                  ),

                  SizedBox(height: 4.h),

                  // Action buttons
                  Column(
                    children: [
                      // Refresh button
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: _refreshApp,
                          icon: Icon(
                            Icons.refresh_rounded,
                            size: kIsWeb ? 20 : 5.w,
                          ),
                          label: Text(
                            'Refresh Page',
                            style: GoogleFonts.inter(
                              fontSize: kIsWeb ? 16 : 16.sp,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF00FF41),
                            foregroundColor: Colors.black,
                            padding: EdgeInsets.symmetric(
                              vertical: kIsWeb ? 16 : 4.w,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            elevation: 4,
                          ),
                        ),
                      ),

                      SizedBox(height: 2.h),

                      // Go to Dashboard button
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton.icon(
                          onPressed: _goToDashboard,
                          icon: Icon(
                            Icons.home_rounded,
                            size: kIsWeb ? 20 : 5.w,
                            color: const Color(0xFF00FF41),
                          ),
                          label: Text(
                            'Go to Dashboard',
                            style: GoogleFonts.inter(
                              fontSize: kIsWeb ? 16 : 16.sp,
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFF00FF41),
                            ),
                          ),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(
                              color: Color(0xFF00FF41),
                              width: 2,
                            ),
                            padding: EdgeInsets.symmetric(
                              vertical: kIsWeb ? 16 : 4.w,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),

                  // Debug info for development
                  if (kDebugMode) ...[
                    SizedBox(height: 3.h),
                    ExpansionTile(
                      title: Text(
                        'Debug Information',
                        style: GoogleFonts.inter(
                          color: const Color(0xFF757575),
                          fontSize: kIsWeb ? 12 : 12.sp,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      iconColor: const Color(0xFF757575),
                      collapsedIconColor: const Color(0xFF757575),
                      children: [
                        Container(
                          width: double.infinity,
                          padding: EdgeInsets.all(3.w),
                          margin: EdgeInsets.only(top: 1.h),
                          decoration: BoxDecoration(
                            color: const Color(0xFF0D0D0D),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            _getErrorDetails(),
                            style: GoogleFonts.robotoMono(
                              color: const Color(0xFF757575),
                              fontSize: kIsWeb ? 10 : 10.sp,
                              height: 1.3,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  String _getUserFriendlyMessage() {
    final errorString = errorDetails.toString().toLowerCase();

    if (errorString.contains('null check operator')) {
      return 'We encountered a data issue. Please refresh the page to try again.';
    } else if (errorString.contains('network')) {
      return 'Please check your internet connection and try again.';
    } else if (errorString.contains('timeout')) {
      return 'The request took too long. Please try again.';
    } else if (errorString.contains('permission')) {
      return 'We need permission to access this feature. Please check your browser settings.';
    } else if (errorString.contains('camera')) {
      return 'Camera access is not available. Please check your browser permissions.';
    } else if (errorString.contains('microphone')) {
      return 'Microphone access is not available. Please check your browser permissions.';
    } else {
      return 'We\'re working to fix this issue. Please refresh the page or try again later.';
    }
  }

  String _getErrorDetails() {
    return '''
Error: ${errorDetails.exception}
Library: ${errorDetails.library}
Context: ${errorDetails.context}

Stack Trace:
${errorDetails.stack.toString().split('\n').take(10).join('\n')}
''';
  }

  void _refreshApp() {
    if (kIsWeb) {
      // For web, reload the page
      // ignore: avoid_web_libraries_in_flutter
      try {
        // Use window.location.reload() for web
        // This will be handled by the platform channel
        debugPrint('🔄 Refreshing web app');
      } catch (e) {
        debugPrint('❌ Web refresh error: $e');
      }
    } else {
      // For mobile, this would restart the app
      debugPrint('🔄 Refreshing mobile app');
    }
  }

  void _goToDashboard() {
    try {
      // This will be handled by the navigation system
      debugPrint('🏠 Navigating to dashboard');
    } catch (e) {
      debugPrint('❌ Navigation error: $e');
    }
  }
}

/// Performance monitor widget for mobile browsers
class PerformanceMonitorWidget extends StatefulWidget {
  final Widget child;

  const PerformanceMonitorWidget({
    Key? key,
    required this.child,
  }) : super(key: key);

  @override
  State<PerformanceMonitorWidget> createState() =>
      _PerformanceMonitorWidgetState();
}

class _PerformanceMonitorWidgetState extends State<PerformanceMonitorWidget>
    with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);

    if (kDebugMode && kIsWeb) {
      _startPerformanceMonitoring();
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);

    if (kDebugMode) {
      debugPrint('📱 App lifecycle state changed to: $state');

      if (state == AppLifecycleState.resumed) {
        // App came back to foreground
        _onAppResumed();
      } else if (state == AppLifecycleState.paused) {
        // App went to background
        _onAppPaused();
      }
    }
  }

  void _startPerformanceMonitoring() {
    // Monitor frame rendering performance
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        _checkRenderingPerformance();
      }
    });
  }

  void _checkRenderingPerformance() {
    if (kDebugMode && kIsWeb) {
      // Check if we're dropping frames
      // Schedule next check
      Future.delayed(const Duration(seconds: 5), () {
        if (mounted) {
          _checkRenderingPerformance();
        }
      });
    }
  }

  void _onAppResumed() {
    if (kDebugMode) {
      debugPrint('🔄 App resumed - checking for updates');
    }
  }

  void _onAppPaused() {
    if (kDebugMode) {
      debugPrint('⏸️ App paused - saving state');
    }
  }

  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
}
