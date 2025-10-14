import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:sizer/sizer.dart';

import './providers/theme_provider.dart';
import './services/supabase_service.dart';
import 'core/app_export.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Supabase with error handling
  try {
    await SupabaseService.initialize();
    debugPrint('✅ Supabase initialized successfully');
  } catch (e) {
    debugPrint('❌ Failed to initialize Supabase: $e');
  }

  bool _hasShownError = false;

  // 🚨 CRITICAL: Enhanced error handling with better debugging
  ErrorWidget.builder = (FlutterErrorDetails details) {
    // Log error details for debugging
    debugPrint('⚠️ Flutter Error: ${details.exception}');
    debugPrint('📍 Stack: ${details.stack}');

    if (!_hasShownError) {
      _hasShownError = true;

      // Reset flag after 3 seconds
      Future.delayed(const Duration(seconds: 3), () {
        _hasShownError = false;
      });

      // Only show error widget in release mode
      // In debug mode, show the actual error
      if (kReleaseMode) {
        return Material(
          color: Colors.black87,
          child: SafeArea(
            child: Center(
              child: Container(
                margin: const EdgeInsets.all(16),
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.grey[900],
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.error_outline, color: Colors.red, size: 48),
                    const SizedBox(height: 16),
                    Text(
                      'Something went wrong',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Please refresh the page',
                      style: TextStyle(
                        color: Colors.grey[300],
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      }
    }

    // In debug mode or after first error, show default error widget
    return ErrorWidget(details.exception);
  };

  // Enhanced orientation handling for mobile browsers
  if (!kIsWeb) {
    await SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);
  }

  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
      ],
      child: Consumer<ThemeProvider>(
        builder: (context, themeProvider, child) {
          return Sizer(
            builder: (context, orientation, deviceType) {
              return MaterialApp(
                title: 'Greenofig - Health & Wellness',
                theme: AppTheme.lightTheme,
                darkTheme: AppTheme.darkTheme,
                themeMode: ThemeMode.dark, // Force dark theme for consistency

                // 🚨 CRITICAL: Enhanced MediaQuery for mobile browsers
                builder: (context, child) {
                  // Get device media query
                  final mediaQuery = MediaQuery.of(context);

                  // NO text scaling - use system defaults
                  // This prevents the massive zoom issue
                  return MediaQuery(
                    data: mediaQuery.copyWith(
                      textScaler: TextScaler.linear(1.0),
                    ),
                    child: child!,
                  );
                },
                // 🚨 END CRITICAL SECTION

                debugShowCheckedModeBanner: false,
                routes: AppRoutes.routes,
                initialRoute: AppRoutes.splashScreen,

                // Enhanced error handling during navigation
                onUnknownRoute: (settings) {
                  return MaterialPageRoute(
                    builder: (context) => Scaffold(
                      body: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.error_outline,
                                size: 64, color: Colors.red),
                            const SizedBox(height: 16),
                            Text(
                              'Page not found',
                              style: Theme.of(context).textTheme.headlineMedium,
                            ),
                            const SizedBox(height: 8),
                            ElevatedButton(
                              onPressed: () => Navigator.pushReplacementNamed(
                                context,
                                AppRoutes.dashboardHome,
                              ),
                              child: const Text('Go to Dashboard'),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              );
            },
          );
        },
      ),
    );
  }
}
