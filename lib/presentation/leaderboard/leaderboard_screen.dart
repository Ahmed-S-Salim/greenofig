import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../core/app_export.dart';

class LeaderboardScreen extends StatefulWidget {
  const LeaderboardScreen({Key? key}) : super(key: key);

  @override
  State<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends State<LeaderboardScreen> {
  final List<Map<String, dynamic>> _leaderboardUsers = [
    {
      'rank': 1,
      'name': 'Regina Fly',
      'points': 2850,
      'level': 'Elite',
      'avatar': 'https://images.unsplash.com/photo-1684262855358-88f296a2cfc2',
      'semanticLabel':
          'Young professional woman with blonde hair and confident smile',
      'badge': '🏆',
      'achievements': 12,
    },
    {
      'rank': 2,
      'name': 'Alex Freedman',
      'points': 2720,
      'level': 'Expert',
      'avatar': 'https://images.unsplash.com/photo-1682403790767-77013d45524d',
      'semanticLabel':
          'Professional man with dark hair and friendly expression',
      'badge': '🥈',
      'achievements': 10,
    },
    {
      'rank': 3,
      'name': 'Matthew Apostal',
      'points': 2650,
      'level': 'Expert',
      'avatar': 'https://images.unsplash.com/photo-1723189520204-0716614de54a',
      'semanticLabel': 'Young man with curly brown hair wearing casual shirt',
      'badge': '🥉',
      'achievements': 9,
    },
    {
      'rank': 4,
      'name': 'Sarah Johnson',
      'points': 2480,
      'level': 'Advanced',
      'avatar': 'https://images.unsplash.com/photo-1636579393748-93a2d82655da',
      'semanticLabel': 'Professional woman with brown hair and warm smile',
      'badge': '⭐',
      'achievements': 8,
    },
    {
      'rank': 5,
      'name': 'Michael Chen',
      'points': 2350,
      'level': 'Advanced',
      'avatar': 'https://images.unsplash.com/photo-1687256457585-3608dfa736c5',
      'semanticLabel':
          'Asian man with short black hair and professional appearance',
      'badge': '⭐',
      'achievements': 7,
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
          'Leaderboard',
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
            icon: Icon(Icons.more_vert, color: AppTheme.textPrimaryDark),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          // Podium Section
          Container(
            height: 35.h,
            margin: EdgeInsets.all(4.w),
            child: Stack(
              children: [
                // Background decoration
                Positioned.fill(
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          AppTheme.primaryDark.withAlpha(26),
                          AppTheme.backgroundDark,
                        ],
                      ),
                      borderRadius: BorderRadius.circular(20),
                    ),
                  ),
                ),

                // Podium positions
                Positioned(
                  bottom: 5.h,
                  left: 50.w - 15.w,
                  child:
                      _buildPodiumPosition(_leaderboardUsers[0], isFirst: true),
                ),
                Positioned(
                  bottom: 2.h,
                  left: 15.w,
                  child: _buildPodiumPosition(_leaderboardUsers[1]),
                ),
                Positioned(
                  bottom: 2.h,
                  right: 15.w,
                  child: _buildPodiumPosition(_leaderboardUsers[2]),
                ),
              ],
            ),
          ),

          // Rankings List
          Expanded(
            child: Container(
              margin: EdgeInsets.symmetric(horizontal: 4.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'All Rankings',
                    style: GoogleFonts.inter(
                      fontSize: 18.sp,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textPrimaryDark,
                    ),
                  ),
                  SizedBox(height: 2.h),
                  Expanded(
                    child: ListView.builder(
                      itemCount: _leaderboardUsers.length,
                      itemBuilder: (context, index) {
                        return _buildLeaderboardItem(
                            _leaderboardUsers[index], index);
                      },
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

  Widget _buildPodiumPosition(Map<String, dynamic> user,
      {bool isFirst = false}) {
    return Column(
      children: [
        // Achievement badge
        Container(
          padding: EdgeInsets.all(1.w),
          decoration: BoxDecoration(
            color: AppTheme.primaryDark.withAlpha(51),
            shape: BoxShape.circle,
          ),
          child: Text(
            user['badge'],
            style: TextStyle(fontSize: isFirst ? 20.sp : 16.sp),
          ),
        ),

        SizedBox(height: 1.h),

        // Avatar with border
        Container(
          width: isFirst ? 20.w : 16.w,
          height: isFirst ? 20.w : 16.w,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(
              color: AppTheme.primaryDark,
              width: isFirst ? 3 : 2,
            ),
            boxShadow: [
              BoxShadow(
                color: AppTheme.primaryDark.withAlpha(77),
                blurRadius: 10,
                offset: Offset(0, 5),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(100),
            child: CustomImageWidget(
              imageUrl: user['avatar'],
              semanticLabel: user['semanticLabel'],
              fit: BoxFit.cover,
            ),
          ),
        ),

        SizedBox(height: 1.h),

        // Name
        Text(
          user['name'],
          style: GoogleFonts.inter(
            fontSize: isFirst ? 14.sp : 12.sp,
            fontWeight: FontWeight.w600,
            color: AppTheme.textPrimaryDark,
          ),
          textAlign: TextAlign.center,
        ),

        // Points
        Text(
          '${user['points']} pts',
          style: GoogleFonts.inter(
            fontSize: isFirst ? 12.sp : 10.sp,
            fontWeight: FontWeight.w500,
            color: AppTheme.primaryDark,
          ),
        ),
      ],
    );
  }

  Widget _buildLeaderboardItem(Map<String, dynamic> user, int index) {
    final bool isTopThree = user['rank'] <= 3;

    return Container(
      margin: EdgeInsets.only(bottom: 2.h),
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: AppTheme.surfaceDark,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isTopThree
              ? AppTheme.primaryDark.withAlpha(77)
              : AppTheme.dividerDark.withAlpha(77),
        ),
      ),
      child: Row(
        children: [
          // Rank
          Container(
            width: 12.w,
            height: 12.w,
            decoration: BoxDecoration(
              color: isTopThree ? AppTheme.primaryDark : AppTheme.dividerDark,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                '${user['rank']}',
                style: GoogleFonts.inter(
                  fontSize: 16.sp,
                  fontWeight: FontWeight.w700,
                  color: isTopThree
                      ? AppTheme.onPrimaryDark
                      : AppTheme.textPrimaryDark,
                ),
              ),
            ),
          ),

          SizedBox(width: 4.w),

          // Avatar
          Container(
            width: 12.w,
            height: 12.w,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: AppTheme.primaryDark.withAlpha(77),
                width: 2,
              ),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(100),
              child: CustomImageWidget(
                imageUrl: user['avatar'],
                semanticLabel: user['semanticLabel'],
                fit: BoxFit.cover,
              ),
            ),
          ),

          SizedBox(width: 4.w),

          // Name and level
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  user['name'],
                  style: GoogleFonts.inter(
                    fontSize: 16.sp,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.textPrimaryDark,
                  ),
                ),
                Text(
                  user['level'],
                  style: GoogleFonts.inter(
                    fontSize: 12.sp,
                    color: AppTheme.textSecondaryDark,
                  ),
                ),
              ],
            ),
          ),

          // Achievements and points
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${user['points']} pts',
                style: GoogleFonts.inter(
                  fontSize: 16.sp,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.primaryDark,
                ),
              ),
              Row(
                children: [
                  Icon(
                    Icons.emoji_events,
                    size: 16,
                    color: AppTheme.textSecondaryDark,
                  ),
                  SizedBox(width: 1.w),
                  Text(
                    '${user['achievements']}',
                    style: GoogleFonts.inter(
                      fontSize: 12.sp,
                      color: AppTheme.textSecondaryDark,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}