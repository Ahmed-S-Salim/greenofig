import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:sizer/sizer.dart';

import '../../core/app_export.dart';
import './widgets/active_workout_button.dart';
import './widgets/current_program_card.dart';
import './widgets/program_card.dart';
import './widgets/program_category_filter.dart';

class WorkoutPrograms extends StatefulWidget {
  const WorkoutPrograms({Key? key}) : super(key: key);

  @override
  State<WorkoutPrograms> createState() => _WorkoutProgramsState();
}

class _WorkoutProgramsState extends State<WorkoutPrograms> {
  String selectedCategory = 'All';
  List<Map<String, dynamic>> filteredPrograms = [];

  final List<String> categories = [
    'All',
    'Strength',
    'Cardio',
    'Flexibility',
    'Sports'
  ];

  final Map<String, dynamic> currentProgram = {
    'name': 'Full Body Strength',
    'progress': 65.0,
    'completedWorkouts': 13,
    'totalWorkouts': 20,
  };

  final Map<String, dynamic>? activeWorkout = {
    'name': 'Upper Body Blast',
    'currentExercise': 3,
    'totalExercises': 8,
    'timeRemaining': '12:45',
  };

  final List<Map<String, dynamic>> allPrograms = [
    {
      'id': 1,
      'name': 'HIIT Fat Burner',
      'description':
          'High-intensity interval training designed to maximize calorie burn and improve cardiovascular fitness in minimal time.',
      'category': 'Cardio',
      'difficulty': 'Intermediate',
      'duration': '25 min',
      'equipment': 'No Equipment',
      'rating': 4.8,
      'reviews': 1247,
      'isBookmarked': true,
      'thumbnail':
          'https://images.unsplash.com/photo-1675610070090-271e493c3d59',
      'thumbnailSemanticLabel':
          'Athletic woman in black workout clothes performing high-intensity exercises in a modern gym with equipment in the background',
    },
    {
      'id': 2,
      'name': 'Beginner Strength Builder',
      'description':
          'Perfect introduction to strength training with bodyweight exercises and light weights to build foundational muscle.',
      'category': 'Strength',
      'difficulty': 'Beginner',
      'duration': '30 min',
      'equipment': 'Dumbbells',
      'rating': 4.6,
      'reviews': 892,
      'isBookmarked': false,
      'thumbnail':
          'https://images.unsplash.com/photo-1637532918195-e00c83f7b8f6',
      'thumbnailSemanticLabel':
          'Young man in gray tank top lifting dumbbells in a bright gym with mirrors and exercise equipment',
    },
    {
      'id': 3,
      'name': 'Morning Yoga Flow',
      'description':
          'Gentle yoga sequence to awaken your body and mind, perfect for starting your day with energy and focus.',
      'category': 'Flexibility',
      'difficulty': 'Beginner',
      'duration': '20 min',
      'equipment': 'Yoga Mat',
      'rating': 4.9,
      'reviews': 2156,
      'isBookmarked': true,
      'thumbnail':
          'https://images.unsplash.com/photo-1630225768085-796841e0612f',
      'thumbnailSemanticLabel':
          'Woman in white yoga outfit performing a stretching pose on a purple yoga mat in a peaceful studio with natural lighting',
    },
    {
      'id': 4,
      'name': 'Advanced Powerlifting',
      'description':
          'Intensive strength program focusing on the big three lifts: squat, bench press, and deadlift for serious athletes.',
      'category': 'Strength',
      'difficulty': 'Advanced',
      'duration': '60 min',
      'equipment': 'Barbell & Plates',
      'rating': 4.7,
      'reviews': 634,
      'isBookmarked': false,
      'thumbnail':
          'https://images.unsplash.com/photo-1646072508462-a802209a16f3',
      'thumbnailSemanticLabel':
          'Muscular man in black tank top performing a barbell squat in a professional gym with heavy weights and safety equipment',
    },
    {
      'id': 5,
      'name': 'Basketball Skills Training',
      'description':
          'Sport-specific drills and conditioning to improve your basketball performance, agility, and court awareness.',
      'category': 'Sports',
      'difficulty': 'Intermediate',
      'duration': '45 min',
      'equipment': 'Basketball',
      'rating': 4.5,
      'reviews': 423,
      'isBookmarked': false,
      'thumbnail':
          'https://images.unsplash.com/photo-1612276545667-68c674ff07b8',
      'thumbnailSemanticLabel':
          'Basketball player in red jersey dribbling an orange basketball on an outdoor court with urban buildings in the background',
    },
    {
      'id': 6,
      'name': 'Core Crusher Circuit',
      'description':
          'Targeted abdominal and core strengthening workout using various exercises to build stability and definition.',
      'category': 'Strength',
      'difficulty': 'Intermediate',
      'duration': '15 min',
      'equipment': 'No Equipment',
      'rating': 4.4,
      'reviews': 756,
      'isBookmarked': true,
      'thumbnail':
          'https://images.unsplash.com/photo-1706029831361-0d66343059c7',
      'thumbnailSemanticLabel':
          'Fit woman in black sports bra performing plank exercise on a yoga mat in a bright fitness studio',
    },
    {
      'id': 7,
      'name': 'Evening Stretch & Relax',
      'description':
          'Calming stretching routine designed to release tension and prepare your body for restful sleep.',
      'category': 'Flexibility',
      'difficulty': 'Beginner',
      'duration': '15 min',
      'equipment': 'Yoga Mat',
      'rating': 4.8,
      'reviews': 1834,
      'isBookmarked': false,
      'thumbnail':
          'https://images.unsplash.com/photo-1680543251936-94587c6008d3',
      'thumbnailSemanticLabel':
          'Peaceful woman in comfortable clothing performing gentle stretches on a yoga mat in a dimly lit room with candles',
    },
  ];

