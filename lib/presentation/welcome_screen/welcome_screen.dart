import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../core/app_export.dart';

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({Key? key}) : super(key: key);

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen>
    with TickerProviderStateMixin {
  late AnimationController _fadeController;
  late AnimationController _slideController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  int _currentFeatureIndex = 0;
  final PageController _pageController = PageController();

  final List<Map<String, dynamic>> _features = [
    {
      'title': 'AI Food Scanner',
      'description':
          'Instantly analyze your meals with advanced AI technology. Get detailed nutritional information and track your health goals with camera-powered food recognition.',
      'icon': 'camera_alt',
      'color': Color(0xFF00FF00),
      'animation': 'camera_preview',
    },
    {
      'title': 'Personalized Meal Planning',
      'description':
          'Discover culturally diverse cuisine options tailored to your dietary preferences. Our AI creates custom meal plans that fit your lifestyle and health objectives.',
      'icon': 'restaurant_menu',
      'color': Color(0xFF32FF32),
      'animation': 'meal_cards',
    },
    {
      'title': 'Smart Workout Programs',
      'description':
          'Access expertly designed fitness routines with video guidance. Track your progress and adapt workouts based on your fitness level and goals.',
      'icon': 'fitness_center',
      'color': Color(0xFF00FF41),
      'animation': 'workout_video',
    },
    {
      'title': 'Health Device Integration',
      'description':
          'Connect seamlessly with your favorite health devices and wearables. Sync data from fitness trackers, smart scales, and heart rate monitors.',
      'icon': 'devices',
      'color': Color(0xFF00CC00),
      'animation': 'device_sync',
    },
  ];

  @override
  void initState() {
    super.initState();
    _setupAnimations();
    _startFeatureRotation();
  }

  void _setupAnimations() {
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );

    _slideController = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeOut,
    ));

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _slideController,
      curve: Curves.easeOutBack,
    ));

    _fadeController.forward();
    _slideController.forward();
  }

  void _startFeatureRotation() {
    Future.delayed(const Duration(seconds: 4), () {
      if (mounted) {
        setState(() {
          _currentFeatureIndex = (_currentFeatureIndex + 1) % _features.length;
        });
        _pageController.animateToPage(
          _currentFeatureIndex,
          duration: const Duration(milliseconds: 500),
          curve: Curves.easeInOut,
        );
        _startFeatureRotation();
      }
    });
  }

  @override
  void dispose() {
    _fadeController.dispose();
    _slideController.dispose();
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: SafeArea(
        child: Column(
          children: [
            // Top Sign In Icon
            _buildTopSignInSection(theme),

            Expanded(
              child: SingleChildScrollView(
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: 4.w),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      SizedBox(height: 4.h),

                      // Professional Greenofig Logo
                      FadeTransition(
                        opacity: _fadeAnimation,
                        child: SlideTransition(
                          position: _slideAnimation,
                          child: _buildLogoSection(theme),
                        ),
                      ),

                      SizedBox(height: 4.h),

                      // Welcome Text
                      FadeTransition(
                        opacity: _fadeAnimation,
                        child: Column(
                          children: [
                            Text(
                              'Welcome to Greenofig',
                              style: GoogleFonts.inter(
                                fontSize: 32.sp,
                                fontWeight: FontWeight.w700,
                                color: theme.colorScheme.onSurface,
                                letterSpacing: -0.5,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            SizedBox(height: 1.h),
                            Text(
                              'Your Comprehensive Health Ecosystem',
                              style: GoogleFonts.inter(
                                fontSize: 16.sp,
                                fontWeight: FontWeight.w400,
                                color: theme.colorScheme.onSurfaceVariant,
                                letterSpacing: 0.2,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),

                      SizedBox(height: 6.h),

                      // Feature Showcase Cards
                      SizedBox(
                        height: 45.h,
                        child: PageView.builder(
                          controller: _pageController,
                          onPageChanged: (index) {
                            setState(() {
                              _currentFeatureIndex = index;
                            });
                          },
                          itemCount: _features.length,
                          itemBuilder: (context, index) {
                            return _buildFeatureCard(_features[index], theme);
                          },
                        ),
                      ),

                      SizedBox(height: 3.h),

                      // Page Indicators
                      _buildPageIndicators(theme),

                      SizedBox(height: 6.h),

                      // Action Buttons
                      _buildActionButtons(theme),

                      SizedBox(height: 4.h),
                    ],
                  ),
                ),
              ),
            ),

            // Always Visible Bottom Navigation Preview
            _buildBottomNavigationPreview(theme),
          ],
        ),
      ),
    );
  }

  Widget _buildTopSignInSection(ThemeData theme) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          GestureDetector(
            onTap: () => Navigator.pushNamed(context, AppRoutes.loginScreen),
            child: Container(
              padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.h),
              decoration: BoxDecoration(
                color: theme.colorScheme.primary.withAlpha((0.1 * 255).round()),
                borderRadius: BorderRadius.circular(25),
                border: Border.all(
                  color:
                      theme.colorScheme.primary.withAlpha((0.3 * 255).round()),
                  width: 1.5,
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  CustomIconWidget(
                    iconName: 'login',
                    color: theme.colorScheme.primary,
                    size: 5.w,
                  ),
                  SizedBox(width: 2.w),
                  Text(
                    'Sign In',
                    style: GoogleFonts.inter(
                      fontSize: 14.sp,
                      fontWeight: FontWeight.w600,
                      color: theme.colorScheme.primary,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLogoSection(ThemeData theme) {
    return Container(
      width: 40.w,
      height: 40.w,
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
          width: 40.w,
          height: 40.w,
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
                size: 15.w,
                color: Colors.white,
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildFeatureCard(Map<String, dynamic> feature, ThemeData theme) {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 2.w),
      padding: EdgeInsets.all(6.w),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            theme.colorScheme.surface,
            theme.colorScheme.surface.withAlpha((0.8 * 255).round()),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: feature['color'].withAlpha((0.3 * 255).round()),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: feature['color'].withAlpha(51),
            blurRadius: 20,
            spreadRadius: 2,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Feature Icon with Animation
          Container(
            width: 20.w,
            height: 20.w,
            decoration: BoxDecoration(
              color: feature['color'].withAlpha((0.2 * 255).round()),
              shape: BoxShape.circle,
              border: Border.all(
                color: feature['color'],
                width: 2,
              ),
            ),
            child: CustomIconWidget(
              iconName: feature['icon'],
              color: feature['color'],
              size: 10.w,
            ),
          ),

          SizedBox(height: 4.h),

          // Feature Title
          Text(
            feature['title'],
            style: GoogleFonts.inter(
              fontSize: 22.sp,
              fontWeight: FontWeight.w700,
              color: theme.colorScheme.onSurface,
            ),
            textAlign: TextAlign.center,
          ),

          SizedBox(height: 2.h),

          // Feature Description
          Text(
            feature['description'],
            style: GoogleFonts.inter(
              fontSize: 14.sp,
              fontWeight: FontWeight.w400,
              color: theme.colorScheme.onSurfaceVariant,
              height: 1.5,
            ),
            textAlign: TextAlign.center,
            maxLines: 6,
            overflow: TextOverflow.ellipsis,
          ),

          SizedBox(height: 3.h),

          // Interactive Element
          Container(
            padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.h),
            decoration: BoxDecoration(
              color: feature['color'].withAlpha((0.1 * 255).round()),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: feature['color'].withAlpha((0.4 * 255).round()),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                CustomIconWidget(
                  iconName: 'swipe',
                  color: feature['color'],
                  size: 4.w,
                ),
                SizedBox(width: 2.w),
                Text(
                  'Swipe to explore',
                  style: GoogleFonts.inter(
                    fontSize: 12.sp,
                    fontWeight: FontWeight.w500,
                    color: feature['color'],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPageIndicators(ThemeData theme) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(_features.length, (index) {
        final isActive = index == _currentFeatureIndex;
        return AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          margin: EdgeInsets.symmetric(horizontal: 1.w),
          width: isActive ? 8.w : 2.w,
          height: 1.h,
          decoration: BoxDecoration(
            color: isActive
                ? theme.colorScheme.primary
                : theme.colorScheme.primary.withAlpha((0.3 * 255).round()),
            borderRadius: BorderRadius.circular(4),
          ),
        );
      }),
    );
  }

  Widget _buildActionButtons(ThemeData theme) {
    return Column(
      children: [
        // Primary Action Button
        SizedBox(
          width: 80.w,
          height: 6.h,
          child: ElevatedButton(
            onPressed: () =>
                Navigator.pushNamed(context, AppRoutes.loginScreen),
            style: ElevatedButton.styleFrom(
              backgroundColor: theme.colorScheme.primary,
              foregroundColor: theme.colorScheme.onPrimary,
              elevation: 6,
              shadowColor: theme.colorScheme.primary.withAlpha(102),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(30),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CustomIconWidget(
                  iconName: 'rocket_launch',
                  color: theme.colorScheme.onPrimary,
                  size: 6.w,
                ),
                SizedBox(width: 3.w),
                Text(
                  'Get Started',
                  style: GoogleFonts.inter(
                    fontSize: 18.sp,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
        ),

        SizedBox(height: 2.h),

        // Secondary Action Button
        SizedBox(
          width: 80.w,
          height: 6.h,
          child: OutlinedButton(
            onPressed: () =>
                Navigator.pushNamed(context, AppRoutes.loginScreen),
            style: OutlinedButton.styleFrom(
              foregroundColor: theme.colorScheme.primary,
              side: BorderSide(
                color: theme.colorScheme.primary,
                width: 2,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(30),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CustomIconWidget(
                  iconName: 'login',
                  color: theme.colorScheme.primary,
                  size: 5.w,
                ),
                SizedBox(width: 3.w),
                Text(
                  'Sign In',
                  style: GoogleFonts.inter(
                    fontSize: 16.sp,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildBottomNavigationPreview(ThemeData theme) {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 1.h),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        boxShadow: [
          BoxShadow(
            color: theme.shadowColor.withAlpha(25),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _buildBottomNavItem('home', 'Home', theme, isSelected: true),
          _buildBottomNavItem('restaurant', 'Meals', theme),
          _buildBottomNavItem('fitness_center', 'Workout', theme),
          _buildBottomNavItem('person', 'Profile', theme),
        ],
      ),
    );
  }

  Widget _buildBottomNavItem(String iconName, String label, ThemeData theme,
      {bool isSelected = false}) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          padding: EdgeInsets.all(isSelected ? 2.w : 1.5.w),
          decoration: BoxDecoration(
            color: isSelected
                ? theme.colorScheme.primary.withAlpha((0.2 * 255).round())
                : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
          ),
          child: CustomIconWidget(
            iconName: iconName,
            color: isSelected
                ? theme.colorScheme.primary
                : theme.colorScheme.onSurfaceVariant,
            size: 6.w,
          ),
        ),
        SizedBox(height: 0.5.h),
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 11.sp,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
            color: isSelected
                ? theme.colorScheme.primary
                : theme.colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }
}
