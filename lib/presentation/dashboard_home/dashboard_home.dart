import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../core/app_export.dart';
import '../../services/simple_auth_service.dart';
import '../../services/role_service.dart';
import '../../widgets/feature_gate_widget.dart';
import './widgets/active_challenges_widget.dart';
import './widgets/calorie_progress_widget.dart';
import './widgets/greeting_header_widget.dart';
import './widgets/quick_add_modal_widget.dart';
import './widgets/recent_meals_widget.dart';
import './widgets/status_bar_widget.dart';
import './widgets/streak_achievements_widget.dart';
import './widgets/upcoming_workouts_widget.dart';

class DashboardHome extends StatefulWidget {
  const DashboardHome({Key? key}) : super(key: key);

  @override
  State<DashboardHome> createState() => _DashboardHomeState();
}

class _DashboardHomeState extends State<DashboardHome>
    with TickerProviderStateMixin {
  int _currentIndex = 0;
  bool _isAuthenticated = false;
  bool _isAdmin = false;
  String _userRole = 'Basic User';

  // Mock data
  final List<Map<String, dynamic>> _activeChallenges = [
    {
      'id': 1,
      'title': '10K Steps Daily',
      'description': 'Walk 10,000 steps every day',
      'icon': 'directions_walk',
      'progress': 75,
      'current': 7500,
      'target': 10000,
      'unit': 'steps',
      'daysLeft': 5,
    },
    {
      'id': 2,
      'title': 'Water Challenge',
      'description': 'Drink 8 glasses of water daily',
      'icon': 'local_drink',
      'progress': 62,
      'current': 5,
      'target': 8,
      'unit': 'glasses',
      'daysLeft': 12,
    },
  ];

  final List<Map<String, dynamic>> _recentMeals = [
    {
      'id': 1,
      'name': 'Grilled Chicken Salad',
      'calories': 320,
      'protein': 35,
      'carbs': 12,
      'fat': 8,
      'time': '12:30 PM',
      'aiConfidence': 94,
      'image': 'https://images.unsplash.com/photo-1662805523107-ce4d7486bb0b',
      'semanticLabel':
          'Fresh grilled chicken salad with mixed greens, cherry tomatoes, and cucumber in a white bowl',
    },
    {
      'id': 2,
      'name': 'Greek Yogurt with Berries',
      'calories': 180,
      'protein': 15,
      'carbs': 22,
      'fat': 4,
      'time': '9:15 AM',
      'aiConfidence': 88,
      'image': 'https://images.unsplash.com/photo-1670843838196-0c1c15e85d5e',
      'semanticLabel':
          'Bowl of creamy Greek yogurt topped with fresh blueberries and strawberries',
    },
    {
      'id': 3,
      'name': 'Avocado Toast',
      'calories': 250,
      'protein': 8,
      'carbs': 30,
      'fat': 12,
      'time': '7:45 AM',
      'aiConfidence': 91,
      'image': 'https://images.unsplash.com/photo-1585768425229-d3a88ff63ebb',
      'semanticLabel':
          'Slice of whole grain toast topped with mashed avocado and cherry tomatoes',
    },
  ];

  final List<Map<String, dynamic>> _upcomingWorkouts = [
    {
      'id': 1,
      'name': 'Upper Body Strength',
      'type': 'Strength Training',
      'duration': '45 min',
      'difficulty': 'Intermediate',
      'estimatedCalories': 280,
      'scheduledTime': '6:00 PM',
      'icon': 'fitness_center',
    },
    {
      'id': 2,
      'name': 'Morning Yoga Flow',
      'type': 'Flexibility',
      'duration': '30 min',
      'difficulty': 'Beginner',
      'estimatedCalories': 120,
      'scheduledTime': '7:00 AM',
      'icon': 'self_improvement',
    },
  ];

  final List<Map<String, dynamic>> _recentAchievements = [
    {
      'id': 1,
      'name': 'Week Warrior',
      'description': 'Completed 7 days of workouts',
      'icon': 'emoji_events',
      'earnedDate': DateTime.now().subtract(const Duration(days: 1)),
    },
    {
      'id': 2,
      'name': 'Hydration Hero',
      'description': 'Drank 8 glasses of water for 5 days',
      'icon': 'local_drink',
      'earnedDate': DateTime.now().subtract(const Duration(days: 3)),
    },
  ];

  @override
  void initState() {
    super.initState();
    _checkAuthStatus();
    _checkUserRole();

    // Listen to auth state changes
    SimpleAuthService.instance.authStateChanges.listen((isAuth) {
      if (mounted) {
        setState(() {
          _isAuthenticated = isAuth;
        });
        _checkUserRole();
      }
    });
  }

  void _checkAuthStatus() {
    setState(() {
      _isAuthenticated = SimpleAuthService.instance.isAuthenticated;
    });
  }

  Future<void> _checkUserRole() async {
    if (!_isAuthenticated) return;

    // Get role from SimpleAuthService
    final isAdmin = SimpleAuthService.instance.isAdmin;
    final roleName = SimpleAuthService.instance.userRole;

    if (mounted) {
      setState(() {
        _isAdmin = isAdmin;
        _userRole = roleName;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _handleRefresh,
          color: Theme.of(context).colorScheme.primary,
          child: CustomScrollView(
            slivers: [
              // Sign-in banner for unauthenticated users
              if (!_isAuthenticated)
                SliverToBoxAdapter(
                  child: _buildSignInBanner(),
                ),

              SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.all(4.w),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Sign-in icon option at the top
                      if (!_isAuthenticated) ...[
                        _buildTopSignInSection(),
                        SizedBox(height: 2.h),
                      ],

                      StatusBarWidget(
                        isWearableConnected: _isAuthenticated,
                        lastSyncTime:
                            _isAuthenticated ? '2 min ago' : 'Not synced',
                      ),
                      SizedBox(height: 2.h),
                      GreetingHeaderWidget(
                        userName: _isAuthenticated
                            ? SimpleAuthService.instance.userName
                            : 'Guest',
                        weatherSuggestion: _isAuthenticated
                            ? 'Perfect weather for a morning walk! 🌤️'
                            : 'Sign in to get personalized recommendations! 🌟',
                      ),
                      SizedBox(height: 3.h),

                      // Show role badge for authenticated users
                      if (_isAuthenticated) ...[
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const RoleBanner(),
                            if (_isAdmin)
                              ElevatedButton.icon(
                                onPressed: () => Navigator.pushNamed(
                                    context, AppRoutes.adminSettingsScreen),
                                icon: Icon(Icons.admin_panel_settings, size: 16),
                                label: Text('Admin Panel'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.red,
                                  foregroundColor: Colors.white,
                                ),
                              ),
                          ],
                        ),
                        SizedBox(height: 2.h),
                      ],

                      // Show limited content for unauthenticated users
                      if (_isAuthenticated) ...[
                        CalorieProgressWidget(
                          consumedCalories: 750,
                          targetCalories: 2000,
                          burnedCalories: 320,
                        ),
                        SizedBox(height: 3.h),
                        StreakAchievementsWidget(
                          currentStreak: 12,
                          recentAchievements: _recentAchievements,
                        ),
                        SizedBox(height: 3.h),
                        ActiveChallengesWidget(
                          challenges: _activeChallenges,
                        ),
                        SizedBox(height: 3.h),
                        RecentMealsWidget(
                          recentMeals: _recentMeals,
                        ),
                        SizedBox(height: 3.h),
                        UpcomingWorkoutsWidget(
                          upcomingWorkouts: _upcomingWorkouts,
                        ),
                      ] else ...[
                        _buildGuestContent(),
                      ],

                      SizedBox(height: 10.h), // Extra space for FAB
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: _onBottomNavTap,
        type: BottomNavigationBarType.fixed,
        backgroundColor: Theme.of(context).colorScheme.surface,
        selectedItemColor: Theme.of(context).colorScheme.primary,
        unselectedItemColor: Theme.of(context).colorScheme.onSurfaceVariant,
        elevation: 8,
        items: [
          BottomNavigationBarItem(
            icon: CustomIconWidget(
              iconName: 'home',
              color: _currentIndex == 0
                  ? Theme.of(context).colorScheme.primary
                  : Theme.of(context).colorScheme.onSurfaceVariant,
              size: 6.w,
            ),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: CustomIconWidget(
              iconName: 'restaurant',
              color: _currentIndex == 1
                  ? Theme.of(context).colorScheme.primary
                  : Theme.of(context).colorScheme.onSurfaceVariant,
              size: 6.w,
            ),
            label: 'Meals',
          ),
          BottomNavigationBarItem(
            icon: CustomIconWidget(
              iconName: 'fitness_center',
              color: _currentIndex == 2
                  ? Theme.of(context).colorScheme.primary
                  : Theme.of(context).colorScheme.onSurfaceVariant,
              size: 6.w,
            ),
            label: 'Workout',
          ),
          BottomNavigationBarItem(
            icon: CustomIconWidget(
              iconName: 'person',
              color: _currentIndex == 3
                  ? Theme.of(context).colorScheme.primary
                  : Theme.of(context).colorScheme.onSurfaceVariant,
              size: 6.w,
            ),
            label: 'Profile',
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showQuickAddModal,
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Theme.of(context).colorScheme.onPrimary,
        elevation: 6,
        child: CustomIconWidget(
          iconName: 'add',
          color: Theme.of(context).colorScheme.onPrimary,
          size: 7.w,
        ),
      ),
    );
  }

  Widget _buildSignInBanner() {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Theme.of(context).colorScheme.primary,
            Theme.of(context)
                .colorScheme
                .primary
                .withAlpha((0.8 * 255).round()),
          ],
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Welcome to Greenofig!',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                ),
                Text(
                  'Sign in to unlock your full wellness journey',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.white.withAlpha((0.9 * 255).round()),
                      ),
                ),
              ],
            ),
          ),
          ElevatedButton.icon(
            onPressed: _navigateToSignIn,
            icon: CustomIconWidget(
              iconName: 'login',
              color: Theme.of(context).colorScheme.primary,
              size: 4.w,
            ),
            label: Text('Sign In'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: Theme.of(context).colorScheme.primary,
              padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.h),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTopSignInSection() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          'Explore Greenofig',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        GestureDetector(
          onTap: _navigateToSignIn,
          child: Container(
            padding: EdgeInsets.all(3.w),
            decoration: BoxDecoration(
              color: Theme.of(context)
                  .colorScheme
                  .primary
                  .withAlpha((0.1 * 255).round()),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: Theme.of(context)
                    .colorScheme
                    .primary
                    .withAlpha((0.3 * 255).round()),
              ),
            ),
            child: CustomIconWidget(
              iconName: 'account_circle',
              color: Theme.of(context).colorScheme.primary,
              size: 6.w,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildGuestContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Preview card showcasing app features
        Container(
          width: double.infinity,
          padding: EdgeInsets.all(4.w),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surfaceContainerHighest,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  CustomIconWidget(
                    iconName: 'wellness',
                    color: Theme.of(context).colorScheme.primary,
                    size: 6.w,
                  ),
                  SizedBox(width: 3.w),
                  Text(
                    'Your Wellness Journey Awaits',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                ],
              ),
              SizedBox(height: 2.h),
              _buildFeaturePreviewItem(
                  'Track your calories and nutrition', 'restaurant'),
              _buildFeaturePreviewItem(
                  'Monitor your fitness progress', 'fitness_center'),
              _buildFeaturePreviewItem(
                  'Get AI-powered health insights', 'psychology'),
              _buildFeaturePreviewItem(
                  'Connect with health devices', 'devices'),
              SizedBox(height: 3.h),
              Center(
                child: ElevatedButton.icon(
                  onPressed: _navigateToSignIn,
                  icon: CustomIconWidget(
                    iconName: 'login',
                    color: Colors.white,
                    size: 4.w,
                  ),
                  label: Text('Sign In to Get Started'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Theme.of(context).colorScheme.primary,
                    foregroundColor: Colors.white,
                    padding:
                        EdgeInsets.symmetric(horizontal: 6.w, vertical: 1.5.h),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(25),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),

        SizedBox(height: 3.h),

        // Alternative center sign-in option
        Center(
          child: Column(
            children: [
              Container(
                padding: EdgeInsets.all(4.w),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Theme.of(context).colorScheme.primary,
                ),
                child: GestureDetector(
                  onTap: _navigateToSignIn,
                  child: CustomIconWidget(
                    iconName: 'person_add',
                    color: Colors.white,
                    size: 8.w,
                  ),
                ),
              ),
              SizedBox(height: 2.h),
              Text(
                'Join thousands of users on their wellness journey',
                style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      fontWeight: FontWeight.w500,
                    ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildFeaturePreviewItem(String text, String iconName) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 1.h),
      child: Row(
        children: [
          CustomIconWidget(
            iconName: iconName,
            color: Theme.of(context).colorScheme.primary,
            size: 5.w,
          ),
          SizedBox(width: 3.w),
          Expanded(
            child: Text(
              text,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ),
          CustomIconWidget(
            iconName: 'check_circle',
            color: Theme.of(context).colorScheme.primary,
            size: 4.w,
          ),
        ],
      ),
    );
  }

  void _navigateToSignIn() {
    Navigator.pushNamed(context, '/login-screen');
  }

  Future<void> _handleRefresh() async {
    // Simulate API call with haptic feedback
    await Future.delayed(const Duration(seconds: 2));

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Health data synced successfully!'),
          backgroundColor: Theme.of(context).colorScheme.tertiary,
          behavior: SnackBarBehavior.floating,
          margin: EdgeInsets.all(4.w),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      );
    }
  }

  void _onBottomNavTap(int index) {
    // Don't update state if same index
    if (_currentIndex == index) return;

    setState(() {
      _currentIndex = index;
    });

    switch (index) {
      case 0:
        // Already on home - do nothing
        break;
      case 1:
        // Navigate to Meal Planning
        Navigator.pushNamed(context, AppRoutes.mealPlanning);
        break;
      case 2:
        // Navigate to Workout Programs
        Navigator.pushNamed(context, AppRoutes.workoutPrograms);
        break;
      case 3:
        // Navigate to Profile
        Navigator.pushNamed(context, AppRoutes.profileScreen);
        break;
    }
  }

  void _showQuickAddModal() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => const QuickAddModalWidget(),
    );
  }
}