  @override
  void initState() {
    super.initState();
    _filterPrograms();
  }

  void _filterPrograms() {
    setState(() {
      if (selectedCategory == 'All') {
        filteredPrograms = List.from(allPrograms);
      } else {
        filteredPrograms = allPrograms
            .where((program) => program['category'] == selectedCategory)
            .toList();
      }
    });
  }

  void _onCategorySelected(String category) {
    setState(() {
      selectedCategory = category;
    });
    _filterPrograms();
  }

  void _startCurrentWorkout() {
    Fluttertoast.showToast(
      msg: "Starting ${currentProgram['name']} workout...",
      toastLength: Toast.LENGTH_SHORT,
      gravity: ToastGravity.BOTTOM,
    );
    // Navigate to workout session
  }

  void _resumeActiveWorkout() {
    Fluttertoast.showToast(
      msg: "Resuming ${activeWorkout!['name']}...",
      toastLength: Toast.LENGTH_SHORT,
      gravity: ToastGravity.BOTTOM,
    );
    // Navigate to active workout session
  }

  void _onProgramTap(Map<String, dynamic> program) {
    Fluttertoast.showToast(
      msg: "Opening ${program['name']} details...",
      toastLength: Toast.LENGTH_SHORT,
      gravity: ToastGravity.BOTTOM,
    );
    // Navigate to program details
  }

  void _toggleBookmark(int programId) {
    setState(() {
      final programIndex = allPrograms.indexWhere((p) => p['id'] == programId);
      if (programIndex != -1) {
        allPrograms[programIndex]['isBookmarked'] =
            !allPrograms[programIndex]['isBookmarked'];
      }
      _filterPrograms();
    });

    final program = allPrograms.firstWhere((p) => p['id'] == programId);
    Fluttertoast.showToast(
      msg: program['isBookmarked']
          ? "Added to bookmarks"
          : "Removed from bookmarks",
      toastLength: Toast.LENGTH_SHORT,
      gravity: ToastGravity.BOTTOM,
    );
  }

  void _addToCalendar(Map<String, dynamic> program) {
    Fluttertoast.showToast(
      msg: "Added ${program['name']} to calendar",
      toastLength: Toast.LENGTH_SHORT,
      gravity: ToastGravity.BOTTOM,
    );
  }

