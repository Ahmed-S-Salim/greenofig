import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

class MealCustomizationSheet extends StatefulWidget {
  final Function(Map<String, dynamic>) onCustomizationApplied;

  const MealCustomizationSheet({
    Key? key,
    required this.onCustomizationApplied,
  }) : super(key: key);

  @override
  State<MealCustomizationSheet> createState() => _MealCustomizationSheetState();
}

class _MealCustomizationSheetState extends State<MealCustomizationSheet> {
  String selectedDiet = 'balanced';
  String selectedCuisine = 'international';
  double budgetRange = 50.0;
  int servings = 2;
  List<String> selectedAllergies = [];

  final List<Map<String, dynamic>> dietTypes = [
    {'id': 'balanced', 'name': 'Balanced', 'icon': 'restaurant'},
    {'id': 'vegan', 'name': 'Vegan', 'icon': 'eco'},
    {'id': 'vegetarian', 'name': 'Vegetarian', 'icon': 'local_florist'},
    {'id': 'keto', 'name': 'Keto', 'icon': 'fitness_center'},
    {'id': 'paleo', 'name': 'Paleo', 'icon': 'nature'},
    {'id': 'mediterranean', 'name': 'Mediterranean', 'icon': 'waves'},
    {'id': 'halal', 'name': 'Halal', 'icon': 'mosque'},
    {'id': 'kosher', 'name': 'Kosher', 'icon': 'star'},
  ];

  final List<Map<String, dynamic>> cuisineTypes = [
    {'id': 'international', 'name': 'International', 'flag': '🌍'},
    {'id': 'italian', 'name': 'Italian', 'flag': '🇮🇹'},
    {'id': 'asian', 'name': 'Asian', 'flag': '🥢'},
    {'id': 'mexican', 'name': 'Mexican', 'flag': '🇲🇽'},
    {'id': 'indian', 'name': 'Indian', 'flag': '🇮🇳'},
    {'id': 'middle_eastern', 'name': 'Middle Eastern', 'flag': '🕌'},
    {'id': 'american', 'name': 'American', 'flag': '🇺🇸'},
    {'id': 'french', 'name': 'French', 'flag': '🇫🇷'},
  ];

