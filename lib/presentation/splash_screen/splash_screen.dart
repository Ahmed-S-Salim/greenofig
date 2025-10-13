import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:sizer/sizer.dart';

import '../../core/app_export.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({Key? key}) : super(key: key);

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  late AnimationController _logoAnimationController;
  late AnimationController _particleAnimationController;
  late Animation<double> _logoFloatAnimation;
  late Animation<double> _logoScaleAnimation;
  late Animation<double> _particleAnimation;

  bool _isInitialized = false;
  String _loadingText = 'Initializing health services...';
  double _loadingProgress = 0.0;

  @override
  void initState() {
    super.initState();
    _setupAnimations();
    _startInitialization();
  }

  void _setupAnimations() {
    // Logo floating animation
    _logoAnimationController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );

    _logoFloatAnimation = Tween<double>(
      begin: 0.0,
      end: 10.0,
    ).animate(CurvedAnimation(
      parent: _logoAnimationController,
      curve: Curves.easeInOut,
    ));

    _logoScaleAnimation = Tween<double>(
      begin: 0.8,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _logoAnimationController,
      curve: Curves.elasticOut,
    ));

    // Particle animation
    _particleAnimationController = AnimationController(
      duration: const Duration(seconds: 4),
      vsync: this,
    );

    _particleAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _particleAnimationController,
      curve: Curves.linear,
    ));

    // Start animations
    _logoAnimationController.repeat(reverse: true);
    _particleAnimationController.repeat();
  }

  Future<void> _startInitialization() async {
    // Set system UI overlay style based on current theme
    final isDarkTheme = Theme.of(context).brightness == Brightness.dark;

    SystemChrome.setSystemUIOverlayStyle(
      SystemUiOverlayStyle(
        statusBarColor:
            isDarkTheme ? AppTheme.backgroundDark : AppTheme.primaryDark,
        statusBarIconBrightness:
            isDarkTheme ? Brightness.light : Brightness.light,
        systemNavigationBarColor:
            isDarkTheme ? AppTheme.backgroundDark : AppTheme.primaryDark,
        systemNavigationBarIconBrightness:
            isDarkTheme ? Brightness.light : Brightness.light,
      ),
    );

    // Faster initialization steps - reduced loading time
    await _performInitializationSteps();

    // Navigate based on user state
    await _navigateToNextScreen();
  }

  Future<void> _performInitializationSteps() async {
    final steps = [
      {'text': 'Initializing services...', 'duration': 200}, // Reduced from 500
      {
        'text': 'Loading configurations...',
        'duration': 300
      }, // Reduced from 800
      {
        'text': 'Setting up wellness features...',
        'duration': 250
      }, // Reduced from 600
      {'text': 'Preparing dashboard...', 'duration': 200}, // Reduced from 700
      {'text': 'Ready!', 'duration': 150}, // Reduced from 400
    ];

    for (int i = 0; i < steps.length; i++) {
      if (mounted) {
        setState(() {
          _loadingText = steps[i]['text'] as String;
          _loadingProgress = (i + 1) / steps.length;
        });
      }

      await Future.delayed(Duration(milliseconds: steps[i]['duration'] as int));
    }

    if (mounted) {
      setState(() {
        _isInitialized = true;
      });
    }
  }

  Future<void> _navigateToNextScreen() async {
    await Future.delayed(const Duration(milliseconds: 300)); // Reduced from 500

    if (mounted) {
      // Navigate to introduction screen first - proper user flow
      String nextRoute = AppRoutes.introductionScreen; // Fixed route reference

      Navigator.pushReplacementNamed(context, nextRoute);
    }
  }

  @override
  void dispose() {
    _logoAnimationController.dispose();
    _particleAnimationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppTheme.lightTheme.primaryColor,
              AppTheme.lightTheme.primaryColor.withAlpha((0.8 * 255).round()),
              AppTheme.lightTheme.colorScheme.secondary,
            ],
          ),
        ),
        child: SafeArea(
          child: Stack(
            children: [
              // Wellness-themed particles animation
              _buildParticlesBackground(),

              // Main content
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Spacer to push content to center
                  const Spacer(flex: 2),

                  // Animated logo section
                  _buildAnimatedLogo(),

                  SizedBox(height: 8.h),

                  // Loading section
                  _buildLoadingSection(),

                  const Spacer(flex: 3),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildParticlesBackground() {
    return AnimatedBuilder(
      animation: _particleAnimation,
      builder: (context, child) {
        return Stack(
          children: List.generate(15, (index) {
            final double animationOffset =
                (_particleAnimation.value + (index * 0.1)) % 1.0;
            final double xPosition = (index * 25.0) % 100.0;
            final double yPosition = animationOffset * 120.0 - 20.0;

            return Positioned(
              left: xPosition.w,
              top: yPosition.h,
              child: Container(
                width: 1.5.w,
                height: 1.5.w,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withAlpha((0.3 * 255).round()),
                ),
              ),
            );
          }),
        );
      },
    );
  }

  Widget _buildAnimatedLogo() {
    return AnimatedBuilder(
      animation: Listenable.merge([_logoFloatAnimation, _logoScaleAnimation]),
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(0, _logoFloatAnimation.value),
          child: Transform.scale(
            scale: _logoScaleAnimation.value,
            child: Column(
              children: [
                // Logo container with shadow - optimized for transparent background
                Container(
                  width: 25.w,
                  height: 25.w,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white.withAlpha((0.1 * 255).round()),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withAlpha((0.15 * 255).round()),
                        blurRadius: 25,
                        offset: const Offset(0, 12),
                      ),
                    ],
                  ),
                  child: Center(
                    child: Container(
                      width: 22.w,
                      height: 22.w,
                      child: Image.asset(
                        'assets/images/Remove_background_project-1760373401381.png',
                        width: 22.w,
                        height: 22.w,
                        fit: BoxFit.contain,
                        semanticLabel:
                            'Clean Greenofig logo with transparent background featuring the stylized green G with organic tree and leaf design elements',
                      ),
                    ),
                  ),
                ),

                SizedBox(height: 3.h),

                // App name
                Text(
                  'Greenofig',
                  style: AppTheme.lightTheme.textTheme.headlineLarge?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.2,
                  ),
                ),

                SizedBox(height: 1.h),

                // Tagline
                Text(
                  'Your AI-Powered Wellness Companion',
                  style: AppTheme.lightTheme.textTheme.bodyLarge?.copyWith(
                    color: Colors.white.withAlpha((0.9 * 255).round()),
                    fontWeight: FontWeight.w400,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildLoadingSection() {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 8.w),
      child: Column(
        children: [
          // Loading progress bar
          Container(
            width: double.infinity,
            height: 0.8.h,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(4),
              color: Colors.white.withAlpha((0.3 * 255).round()),
            ),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              width: double.infinity,
              height: 0.8.h,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(4),
                color: Colors.white,
              ),
              alignment: Alignment.centerLeft,
              child: FractionallySizedBox(
                widthFactor: _loadingProgress,
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(4),
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ),

          SizedBox(height: 2.h),

          // Loading text
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 300),
            child: Text(
              _loadingText,
              key: ValueKey(_loadingText),
              style: AppTheme.lightTheme.textTheme.bodyMedium?.copyWith(
                color: Colors.white.withAlpha((0.8 * 255).round()),
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.center,
            ),
          ),

          SizedBox(height: 1.h),

          // Loading percentage
          Text(
            '${(_loadingProgress * 100).toInt()}%',
            style: AppTheme.lightTheme.textTheme.labelLarge?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w600,
            ),
          ),

          if (_isInitialized) ...[
            SizedBox(height: 2.h),

            // Success indicator
            Container(
              padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.h),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(20),
                color: Colors.white.withAlpha((0.2 * 255).round()),
                border: Border.all(
                  color: Colors.white.withAlpha((0.3 * 255).round()),
                  width: 1,
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  CustomIconWidget(
                    iconName: 'check_circle',
                    color: Colors.white,
                    size: 5.w,
                  ),
                  SizedBox(width: 2.w),
                  Text(
                    'Ready to go!',
                    style: AppTheme.lightTheme.textTheme.labelLarge?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}