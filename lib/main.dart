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

  // 🚨 CRITICAL: Enhanced error handling for mobile browsers
  ErrorWidget.builder = (FlutterErrorDetails details) {
    if (!_hasShownError) {
      _hasShownError = true;

      // Reset flag after 3 seconds
      Future.delayed(const Duration(seconds: 3), () {
        _hasShownError = false;
      });

      // Enhanced error widget for mobile
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
    return const SizedBox.shrink();
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
            builder: (context, orientation, screenType) {
              return MaterialApp(
                title: 'Greenofig - Health & Wellness',
                theme: AppTheme.lightTheme,
                darkTheme: AppTheme.darkTheme,
                themeMode: ThemeMode.dark, // Force dark theme for consistency

                // 🚨 CRITICAL: Enhanced MediaQuery for mobile browsers
                builder: (context, child) {
                  // Get device pixel ratio and screen size for better mobile handling
                  final mediaQuery = MediaQuery.of(context);
                  final screenWidth = mediaQuery.size.width;
                  final screenHeight = mediaQuery.size.height;
                  final devicePixelRatio = mediaQuery.devicePixelRatio;

                  // Calculate optimal text scaling for mobile devices
                  double textScaleFactor = 1.0;
                  if (kIsWeb) {
                    // For web/mobile browsers, use responsive scaling
                    if (screenWidth < 400) {
                      textScaleFactor = 0.85; // Smaller phones
                    } else if (screenWidth < 600) {
                      textScaleFactor = 0.9; // Medium phones
                    } else if (screenWidth < 900) {
                      textScaleFactor = 0.95; // Large phones/small tablets
                    } else {
                      textScaleFactor = 1.0; // Tablets and desktop
                    }
                  }

                  return MediaQuery(
                    data: mediaQuery.copyWith(
                      textScaler: TextScaler.linear(textScaleFactor),
                      // Ensure proper viewport handling on mobile browsers
                      size: Size(
                        screenWidth,
                        screenHeight,
                      ),
                      // Fix device pixel ratio issues on some mobile browsers
                      devicePixelRatio:
                          devicePixelRatio > 3.0 ? 3.0 : devicePixelRatio,
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