  final List<String> commonAllergies = [
    'Nuts',
    'Dairy',
    'Gluten',
    'Eggs',
    'Soy',
    'Shellfish',
    'Fish',
    'Sesame'
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 85.h,
      decoration: BoxDecoration(
        color: AppTheme.lightTheme.colorScheme.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          // Handle bar
          Container(
            margin: EdgeInsets.only(top: 1.h),
            width: 12.w,
            height: 0.5.h,
            decoration: BoxDecoration(
              color: AppTheme.lightTheme.colorScheme.onSurfaceVariant
                  .withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          // Header
          Padding(
            padding: EdgeInsets.all(4.w),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Customize Meal Plan',
                  style: AppTheme.lightTheme.textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: AppTheme.lightTheme.colorScheme.onSurface,
                  ),
                ),
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    padding: EdgeInsets.all(2.w),
                    decoration: BoxDecoration(
                      color: AppTheme.lightTheme.colorScheme.onSurfaceVariant
                          .withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: CustomIconWidget(
                      iconName: 'close',
                      color: AppTheme.lightTheme.colorScheme.onSurfaceVariant,
                      size: 20,
                    ),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.symmetric(horizontal: 4.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Diet Type Section
                  _buildSectionTitle('Diet Type'),
                  SizedBox(height: 2.h),
                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 3,
                      crossAxisSpacing: 3.w,
                      mainAxisSpacing: 2.h,
                    ),
                    itemCount: dietTypes.length,
                    itemBuilder: (context, index) {
                      final diet = dietTypes[index];
                      final isSelected = selectedDiet == diet['id'];
                      return GestureDetector(
                        onTap: () => setState(() => selectedDiet = diet['id']),
                        child: Container(
                          padding: EdgeInsets.symmetric(
                              horizontal: 3.w, vertical: 1.h),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? AppTheme.lightTheme.colorScheme.primary
                                : AppTheme.lightTheme.colorScheme.surface,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isSelected
                                  ? AppTheme.lightTheme.colorScheme.primary
                                  : AppTheme.lightTheme.colorScheme.outline,
                            ),
                          ),
                          child: Row(
                            children: [
                              CustomIconWidget(
                                iconName: diet['icon'],
                                color: isSelected
                                    ? AppTheme.lightTheme.colorScheme.onPrimary
                                    : AppTheme.lightTheme.colorScheme.onSurface,
                                size: 20,
                              ),
                              SizedBox(width: 2.w),
                              Expanded(
                                child: Text(
                                  diet['name'],
                                  style: AppTheme
                                      .lightTheme.textTheme.bodyMedium
                                      ?.copyWith(
                                    color: isSelected
                                        ? AppTheme
                                            .lightTheme.colorScheme.onPrimary
                                        : AppTheme
                                            .lightTheme.colorScheme.onSurface,
                                    fontWeight: FontWeight.w500,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                  SizedBox(height: 3.h),

                  // Cuisine Type Section
                  _buildSectionTitle('Cuisine Preference'),
                  SizedBox(height: 2.h),
                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 3,
                      crossAxisSpacing: 3.w,
                      mainAxisSpacing: 2.h,
                    ),
                    itemCount: cuisineTypes.length,
                    itemBuilder: (context, index) {
                      final cuisine = cuisineTypes[index];
                      final isSelected = selectedCuisine == cuisine['id'];
                      return GestureDetector(
                        onTap: () =>
                            setState(() => selectedCuisine = cuisine['id']),
                        child: Container(
                          padding: EdgeInsets.symmetric(
                              horizontal: 3.w, vertical: 1.h),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? AppTheme.lightTheme.colorScheme.primary
                                : AppTheme.lightTheme.colorScheme.surface,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isSelected
                                  ? AppTheme.lightTheme.colorScheme.primary
                                  : AppTheme.lightTheme.colorScheme.outline,
                            ),
                          ),
                          child: Row(
                            children: [
                              Text(
                                cuisine['flag'],
                                style: const TextStyle(fontSize: 20),
                              ),
                              SizedBox(width: 2.w),
                              Expanded(
                                child: Text(
                                  cuisine['name'],
                                  style: AppTheme
                                      .lightTheme.textTheme.bodyMedium
                                      ?.copyWith(
                                    color: isSelected
                                        ? AppTheme
                                            .lightTheme.colorScheme.onPrimary
                                        : AppTheme
                                            .lightTheme.colorScheme.onSurface,
                                    fontWeight: FontWeight.w500,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                  SizedBox(height: 3.h),

                  // Budget Section
                  _buildSectionTitle('Weekly Budget'),
                  SizedBox(height: 1.h),
                  Text(
                    '\$${budgetRange.round()}',
                    style:
                        AppTheme.lightTheme.textTheme.headlineSmall?.copyWith(
                      color: AppTheme.lightTheme.colorScheme.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Slider(
                    value: budgetRange,
                    min: 20,
                    max: 200,
                    divisions: 18,
                    onChanged: (value) => setState(() => budgetRange = value),
                    activeColor: AppTheme.lightTheme.colorScheme.primary,
                    inactiveColor: AppTheme.lightTheme.colorScheme.outline,
                  ),
                  SizedBox(height: 2.h),

                  // Servings Section
                  _buildSectionTitle('Number of Servings'),
                  SizedBox(height: 2.h),
                  Row(
                    children: [
                      GestureDetector(
                        onTap: () => setState(
                            () => servings = servings > 1 ? servings - 1 : 1),
                        child: Container(
                          padding: EdgeInsets.all(3.w),
                          decoration: BoxDecoration(
                            color: AppTheme.lightTheme.colorScheme.primary
                                .withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: CustomIconWidget(
                            iconName: 'remove',
                            color: AppTheme.lightTheme.colorScheme.primary,
                            size: 20,
                          ),
                        ),
                      ),
                      Expanded(
                        child: Center(
                          child: Text(
                            servings.toString(),
                            style: AppTheme.lightTheme.textTheme.headlineSmall
                                ?.copyWith(
                              fontWeight: FontWeight.w600,
                              color: AppTheme.lightTheme.colorScheme.onSurface,
                            ),
                          ),
                        ),
                      ),
                      GestureDetector(
                        onTap: () => setState(
                            () => servings = servings < 8 ? servings + 1 : 8),
                        child: Container(
                          padding: EdgeInsets.all(3.w),
                          decoration: BoxDecoration(
                            color: AppTheme.lightTheme.colorScheme.primary
                                .withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: CustomIconWidget(
                            iconName: 'add',
                            color: AppTheme.lightTheme.colorScheme.primary,
                            size: 20,
                          ),
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 3.h),

                  // Allergies Section
                  _buildSectionTitle('Allergies & Restrictions'),
                  SizedBox(height: 2.h),
                  Wrap(
                    spacing: 2.w,
                    runSpacing: 1.h,
                    children: commonAllergies.map((allergy) {
                      final isSelected = selectedAllergies.contains(allergy);
                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            isSelected
                                ? selectedAllergies.remove(allergy)
                                : selectedAllergies.add(allergy);
                          });
                        },
                        child: Container(
                          padding: EdgeInsets.symmetric(
                              horizontal: 4.w, vertical: 1.5.h),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? AppTheme.lightTheme.colorScheme.primary
                                : AppTheme.lightTheme.colorScheme.surface,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: isSelected
                                  ? AppTheme.lightTheme.colorScheme.primary
                                  : AppTheme.lightTheme.colorScheme.outline,
                            ),
                          ),
                          child: Text(
                            allergy,
                            style: AppTheme.lightTheme.textTheme.bodyMedium
                                ?.copyWith(
                              color: isSelected
                                  ? AppTheme.lightTheme.colorScheme.onPrimary
                                  : AppTheme.lightTheme.colorScheme.onSurface,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  SizedBox(height: 4.h),
                ],
              ),
            ),
          ),
          // Apply Button
          Container(
            padding: EdgeInsets.all(4.w),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  widget.onCustomizationApplied({
                    'diet': selectedDiet,
                    'cuisine': selectedCuisine,
                    'budget': budgetRange,
                    'servings': servings,
                    'allergies': selectedAllergies,
                  });
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(
                  padding: EdgeInsets.symmetric(vertical: 2.h),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: Text(
                  'Apply Customization',
                  style: AppTheme.lightTheme.textTheme.titleMedium?.copyWith(
                    color: AppTheme.lightTheme.colorScheme.onPrimary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: AppTheme.lightTheme.textTheme.titleMedium?.copyWith(
        fontWeight: FontWeight.w600,
        color: AppTheme.lightTheme.colorScheme.onSurface,
      ),
    );
  }
}
