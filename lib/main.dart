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

    // ALWAYS show detailed errors to help debugging
    // Even in web release mode, we need to see what's wrong
    return Material(
      color: Colors.black87,
      child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.grey[900],
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.red, width: 2),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.bug_report, color: Colors.red, size: 32),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Error Detected',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.red.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    details.exception.toString(),
                    style: TextStyle(
                      color: Colors.red[300],
                      fontSize: 14,
                      fontFamily: 'monospace',
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  'This error is being displayed to help with debugging. Please:',
                  style: TextStyle(
                    color: Colors.grey[300],
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '1. Take a screenshot of this error\n'
                  '2. Check the browser console (F12)\n'
                  '3. Try refreshing the page',
                  style: TextStyle(
                    color: Colors.grey[400],
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
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
