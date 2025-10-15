import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:sizer/sizer.dart';

import '../../core/app_export.dart';
import './widgets/meal_card_widget.dart';
import './widgets/meal_customization_sheet.dart';
import './widgets/nutrition_breakdown_sheet.dart';
import './widgets/quick_actions_menu.dart';
import './widgets/weekly_calendar_widget.dart';

class MealPlanning extends StatefulWidget {
  const MealPlanning({Key? key}) : super(key: key);

  @override
  State<MealPlanning> createState() => _MealPlanningState();
}

class _MealPlanningState extends State<MealPlanning>
    with TickerProviderStateMixin {
  int _currentIndex = 1; // Meals tab is index 1
  DateTime selectedDate = DateTime.now();
  bool isLoading = false;
  bool isRegenerating = false;
  late AnimationController _fabAnimationController;
  late Animation<double> _fabAnimation;

  final List<Map<String, dynamic>> weeklyMealPlan = [
    {
      'date': DateTime.now(),
      'meals': [
        {
          'type': 'breakfast',
          'recipeName': 'Avocado Toast with Poached Egg',
          'prepTime': 15,
          'calories': 320,
          'image':
              'https://images.unsplash.com/photo-1638425637281-3a797b21e961',
          'semanticLabel':
              'Golden avocado toast topped with a perfectly poached egg, garnished with microgreens on a white ceramic plate',
          'dietary': ['Vegetarian', 'Gluten-Free'],
          'isFavorite': true,
          'nutrition': {
            'calories': 320,
            'protein': 14.0,
            'carbs': 28.0,
            'fat': 18.0,
            'fiber': 12.0,
            'sugar': 3.0,
            'sodium': 420.0,
          },
        },
        {
          'type': 'lunch',
          'recipeName': 'Mediterranean Quinoa Bowl',
          'prepTime': 25,
          'calories': 450,
          'image':
              'https://images.unsplash.com/photo-1603916652323-eec90c9db0ee',
          'semanticLabel':
              'Colorful quinoa bowl with cherry tomatoes, cucumber, olives, and feta cheese drizzled with olive oil',
          'dietary': ['Vegetarian', 'Mediterranean'],
          'isFavorite': false,
          'nutrition': {
            'calories': 450,
            'protein': 16.0,
            'carbs': 52.0,
            'fat': 20.0,
            'fiber': 8.0,
            'sugar': 6.0,
            'sodium': 680.0,
          },
        },
        {
          'type': 'dinner',
          'recipeName': 'Grilled Salmon with Asparagus',
          'prepTime': 30,
          'calories': 380,
          'image':
              'https://images.unsplash.com/photo-1662721844198-1e6bcf29f932',
          'semanticLabel':
              'Perfectly grilled salmon fillet with roasted asparagus spears and lemon wedges on a dark slate plate',
          'dietary': ['Keto', 'Low-Carb'],
          'isFavorite': true,
          'nutrition': {
            'calories': 380,
            'protein': 35.0,
            'carbs': 8.0,
            'fat': 24.0,
            'fiber': 4.0,
            'sugar': 4.0,
            'sodium': 520.0,
          },
        },
        {
          'type': 'snack',
          'recipeName': 'Greek Yogurt with Berries',
          'prepTime': 5,
          'calories': 180,
          'image':
              'https://images.unsplash.com/photo-1670843839025-d50924a51f31',
          'semanticLabel':
              'Creamy Greek yogurt topped with fresh blueberries, strawberries, and a drizzle of honey in a glass bowl',
          'dietary': ['Vegetarian', 'High-Protein'],
          'isFavorite': false,
          'nutrition': {
            'calories': 180,
            'protein': 15.0,
            'carbs': 22.0,
            'fat': 4.0,
            'fiber': 3.0,
            'sugar': 18.0,
            'sodium': 85.0,
          },
        },
      ],
    },
    {
      'date': DateTime.now().add(const Duration(days: 1)),
      'meals': [
        {
          'type': 'breakfast',
          'recipeName': 'Overnight Oats with Chia Seeds',
          'prepTime': 10,
          'calories': 290,
          'image':
              'https://images.unsplash.com/photo-1610450622351-340b283813b9',
          'semanticLabel':
              'Mason jar filled with creamy overnight oats topped with chia seeds, sliced banana, and chopped almonds',
          'dietary': ['Vegan', 'High-Fiber'],
          'isFavorite': false,
          'nutrition': {
            'calories': 290,
            'protein': 8.0,
            'carbs': 45.0,
            'fat': 9.0,
            'fiber': 10.0,
            'sugar': 12.0,
            'sodium': 150.0,
          },
        },
        {
          'type': 'lunch',
          'recipeName': 'Asian Chicken Lettuce Wraps',
          'prepTime': 20,
          'calories': 320,
          'image':
              'https://images.unsplash.com/photo-1587106118745-e44172d856d6',
          'semanticLabel':
              'Fresh butter lettuce cups filled with seasoned ground chicken, diced vegetables, and garnished with cilantro',
          'dietary': ['Low-Carb', 'Gluten-Free'],
          'isFavorite': true,
          'nutrition': {
            'calories': 320,
            'protein': 28.0,
            'carbs': 12.0,
            'fat': 18.0,
            'fiber': 4.0,
            'sugar': 8.0,
            'sodium': 890.0,
          },
        },
        {
          'type': 'dinner',
          'recipeName': 'Vegetarian Lentil Curry',
          'prepTime': 35,
          'calories': 420,
          'image':
              'https://images.unsplash.com/photo-1652022113456-644e7409b806',
          'semanticLabel':
              'Rich and aromatic lentil curry with coconut milk, served with basmati rice and fresh cilantro garnish',
          'dietary': ['Vegan', 'Indian'],
          'isFavorite': false,
          'nutrition': {
            'calories': 420,
            'protein': 18.0,
            'carbs': 58.0,
            'fat': 12.0,
            'fiber': 16.0,
            'sugar': 8.0,
            'sodium': 720.0,
          },
        },
        {
          'type': 'snack',
          'recipeName': 'Apple Slices with Almond Butter',
          'prepTime': 3,
          'calories': 200,
          'image':
              'https://images.unsplash.com/photo-1636686147019-307e1eca3489',
          'semanticLabel':
              'Crisp apple slices arranged on a plate with a small bowl of creamy almond butter for dipping',
          'dietary': ['Vegan', 'Gluten-Free'],
          'isFavorite': true,
          'nutrition': {
            'calories': 200,
            'protein': 6.0,
            'carbs': 20.0,
            'fat': 12.0,
            'fiber': 6.0,
            'sugar': 16.0,
            'sodium': 2.0,
          },
        },
      ],
    },
  ];

  @override
  void initState() {
    super.initState();
    _fabAnimationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _fabAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _fabAnimationController, curve: Curves.easeInOut),
    );
    _fabAnimationController.forward();
  }

  @override
  void dispose() {
    _fabAnimationController.dispose();
    super.dispose();
  }

  List<Map<String, dynamic>> _getMealsForDate(DateTime date) {
    final dayPlan = weeklyMealPlan.firstWhere(
      (plan) => _isSameDay((plan['date'] as DateTime), date),
      orElse: () => {'meals': <Map<String, dynamic>>[]},
    );
    return (dayPlan['meals'] as List?)?.cast<Map<String, dynamic>>() ??
        <Map<String, dynamic>>[];
  }

  bool _isSameDay(DateTime date1, DateTime date2) {
    return date1.year == date2.year &&
        date1.month == date2.month &&
        date1.day == date2.day;
  }

  void _onDateSelected(DateTime date) {
    setState(() {
      selectedDate = date;
    });
  }

  void _onPreviousWeek() {
    setState(() {
      selectedDate = selectedDate.subtract(const Duration(days: 7));
    });
  }

  void _onNextWeek() {
    setState(() {
      selectedDate = selectedDate.add(const Duration(days: 7));
    });
  }

  Future<void> _refreshMealPlan() async {
    setState(() {
      isLoading = true;
    });

    // Simulate AI meal plan generation
    await Future.delayed(const Duration(seconds: 2));

    setState(() {
      isLoading = false;
    });

    Fluttertoast.showToast(
      msg: "Meal plan refreshed with new AI suggestions!",
      toastLength: Toast.LENGTH_SHORT,
      gravity: ToastGravity.BOTTOM,
    );
  }

  void _showMealCustomization() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => MealCustomizationSheet(
        onCustomizationApplied: (customization) {
          _regenerateMealPlan(customization);
        },
      ),
    );
  }

  void _regenerateMealPlan(Map<String, dynamic> customization) async {
    setState(() {
      isRegenerating = true;
    });

    // Simulate AI regeneration with customization
    await Future.delayed(const Duration(seconds: 3));

    setState(() {
      isRegenerating = false;
    });

    Fluttertoast.showToast(
      msg: "Meal plan regenerated with your preferences!",
      toastLength: Toast.LENGTH_LONG,
      gravity: ToastGravity.BOTTOM,
    );
  }

  void _showNutritionBreakdown(Map<String, dynamic> meal) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => NutritionBreakdownSheet(
        nutritionData: meal['nutrition'] as Map<String, dynamic>? ?? {},
      ),
    );
  }

  void _showQuickActions(Map<String, dynamic> meal) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => QuickActionsMenu(
        onSwapRecipe: () {
          Navigator.pop(context);
          _swapRecipe(meal);
        },
        onAddToFavorites: () {
          Navigator.pop(context);
          _addToFavorites(meal);
        },
        onGenerateGroceryList: () {
          Navigator.pop(context);
          _generateGroceryList();
        },
        onViewRecipe: () {
          Navigator.pop(context);
          _viewRecipeDetails(meal);
        },
      ),
    );
  }

  void _swapRecipe(Map<String, dynamic> meal) {
    Fluttertoast.showToast(
      msg: "Finding alternative recipe for ${meal['recipeName']}...",
      toastLength: Toast.LENGTH_SHORT,
      gravity: ToastGravity.BOTTOM,
    );
  }

  void _addToFavorites(Map<String, dynamic> meal) {
    setState(() {
      meal['isFavorite'] = !(meal['isFavorite'] as bool? ?? false);
    });

    final isFavorite = meal['isFavorite'] as bool;
    Fluttertoast.showToast(
      msg: isFavorite
          ? "Added ${meal['recipeName']} to favorites!"
          : "Removed ${meal['recipeName']} from favorites!",
      toastLength: Toast.LENGTH_SHORT,
      gravity: ToastGravity.BOTTOM,
    );
  }

  void _generateGroceryList() {
    Fluttertoast.showToast(
      msg: "Generating grocery list for this week's meals...",
      toastLength: Toast.LENGTH_SHORT,
      gravity: ToastGravity.BOTTOM,
    );
  }

  void _viewRecipeDetails(Map<String, dynamic> meal) {
    Fluttertoast.showToast(
      msg: "Opening recipe details for ${meal['recipeName']}...",
      toastLength: Toast.LENGTH_SHORT,
      gravity: ToastGravity.BOTTOM,
    );
  }

  void _onBottomNavTap(int index) {
    if (_currentIndex == index) return;

    setState(() {
      _currentIndex = index;
    });

    switch (index) {
      case 0:
        Navigator.pushNamed(context, AppRoutes.dashboardHome);
        break;
      case 1:
        // Already on meal planning
        break;
      case 2:
        Navigator.pushNamed(context, AppRoutes.workoutPrograms);
        break;
      case 3:
        Navigator.pushNamed(context, AppRoutes.profileScreen);
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final mealsForSelectedDate = _getMealsForDate(selectedDate);

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: Text(
          'Meal Planning',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w600,
                color: Theme.of(context).colorScheme.onSurface,
              ),
        ),
        backgroundColor: Theme.of(context).colorScheme.surface,
        elevation: 0,
        actions: [
          IconButton(
            onPressed: _generateGroceryList,
            icon: CustomIconWidget(
              iconName: 'shopping_cart',
              color: Theme.of(context).colorScheme.primary,
              size: 24,
            ),
          ),
          IconButton(
            onPressed: () =>
                Navigator.pushNamed(context, AppRoutes.adminSettingsScreen),
            icon: CustomIconWidget(
              iconName: 'settings',
              color: Theme.of(context).colorScheme.onSurface,
              size: 24,
            ),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _refreshMealPlan,
        color: Theme.of(context).colorScheme.primary,
        child: Column(
          children: [
            // Weekly Calendar
            Container(
              margin: EdgeInsets.all(4.w),
              child: WeeklyCalendarWidget(
                selectedDate: selectedDate,
                onDateSelected: _onDateSelected,
                onPreviousWeek: _onPreviousWeek,
                onNextWeek: _onNextWeek,
              ),
            ),

            // Meals List
            Expanded(
              child: isRegenerating
                  ? _buildLoadingSkeleton()
                  : mealsForSelectedDate.isEmpty
                      ? _buildEmptyState()
                      : ListView.builder(
                          padding: EdgeInsets.only(bottom: 10.h),
                          itemCount: mealsForSelectedDate.length,
                          itemBuilder: (context, index) {
                            final meal = mealsForSelectedDate[index];
                            return MealCardWidget(
                              meal: meal,
                              onTap: () => _viewRecipeDetails(meal),
                              onLongPress: () => _showQuickActions(meal),
                              onSwipeUp: () => _showNutritionBreakdown(meal),
                            );
                          },
                        ),
            ),
          ],
        ),
      ),
      floatingActionButton: ScaleTransition(
        scale: _fabAnimation,
        child: FloatingActionButton.extended(
          onPressed: _showMealCustomization,
          backgroundColor: Theme.of(context).colorScheme.primary,
          foregroundColor: Theme.of(context).colorScheme.onPrimary,
          icon: CustomIconWidget(
            iconName: 'tune',
            color: Theme.of(context).colorScheme.onPrimary,
            size: 24,
          ),
          label: Text(
            'Customize',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: Theme.of(context).colorScheme.onPrimary,
                  fontWeight: FontWeight.w600,
                ),
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
    );
  }

  Widget _buildLoadingSkeleton() {
    return ListView.builder(
      padding: EdgeInsets.symmetric(horizontal: 4.w),
      itemCount: 4,
      itemBuilder: (context, index) {
        return Container(
          margin: EdgeInsets.symmetric(vertical: 1.h),
          height: 25.h,
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surface,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            children: [
              Container(
                height: 15.h,
                decoration: BoxDecoration(
                  color: Theme.of(context)
                      .colorScheme
                      .onSurfaceVariant
                      .withValues(alpha: 0.1),
                  borderRadius:
                      const BorderRadius.vertical(top: Radius.circular(16)),
                ),
              ),
              Expanded(
                child: Padding(
                  padding: EdgeInsets.all(4.w),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        height: 2.h,
                        width: 60.w,
                        decoration: BoxDecoration(
                          color: Theme.of(context)
                              .colorScheme
                              .onSurfaceVariant
                              .withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                      SizedBox(height: 1.h),
                      Container(
                        height: 1.5.h,
                        width: 40.w,
                        decoration: BoxDecoration(
                          color: Theme.of(context)
                              .colorScheme
                              .onSurfaceVariant
                              .withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CustomIconWidget(
            iconName: 'restaurant_menu',
            color: Theme.of(context).colorScheme.onSurfaceVariant,
            size: 64,
          ),
          SizedBox(height: 2.h),
          Text(
            'No meals planned for this day',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
          ),
          SizedBox(height: 1.h),
          Text(
            'Tap the customize button to generate a meal plan',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}