  void _shareProgram(Map<String, dynamic> program) {
    Fluttertoast.showToast(
      msg: "Sharing ${program['name']}...",
      toastLength: Toast.LENGTH_SHORT,
      gravity: ToastGravity.BOTTOM,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.lightTheme.scaffoldBackgroundColor,
      appBar: AppBar(
        title: Text(
          'Workout Programs',
          style: AppTheme.lightTheme.appBarTheme.titleTextStyle,
        ),
        backgroundColor: AppTheme.lightTheme.appBarTheme.backgroundColor,
        elevation: AppTheme.lightTheme.appBarTheme.elevation,
        actions: [
          IconButton(
            onPressed: () {
              Navigator.pushNamed(context, '/profile-settings');
            },
            icon: CustomIconWidget(
              iconName: 'person',
              color: AppTheme.lightTheme.colorScheme.onSurface,
              size: 24,
            ),
          ),
          SizedBox(width: 2.w),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Current Program Card
            CurrentProgramCard(
              currentProgram: currentProgram,
              onStartWorkout: _startCurrentWorkout,
            ),

            // Active Workout Button (if exists)
            ActiveWorkoutButton(
              activeWorkout: activeWorkout,
              onTap: _resumeActiveWorkout,
            ),

            // Category Filter
            ProgramCategoryFilter(
              categories: categories,
              selectedCategory: selectedCategory,
              onCategorySelected: _onCategorySelected,
            ),

            // Programs List
            Expanded(
              child: filteredPrograms.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          CustomIconWidget(
                            iconName: 'fitness_center',
                            color: AppTheme
                                .lightTheme.colorScheme.onSurfaceVariant,
                            size: 48,
                          ),
                          SizedBox(height: 2.h),
                          Text(
                            'No programs found',
                            style: AppTheme.lightTheme.textTheme.titleMedium
                                ?.copyWith(
                              color: AppTheme
                                  .lightTheme.colorScheme.onSurfaceVariant,
                            ),
                          ),
                          SizedBox(height: 1.h),
                          Text(
                            'Try selecting a different category',
                            style: AppTheme.lightTheme.textTheme.bodyMedium
                                ?.copyWith(
                              color: AppTheme
                                  .lightTheme.colorScheme.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: EdgeInsets.only(bottom: 2.h),
                      itemCount: filteredPrograms.length,
                      itemBuilder: (context, index) {
                        final program = filteredPrograms[index];
                        return ProgramCard(
                          program: program,
                          onTap: () => _onProgramTap(program),
                          onBookmark: () =>
                              _toggleBookmark(program['id'] as int),
                          onAddToCalendar: () => _addToCalendar(program),
                          onShare: () => _shareProgram(program),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        backgroundColor:
            AppTheme.lightTheme.bottomNavigationBarTheme.backgroundColor,
        selectedItemColor:
            AppTheme.lightTheme.bottomNavigationBarTheme.selectedItemColor,
        unselectedItemColor:
            AppTheme.lightTheme.bottomNavigationBarTheme.unselectedItemColor,
        currentIndex: 2, // Workout Programs tab
        onTap: (index) {
          // Don't navigate if we're already on this screen
          if (index == 2) return;

          switch (index) {
            case 0:
              Navigator.pushReplacementNamed(context, AppRoutes.dashboardHome);
              break;
            case 1:
              Navigator.pushReplacementNamed(context, AppRoutes.mealPlanning);
              break;
            case 2:
              // Current screen - do nothing
              break;
            case 3:
              Navigator.pushReplacementNamed(context, AppRoutes.profileScreen);
              break;
          }
        },
        items: [
          BottomNavigationBarItem(
            icon: CustomIconWidget(
              iconName: 'home',
              color: AppTheme
                  .lightTheme.bottomNavigationBarTheme.unselectedItemColor!,
              size: 24,
            ),
            activeIcon: CustomIconWidget(
              iconName: 'home',
              color: AppTheme
                  .lightTheme.bottomNavigationBarTheme.selectedItemColor!,
              size: 24,
            ),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: CustomIconWidget(
              iconName: 'restaurant',
              color: AppTheme
                  .lightTheme.bottomNavigationBarTheme.unselectedItemColor!,
              size: 24,
            ),
            activeIcon: CustomIconWidget(
              iconName: 'restaurant',
              color: AppTheme
                  .lightTheme.bottomNavigationBarTheme.selectedItemColor!,
              size: 24,
            ),
            label: 'Nutrition',
          ),
          BottomNavigationBarItem(
            icon: CustomIconWidget(
              iconName: 'fitness_center',
              color: AppTheme
                  .lightTheme.bottomNavigationBarTheme.selectedItemColor!,
              size: 24,
            ),
            activeIcon: CustomIconWidget(
              iconName: 'fitness_center',
              color: AppTheme
                  .lightTheme.bottomNavigationBarTheme.selectedItemColor!,
              size: 24,
            ),
            label: 'Fitness',
          ),
          BottomNavigationBarItem(
            icon: CustomIconWidget(
              iconName: 'person',
              color: AppTheme
                  .lightTheme.bottomNavigationBarTheme.unselectedItemColor!,
              size: 24,
            ),
            activeIcon: CustomIconWidget(
              iconName: 'person',
              color: AppTheme
                  .lightTheme.bottomNavigationBarTheme.selectedItemColor!,
              size: 24,
            ),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
