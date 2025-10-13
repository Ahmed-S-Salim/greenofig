import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../core/app_export.dart';

class MealSearchScreen extends StatefulWidget {
  const MealSearchScreen({Key? key}) : super(key: key);

  @override
  State<MealSearchScreen> createState() => _MealSearchScreenState();
}

class _MealSearchScreenState extends State<MealSearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _selectedCategory = 'All';

  final List<String> _categories = [
    'All',
    'Vegetarian',
    'Seafood',
    'High-protein',
    'Keto'
  ];

  final List<Map<String, dynamic>> _mealItems = [
    {
      'name': 'Spicy Thai Seafood Medley',
      'description': 'Fresh seafood with Thai spices and herbs',
      'calories': 320,
      'protein': 28,
      'price': '\$18.99',
      'rating': 4.8,
      'image': 'https://images.unsplash.com/photo-1653295753255-c439bcf20012',
      'semanticLabel':
          'Spicy Thai seafood dish with shrimp, squid, and mussels in red curry sauce with fresh herbs',
      'category': 'Seafood'
    },
    {
      'name': 'Lemon-Herb Butter Salmon',
      'description': 'Grilled salmon with lemon butter sauce',
      'calories': 280,
      'protein': 35,
      'price': '\$22.50',
      'rating': 4.9,
      'image': 'https://images.unsplash.com/photo-1559058789-672da06263d8',
      'semanticLabel':
          'Grilled salmon fillet with golden lemon herb butter sauce and roasted vegetables',
      'category': 'Seafood'
    },
    {
      'name': 'Mediterranean Chickpea Bowl',
      'description': 'Protein-rich chickpeas with Mediterranean flavors',
      'calories': 380,
      'protein': 18,
      'price': '\$14.99',
      'rating': 4.6,
      'image': 'https://images.unsplash.com/photo-1679744034792-705da160c109',
      'semanticLabel':
          'Mediterranean bowl with roasted chickpeas, quinoa, olives, feta cheese, and tahini dressing',
      'category': 'Vegetarian'
    },
    {
      'name': 'Keto Avocado Chicken',
      'description': 'High-fat, low-carb grilled chicken with avocado',
      'calories': 420,
      'protein': 32,
      'price': '\$16.75',
      'rating': 4.7,
      'image': 'https://images.unsplash.com/photo-1623583539009-e5b4d4a33fc4',
      'semanticLabel':
          'Grilled chicken breast topped with sliced avocado, served with leafy greens',
      'category': 'Keto'
    }
  ];

  List<Map<String, dynamic>> get _filteredMeals {
    if (_selectedCategory == 'All') {
      return _mealItems;
    }
    return _mealItems
        .where((meal) => meal['category'] == _selectedCategory)
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundDark,
      appBar: AppBar(
        backgroundColor: AppTheme.backgroundDark,
        elevation: 0,
        title: Text(
          'Search for Meal',
          style: GoogleFonts.inter(
            fontSize: 20.sp,
            fontWeight: FontWeight.w600,
            color: AppTheme.textPrimaryDark,
          ),
        ),
        centerTitle: false,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: AppTheme.textPrimaryDark),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Column(
        children: [
          // Search Bar
          Container(
            margin: EdgeInsets.all(4.w),
            decoration: BoxDecoration(
              color: AppTheme.surfaceDark,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppTheme.dividerDark),
            ),
            child: TextField(
              controller: _searchController,
              style: GoogleFonts.inter(
                color: AppTheme.textPrimaryDark,
                fontSize: 16.sp,
              ),
              decoration: InputDecoration(
                hintText: 'Search meals...',
                hintStyle: GoogleFonts.inter(
                  color: AppTheme.textSecondaryDark,
                ),
                prefixIcon:
                    Icon(Icons.search, color: AppTheme.textSecondaryDark),
                border: InputBorder.none,
                contentPadding:
                    EdgeInsets.symmetric(horizontal: 4.w, vertical: 3.h),
              ),
            ),
          ),

          // Category Chips
          Container(
            height: 50,
            margin: EdgeInsets.symmetric(horizontal: 4.w),
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: _categories.length,
              itemBuilder: (context, index) {
                final category = _categories[index];
                final isSelected = _selectedCategory == category;

                return Container(
                  margin: EdgeInsets.only(right: 2.w),
                  child: FilterChip(
                    label: Text(
                      category,
                      style: GoogleFonts.inter(
                        fontSize: 14.sp,
                        fontWeight: FontWeight.w500,
                        color: isSelected
                            ? AppTheme.onPrimaryDark
                            : AppTheme.textPrimaryDark,
                      ),
                    ),
                    selected: isSelected,
                    onSelected: (selected) {
                      setState(() {
                        _selectedCategory = category;
                      });
                    },
                    backgroundColor: AppTheme.surfaceDark,
                    selectedColor: AppTheme.primaryDark,
                    checkmarkColor: AppTheme.onPrimaryDark,
                    side: BorderSide(
                      color: isSelected
                          ? AppTheme.primaryDark
                          : AppTheme.dividerDark,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                  ),
                );
              },
            ),
          ),

          SizedBox(height: 3.h),

          // Meal Items Grid
          Expanded(
            child: GridView.builder(
              padding: EdgeInsets.symmetric(horizontal: 4.w),
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 3.w,
                mainAxisSpacing: 2.h,
                childAspectRatio: 0.8,
              ),
              itemCount: _filteredMeals.length,
              itemBuilder: (context, index) {
                final meal = _filteredMeals[index];
                return _buildMealCard(meal);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMealCard(Map<String, dynamic> meal) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.surfaceDark,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.dividerDark.withAlpha(77)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image
          ClipRRect(
            borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
            child: CustomImageWidget(
              imageUrl: meal['image'],
              semanticLabel: meal['semanticLabel'],
              height: 18.h,
              width: double.infinity,
              fit: BoxFit.cover,
            ),
          ),

          Expanded(
            child: Padding(
              padding: EdgeInsets.all(3.w),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    meal['name'],
                    style: GoogleFonts.inter(
                      fontSize: 14.sp,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textPrimaryDark,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),

                  SizedBox(height: 1.h),

                  Text(
                    meal['description'],
                    style: GoogleFonts.inter(
                      fontSize: 12.sp,
                      color: AppTheme.textSecondaryDark,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),

                  Spacer(),

                  // Calories and Protein
                  Row(
                    children: [
                      Container(
                        padding: EdgeInsets.symmetric(
                            horizontal: 2.w, vertical: 0.5.h),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryDark.withAlpha(51),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          '${meal['calories']} kcal',
                          style: GoogleFonts.inter(
                            fontSize: 10.sp,
                            fontWeight: FontWeight.w500,
                            color: AppTheme.primaryDark,
                          ),
                        ),
                      ),
                      SizedBox(width: 2.w),
                      Text(
                        '${meal['protein']}g protein',
                        style: GoogleFonts.inter(
                          fontSize: 10.sp,
                          color: AppTheme.textSecondaryDark,
                        ),
                      ),
                    ],
                  ),

                  SizedBox(height: 1.h),

                  // Price and Rating
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        meal['price'],
                        style: GoogleFonts.inter(
                          fontSize: 14.sp,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.primaryDark,
                        ),
                      ),
                      Row(
                        children: [
                          Icon(Icons.star, size: 14, color: Colors.amber),
                          SizedBox(width: 1.w),
                          Text(
                            '${meal['rating']}',
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
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}