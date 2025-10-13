import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../core/app_export.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final Map<String, dynamic> _userProfile = {
    'name': 'Emma Richardson',
    'username': '@emma_richardson',
    'avatar': 'https://images.unsplash.com/photo-1684262855358-88f296a2cfc2',
    'semanticLabel':
        'Professional woman with blonde hair and confident smile wearing blue blouse',
    'followers': 542,
    'following': 1200,
    'age': 34,
    'weight': 49,
    'height': 162,
    'fatPercentage': 18,
    'workoutStreak': 50,
    'level': 'Elite Athlete',
    'joinDate': 'March 2023',
  };

  final List<Map<String, dynamic>> _activityStats = [
    {
      'title': 'Workout',
      'value': '50',
      'unit': 'days streak',
      'icon': Icons.fitness_center,
      'color': AppTheme.primaryDark,
    },
    {
      'title': 'Calories',
      'value': '2,150',
      'unit': 'burned today',
      'icon': Icons.local_fire_department,
      'color': Colors.orange,
    },
    {
      'title': 'Steps',
      'value': '12,847',
      'unit': 'today',
      'icon': Icons.directions_walk,
      'color': Colors.blue,
    },
    {
      'title': 'Water',
      'value': '2.3L',
      'unit': 'consumed',
      'icon': Icons.local_drink,
      'color': Colors.cyan,
    },
  ];

  final List<Map<String, dynamic>> _achievements = [
    {
      'title': 'Marathon Master',
      'description': 'Completed 5 marathons',
      'icon': '🏃‍♀️',
      'earned': true,
    },
    {
      'title': 'Consistency King',
      'description': '50-day workout streak',
      'icon': '👑',
      'earned': true,
    },
    {
      'title': 'Hydration Hero',
      'description': 'Perfect water intake for 30 days',
      'icon': '💧',
      'earned': true,
    },
    {
      'title': 'Nutrition Ninja',
      'description': 'Tracked meals for 100 days',
      'icon': '🥗',
      'earned': false,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundDark,
      appBar: AppBar(
        backgroundColor: AppTheme.backgroundDark,
        elevation: 0,
        title: Text(
          'Profile',
          style: GoogleFonts.inter(
            fontSize: 20.sp,
            fontWeight: FontWeight.w600,
            color: AppTheme.textPrimaryDark,
          ),
        ),
        centerTitle: true,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: AppTheme.textPrimaryDark),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.settings, color: AppTheme.textPrimaryDark),
            onPressed: () {
              Navigator.pushNamed(context, AppRoutes.profileSettings);
            },
            tooltip: 'Settings',
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(4.w),
        child: Column(
          children: [
            // Profile Header
            _buildProfileHeader(),

            SizedBox(height: 4.h),

            // Stats Cards
            _buildStatsSection(),

            SizedBox(height: 4.h),

            // Body Metrics
            _buildBodyMetrics(),

            SizedBox(height: 4.h),

            // Activity Tracking
            _buildActivityTracking(),

            SizedBox(height: 4.h),

            // Achievements
            _buildAchievements(),

            SizedBox(height: 10.h), // Bottom padding
          ],
        ),
      ),
    );
  }

  Widget _buildProfileHeader() {
    return Container(
      padding: EdgeInsets.all(6.w),
      decoration: BoxDecoration(
        color: AppTheme.surfaceDark,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.dividerDark.withAlpha(77)),
      ),
      child: Column(
        children: [
          // Profile Picture
          Container(
            width: 30.w,
            height: 30.w,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: AppTheme.primaryDark,
                width: 4,
              ),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.primaryDark.withAlpha(77),
                  blurRadius: 20,
                  offset: Offset(0, 10),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(100),
              child: CustomImageWidget(
                imageUrl: _userProfile['avatar'],
                semanticLabel: _userProfile['semanticLabel'],
                fit: BoxFit.cover,
              ),
            ),
          ),

          SizedBox(height: 3.h),

          // Name
          Text(
            _userProfile['name'],
            style: GoogleFonts.inter(
              fontSize: 24.sp,
              fontWeight: FontWeight.w700,
              color: AppTheme.textPrimaryDark,
            ),
          ),

          // Username
          Text(
            _userProfile['username'],
            style: GoogleFonts.inter(
              fontSize: 14.sp,
              color: AppTheme.textSecondaryDark,
            ),
          ),

          SizedBox(height: 3.h),

          // Followers and Following
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildFollowStat(
                  _userProfile['followers'].toString(), 'followers'),
              Container(
                width: 1,
                height: 4.h,
                color: AppTheme.dividerDark,
              ),
              _buildFollowStat(
                  '${(_userProfile['following'] / 1000).toStringAsFixed(1)}k',
                  'following'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFollowStat(String count, String label) {
    return Column(
      children: [
        Text(
          count,
          style: GoogleFonts.inter(
            fontSize: 20.sp,
            fontWeight: FontWeight.w700,
            color: AppTheme.textPrimaryDark,
          ),
        ),
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 14.sp,
            color: AppTheme.textSecondaryDark,
          ),
        ),
      ],
    );
  }

  Widget _buildStatsSection() {
    return Row(
      children: [
        Expanded(
          child: Container(
            padding: EdgeInsets.all(4.w),
            decoration: BoxDecoration(
              color: AppTheme.surfaceDark,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.dividerDark.withAlpha(77)),
            ),
            child: Column(
              children: [
                Text(
                  _userProfile['level'],
                  style: GoogleFonts.inter(
                    fontSize: 16.sp,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.primaryDark,
                  ),
                ),
                SizedBox(height: 1.h),
                Text(
                  'Since ${_userProfile['joinDate']}',
                  style: GoogleFonts.inter(
                    fontSize: 12.sp,
                    color: AppTheme.textSecondaryDark,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildBodyMetrics() {
    return Container(
      padding: EdgeInsets.all(6.w),
      decoration: BoxDecoration(
        color: AppTheme.surfaceDark,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.dividerDark.withAlpha(77)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Body Metrics',
            style: GoogleFonts.inter(
              fontSize: 18.sp,
              fontWeight: FontWeight.w600,
              color: AppTheme.textPrimaryDark,
            ),
          ),
          SizedBox(height: 3.h),
          Row(
            children: [
              Expanded(
                child: _buildMetricItem('Age', '${_userProfile['age']} yrs'),
              ),
              Expanded(
                child:
                    _buildMetricItem('Weight', '${_userProfile['weight']} kg'),
              ),
            ],
          ),
          SizedBox(height: 2.h),
          Row(
            children: [
              Expanded(
                child:
                    _buildMetricItem('Height', '${_userProfile['height']} cm'),
              ),
              Expanded(
                child: _buildMetricItem(
                    'Fat', '${_userProfile['fatPercentage']}%'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMetricItem(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 14.sp,
            color: AppTheme.textSecondaryDark,
          ),
        ),
        SizedBox(height: 0.5.h),
        Text(
          value,
          style: GoogleFonts.inter(
            fontSize: 18.sp,
            fontWeight: FontWeight.w600,
            color: AppTheme.textPrimaryDark,
          ),
        ),
      ],
    );
  }

  Widget _buildActivityTracking() {
    return Container(
      padding: EdgeInsets.all(6.w),
      decoration: BoxDecoration(
        color: AppTheme.surfaceDark,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.dividerDark.withAlpha(77)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Activity Tracking',
            style: GoogleFonts.inter(
              fontSize: 18.sp,
              fontWeight: FontWeight.w600,
              color: AppTheme.textPrimaryDark,
            ),
          ),
          SizedBox(height: 3.h),
          GridView.builder(
            shrinkWrap: true,
            physics: NeverScrollableScrollPhysics(),
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 3.w,
              mainAxisSpacing: 2.h,
              childAspectRatio: 1.5,
            ),
            itemCount: _activityStats.length,
            itemBuilder: (context, index) {
              final stat = _activityStats[index];
              return Container(
                padding: EdgeInsets.all(4.w),
                decoration: BoxDecoration(
                  color: AppTheme.backgroundDark,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppTheme.dividerDark.withAlpha(77)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(
                      stat['icon'],
                      color: stat['color'],
                      size: 20,
                    ),
                    Spacer(),
                    Text(
                      stat['value'],
                      style: GoogleFonts.inter(
                        fontSize: 16.sp,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.textPrimaryDark,
                      ),
                    ),
                    Text(
                      stat['unit'],
                      style: GoogleFonts.inter(
                        fontSize: 10.sp,
                        color: AppTheme.textSecondaryDark,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildAchievements() {
    return Container(
      padding: EdgeInsets.all(6.w),
      decoration: BoxDecoration(
        color: AppTheme.surfaceDark,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.dividerDark.withAlpha(77)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Achievements',
            style: GoogleFonts.inter(
              fontSize: 18.sp,
              fontWeight: FontWeight.w600,
              color: AppTheme.textPrimaryDark,
            ),
          ),
          SizedBox(height: 3.h),
          ...(_achievements.map((achievement) => Container(
                margin: EdgeInsets.only(bottom: 2.h),
                padding: EdgeInsets.all(4.w),
                decoration: BoxDecoration(
                  color: achievement['earned']
                      ? AppTheme.primaryDark.withAlpha(26)
                      : AppTheme.backgroundDark,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: achievement['earned']
                        ? AppTheme.primaryDark.withAlpha(77)
                        : AppTheme.dividerDark.withAlpha(77),
                  ),
                ),
                child: Row(
                  children: [
                    Text(
                      achievement['icon'],
                      style: TextStyle(fontSize: 24),
                    ),
                    SizedBox(width: 3.w),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            achievement['title'],
                            style: GoogleFonts.inter(
                              fontSize: 14.sp,
                              fontWeight: FontWeight.w600,
                              color: AppTheme.textPrimaryDark,
                            ),
                          ),
                          Text(
                            achievement['description'],
                            style: GoogleFonts.inter(
                              fontSize: 12.sp,
                              color: AppTheme.textSecondaryDark,
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (achievement['earned'])
                      Icon(
                        Icons.check_circle,
                        color: AppTheme.primaryDark,
                        size: 20,
                      ),
                  ],
                ),
              ))).toList(),
        ],
      ),
    );
  }
}