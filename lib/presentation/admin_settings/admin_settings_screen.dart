import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../core/app_export.dart';

class AdminSettingsScreen extends StatefulWidget {
  const AdminSettingsScreen({Key? key}) : super(key: key);

  @override
  State<AdminSettingsScreen> createState() => _AdminSettingsScreenState();
}

class _AdminSettingsScreenState extends State<AdminSettingsScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  String _searchQuery = '';
  String _selectedCategory = 'All';

  final List<String> _categories = [
    'All',
    'Core',
    'Health',
    'Features',
    'Authentication',
    'Settings',
    'Business'
  ];

  @override
  void initState() {
    super.initState();
    _setupAnimations();
  }

  void _setupAnimations() {
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOut,
    ));

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.1),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOutBack,
    ));

    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  List<Map<String, dynamic>> get _allScreens => [
        // Core Screens
        {
          'title': 'Splash Screen',
          'subtitle': 'App initialization and loading',
          'route': AppRoutes.splashScreen,
          'icon': 'hourglass_empty',
          'category': 'Core',
          'color': Color(0xFF4CAF50),
        },
        {
          'title': 'Introduction',
          'subtitle': 'Welcome and feature showcase',
          'route': AppRoutes.introductionScreen,
          'icon': 'waving_hand',
          'category': 'Core',
          'color': Color(0xFF2196F3),
        },
        {
          'title': 'Dashboard Home',
          'subtitle': 'Main dashboard and overview',
          'route': AppRoutes.dashboardHome,
          'icon': 'dashboard',
          'category': 'Core',
          'color': Color(0xFF00BCD4),
        },
        {
          'title': 'Welcome Screen',
          'subtitle': 'User onboarding experience',
          'route': AppRoutes.welcomeScreen,
          'icon': 'celebration',
          'category': 'Core',
          'color': Color(0xFF9C27B0),
        },

        // Authentication & Settings
        {
          'title': 'Login Screen',
          'subtitle': 'User authentication and sign-in',
          'route': AppRoutes.loginScreen,
          'icon': 'login',
          'category': 'Authentication',
          'color': Color(0xFFFF9800),
        },
        {
          'title': 'Authentication',
          'subtitle': 'Biometric and secure login',
          'route': AppRoutes.authenticationScreen,
          'icon': 'security',
          'category': 'Authentication',
          'color': Color(0xFFE91E63),
        },
        {
          'title': 'Profile Screen',
          'subtitle': 'User profile and personal info',
          'route': AppRoutes.profileScreen,
          'icon': 'person',
          'category': 'Settings',
          'color': Color(0xFF3F51B5),
        },
        {
          'title': 'Profile Settings',
          'subtitle': 'Account preferences and configuration',
          'route': AppRoutes.profileSettings,
          'icon': 'settings',
          'category': 'Settings',
          'color': Color(0xFF607D8B),
        },

        // Health & Tracking
        {
          'title': 'AI Food Scanner',
          'subtitle': 'Camera-based food recognition',
          'route': AppRoutes.aiFoodScanner,
          'icon': 'camera_alt',
          'category': 'Health',
          'color': Color(0xFF4CAF50),
        },
        {
          'title': 'Meal Planning',
          'subtitle': 'Smart meal preparation and nutrition',
          'route': AppRoutes.mealPlanning,
          'icon': 'restaurant_menu',
          'category': 'Health',
          'color': Color(0xFF8BC34A),
        },
        {
          'title': 'Meal Search',
          'subtitle': 'Find and explore meal options',
          'route': AppRoutes.mealSearchScreen,
          'icon': 'search',
          'category': 'Health',
          'color': Color(0xFFCDDC39),
        },
        {
          'title': 'Progress Tracking',
          'subtitle': 'Health metrics and goal monitoring',
          'route': AppRoutes.progressTracking,
          'icon': 'trending_up',
          'category': 'Health',
          'color': Color(0xFF009688),
        },
        {
          'title': 'Measurement Tracking',
          'subtitle': 'Body measurements and calibration',
          'route': AppRoutes.measurementTracking,
          'icon': 'straighten',
          'category': 'Health',
          'color': Color(0xFF795548),
        },
        {
          'title': 'Workout Programs',
          'subtitle': 'Fitness routines and exercise plans',
          'route': AppRoutes.workoutPrograms,
          'icon': 'fitness_center',
          'category': 'Health',
          'color': Color(0xFFFF5722),
        },

        // Features & Integration
        {
          'title': 'Health Device Integration',
          'subtitle': 'Connect wearables and health devices',
          'route': AppRoutes.healthDeviceIntegration,
          'icon': 'devices',
          'category': 'Features',
          'color': Color(0xFF673AB7),
        },
        {
          'title': 'Device Integration',
          'subtitle': 'General device connectivity',
          'route': AppRoutes.deviceIntegrationScreen,
          'icon': 'bluetooth_connected',
          'category': 'Features',
          'color': Color(0xFF3F51B5),
        },
        {
          'title': 'AI Health Coach Chat',
          'subtitle': 'Interactive AI wellness assistant',
          'route': AppRoutes.aiHealthCoachChat,
          'icon': 'chat',
          'category': 'Features',
          'color': Color(0xFF2196F3),
        },
        {
          'title': 'Leaderboard',
          'subtitle': 'Community challenges and rankings',
          'route': AppRoutes.leaderboardScreen,
          'icon': 'leaderboard',
          'category': 'Features',
          'color': Color(0xFFFF9800),
        },
        {
          'title': 'Onboarding Flow',
          'subtitle': 'New user setup and tutorial',
          'route': AppRoutes.onboardingFlow,
          'icon': 'tour',
          'category': 'Features',
          'color': Color(0xFFE91E63),
        },

        // Business & Subscriptions
        {
          'title': 'Premium Subscription',
          'subtitle': 'Subscription plans and billing',
          'route': AppRoutes.premiumSubscriptionPlans,
          'icon': 'workspace_premium',
          'category': 'Business',
          'color': Color(0xFFFFD700),
        },
        {
          'title': 'Subscription Management',
          'subtitle': 'Manage active subscriptions',
          'route': AppRoutes.subscriptionManagement,
          'icon': 'manage_accounts',
          'category': 'Business',
          'color': Color(0xFFFF8C00),
        },
        {
          'title': 'Subscription Activation',
          'subtitle': 'Purchase and activate premium plans',
          'route': AppRoutes.subscriptionActivationFlow,
          'icon': 'payment',
          'category': 'Business',
          'color': Color(0xFF32CD32),
        },
        {
          'title': 'Domain Publishing',
          'subtitle': 'Website deployment and configuration',
          'route': AppRoutes.domainPublishingPreparation,
          'icon': 'public',
          'category': 'Business',
          'color': Color(0xFF4169E1),
        },

        // Admin
        {
          'title': 'Admin Settings',
          'subtitle': 'Administrative controls and navigation hub',
          'route': AppRoutes.adminSettingsScreen,
          'icon': 'admin_panel_settings',
          'category': 'Settings',
          'color': Color(0xFFFF0000),
        },
      ];

  List<Map<String, dynamic>> get _filteredScreens {
    List<Map<String, dynamic>> filtered = _allScreens;

    // Filter by category
    if (_selectedCategory != 'All') {
      filtered = filtered
          .where((screen) => screen['category'] == _selectedCategory)
          .toList();
    }

    // Filter by search query
    if (_searchQuery.isNotEmpty) {
      filtered = filtered
          .where((screen) =>
              screen['title']
                  .toLowerCase()
                  .contains(_searchQuery.toLowerCase()) ||
              screen['subtitle']
                  .toLowerCase()
                  .contains(_searchQuery.toLowerCase()))
          .toList();
    }

    return filtered;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: theme.appBarTheme.backgroundColor,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: CustomIconWidget(
            iconName: 'arrow_back',
            color: theme.colorScheme.onSurface,
            size: 6.w,
          ),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Admin Navigation Hub',
          style: GoogleFonts.inter(
            fontSize: 20.sp,
            fontWeight: FontWeight.w600,
            color: theme.colorScheme.onSurface,
          ),
        ),
        actions: [
          Container(
            margin: EdgeInsets.only(right: 4.w),
            padding: EdgeInsets.all(2.w),
            decoration: BoxDecoration(
              color: theme.colorScheme.errorContainer,
              shape: BoxShape.circle,
            ),
            child: CustomIconWidget(
              iconName: 'admin_panel_settings',
              color: theme.colorScheme.error,
              size: 5.w,
            ),
          ),
        ],
      ),
      body: FadeTransition(
        opacity: _fadeAnimation,
        child: SlideTransition(
          position: _slideAnimation,
          child: Column(
            children: [
              // Search and Filter Section
              _buildSearchAndFilter(theme),

              // Statistics Overview
              _buildStatsOverview(theme),

              // Screens Grid
              Expanded(
                child: _buildScreensGrid(theme),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSearchAndFilter(ThemeData theme) {
    return Container(
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        boxShadow: [
          BoxShadow(
            color: theme.shadowColor.withAlpha(25),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          // Search Bar
          Container(
            decoration: BoxDecoration(
              color: theme.colorScheme.surfaceContainerHighest.withAlpha(128),
              borderRadius: BorderRadius.circular(25),
              border: Border.all(
                color: theme.colorScheme.outline.withAlpha(76),
                width: 1,
              ),
            ),
            child: TextField(
              onChanged: (value) => setState(() => _searchQuery = value),
              decoration: InputDecoration(
                hintText: 'Search screens and features...',
                hintStyle: GoogleFonts.inter(
                  fontSize: 14.sp,
                  color: theme.colorScheme.onSurfaceVariant,
                ),
                prefixIcon: Icon(
                  Icons.search,
                  color: theme.colorScheme.onSurfaceVariant,
                  size: 5.w,
                ),
                border: InputBorder.none,
                contentPadding:
                    EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.5.h),
              ),
              style: GoogleFonts.inter(
                fontSize: 14.sp,
                color: theme.colorScheme.onSurface,
              ),
            ),
          ),

          SizedBox(height: 2.h),

          // Category Filters
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: _categories.map((category) {
                final isSelected = _selectedCategory == category;
                return GestureDetector(
                  onTap: () => setState(() => _selectedCategory = category),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    margin: EdgeInsets.only(right: 2.w),
                    padding:
                        EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.h),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? theme.colorScheme.primary
                          : theme.colorScheme.surface,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isSelected
                            ? theme.colorScheme.primary
                            : theme.colorScheme.outline,
                        width: 1.5,
                      ),
                    ),
                    child: Text(
                      category,
                      style: GoogleFonts.inter(
                        fontSize: 12.sp,
                        fontWeight: FontWeight.w600,
                        color: isSelected
                            ? theme.colorScheme.onPrimary
                            : theme.colorScheme.onSurface,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsOverview(ThemeData theme) {
    final filteredCount = _filteredScreens.length;
    final totalCount = _allScreens.length;

    return Container(
      margin: EdgeInsets.all(4.w),
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            theme.colorScheme.primaryContainer,
            theme.colorScheme.primaryContainer.withAlpha(128),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: theme.colorScheme.primary.withAlpha(76),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildStatItem(
            'Available Screens',
            '$filteredCount / $totalCount',
            'apps',
            theme,
          ),
          Container(
            width: 1,
            height: 5.h,
            color: theme.colorScheme.outline.withAlpha(76),
          ),
          _buildStatItem(
            'Selected Category',
            _selectedCategory,
            'category',
            theme,
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(
      String title, String value, String iconName, ThemeData theme) {
    return Column(
      children: [
        CustomIconWidget(
          iconName: iconName,
          color: theme.colorScheme.primary,
          size: 6.w,
        ),
        SizedBox(height: 1.h),
        Text(
          value,
          style: GoogleFonts.inter(
            fontSize: 16.sp,
            fontWeight: FontWeight.w700,
            color: theme.colorScheme.onPrimaryContainer,
          ),
        ),
        Text(
          title,
          style: GoogleFonts.inter(
            fontSize: 12.sp,
            fontWeight: FontWeight.w500,
            color: theme.colorScheme.onPrimaryContainer.withAlpha(179),
          ),
        ),
      ],
    );
  }

  Widget _buildScreensGrid(ThemeData theme) {
    final filteredScreens = _filteredScreens;

    if (filteredScreens.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CustomIconWidget(
              iconName: 'search_off',
              color: theme.colorScheme.onSurfaceVariant,
              size: 15.w,
            ),
            SizedBox(height: 2.h),
            Text(
              'No screens found',
              style: GoogleFonts.inter(
                fontSize: 18.sp,
                fontWeight: FontWeight.w600,
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            SizedBox(height: 1.h),
            Text(
              'Try adjusting your search or filter',
              style: GoogleFonts.inter(
                fontSize: 14.sp,
                color: theme.colorScheme.onSurfaceVariant.withAlpha(179),
              ),
            ),
          ],
        ),
      );
    }

    return GridView.builder(
      padding: EdgeInsets.all(4.w),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.85,
        crossAxisSpacing: 4.w,
        mainAxisSpacing: 3.h,
      ),
      itemCount: filteredScreens.length,
      itemBuilder: (context, index) {
        return _buildScreenCard(filteredScreens[index], theme, index);
      },
    );
  }

  Widget _buildScreenCard(
      Map<String, dynamic> screen, ThemeData theme, int index) {
    return AnimatedContainer(
      duration: Duration(milliseconds: 300 + (index * 50)),
      child: GestureDetector(
        onTap: () => _navigateToScreen(screen['route']),
        child: Container(
          decoration: BoxDecoration(
            color: theme.colorScheme.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: (screen['color'] as Color).withAlpha(76),
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: (screen['color'] as Color).withAlpha(25),
                blurRadius: 8,
                spreadRadius: 1,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Icon with gradient background
              Container(
                padding: EdgeInsets.all(4.w),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      (screen['color'] as Color).withAlpha(153),
                      (screen['color'] as Color).withAlpha(76),
                    ],
                  ),
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: (screen['color'] as Color).withAlpha(51),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: CustomIconWidget(
                  iconName: screen['icon'],
                  color: Colors.white,
                  size: 8.w,
                ),
              ),

              SizedBox(height: 2.h),

              // Title
              Text(
                screen['title'],
                style: GoogleFonts.inter(
                  fontSize: 14.sp,
                  fontWeight: FontWeight.w700,
                  color: theme.colorScheme.onSurface,
                ),
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),

              SizedBox(height: 1.h),

              // Subtitle
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 2.w),
                child: Text(
                  screen['subtitle'],
                  style: GoogleFonts.inter(
                    fontSize: 11.sp,
                    fontWeight: FontWeight.w400,
                    color: theme.colorScheme.onSurfaceVariant,
                    height: 1.3,
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),

              SizedBox(height: 2.h),

              // Category Badge
              Container(
                padding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 0.5.h),
                decoration: BoxDecoration(
                  color: (screen['color'] as Color).withAlpha(25),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: (screen['color'] as Color).withAlpha(76),
                    width: 1,
                  ),
                ),
                child: Text(
                  screen['category'],
                  style: GoogleFonts.inter(
                    fontSize: 10.sp,
                    fontWeight: FontWeight.w600,
                    color: screen['color'],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _navigateToScreen(String route) {
    try {
      if (route == AppRoutes.adminSettingsScreen) {
        // Don't navigate to self
        return;
      }

      Navigator.pushNamed(context, route).catchError((error) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Unable to navigate to screen: $error'),
            backgroundColor: Theme.of(context).colorScheme.error,
          ),
        );
        return null;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Navigation error: $e'),
          backgroundColor: Theme.of(context).colorScheme.error,
        ),
      );
    }
  }
}
