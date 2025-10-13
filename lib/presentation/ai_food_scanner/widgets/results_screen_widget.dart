import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

class ResultsScreenWidget extends StatefulWidget {
  final List<Map<String, dynamic>> detectedFoods;
  final VoidCallback onSave;
  final VoidCallback onRetake;
  final VoidCallback onManualCorrection;

  const ResultsScreenWidget({
    Key? key,
    required this.detectedFoods,
    required this.onSave,
    required this.onRetake,
    required this.onManualCorrection,
  }) : super(key: key);

  @override
  State<ResultsScreenWidget> createState() => _ResultsScreenWidgetState();
}

class _ResultsScreenWidgetState extends State<ResultsScreenWidget> {
  List<Map<String, dynamic>> _editableFoods = [];

  @override
  void initState() {
    super.initState();
    _editableFoods = List.from(widget.detectedFoods);
  }

  void _updatePortion(int index, double newPortion) {
    setState(() {
      _editableFoods[index]['portion'] = newPortion;
      _editableFoods[index]['calories'] =
          (_editableFoods[index]['baseCalories'] as double) * newPortion;
    });
  }

  void _removeFood(int index) {
    setState(() {
      _editableFoods.removeAt(index);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 100.w,
      height: 100.h,
      color: AppTheme.lightTheme.scaffoldBackgroundColor,
      child: SafeArea(
        child: Column(
          children: [
            // Header
            _buildHeader(),

            // Results List
            Expanded(
              child: _buildResultsList(),
            ),

            // Action Buttons
            _buildActionButtons(),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: AppTheme.lightTheme.colorScheme.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 4,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          IconButton(
            onPressed: widget.onRetake,
            icon: CustomIconWidget(
              iconName: 'arrow_back',
              color: AppTheme.lightTheme.colorScheme.onSurface,
              size: 24,
            ),
          ),
          SizedBox(width: 2.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Scan Results',
                  style: AppTheme.lightTheme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  '${_editableFoods.length} food${_editableFoods.length != 1 ? 's' : ''} detected',
                  style: AppTheme.lightTheme.textTheme.bodySmall,
                ),
              ],
            ),
          ),
          TextButton(
            onPressed: widget.onManualCorrection,
            child: Text('Not quite right?'),
          ),
        ],
      ),
    );
  }

  Widget _buildResultsList() {
    if (_editableFoods.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CustomIconWidget(
              iconName: 'search_off',
              color: Colors.grey[400]!,
              size: 64,
            ),
            SizedBox(height: 2.h),
            Text(
              'No foods detected',
              style: AppTheme.lightTheme.textTheme.titleMedium?.copyWith(
                color: Colors.grey[600],
              ),
            ),
            SizedBox(height: 1.h),
            Text(
              'Try taking another photo or add manually',
              style: AppTheme.lightTheme.textTheme.bodySmall?.copyWith(
                color: Colors.grey[500],
              ),
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      padding: EdgeInsets.all(4.w),
      itemCount: _editableFoods.length,
      separatorBuilder: (context, index) => SizedBox(height: 2.h),
      itemBuilder: (context, index) {
        return _buildFoodCard(index);
      },
    );
  }

  Widget _buildFoodCard(int index) {
    final food = _editableFoods[index];

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: EdgeInsets.all(4.w),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Food Header
            Row(
              children: [
                Container(
                  width: 12.w,
                  height: 12.w,
                  decoration: BoxDecoration(
                    color:
                        AppTheme.lightTheme.primaryColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Center(
                    child: CustomIconWidget(
                      iconName: 'restaurant',
                      color: AppTheme.lightTheme.primaryColor,
                      size: 20,
                    ),
                  ),
                ),
                SizedBox(width: 3.w),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        food['name'] as String,
                        style:
                            AppTheme.lightTheme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        '${(food['calories'] as double).toInt()} calories',
                        style:
                            AppTheme.lightTheme.textTheme.bodySmall?.copyWith(
                          color: AppTheme.lightTheme.primaryColor,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => _removeFood(index),
                  icon: CustomIconWidget(
                    iconName: 'close',
                    color: Colors.grey[400]!,
                    size: 20,
                  ),
                ),
              ],
            ),

            SizedBox(height: 2.h),

            // Portion Slider
            Text(
              'Portion Size: ${(food['portion'] as double).toStringAsFixed(1)}x',
              style: AppTheme.lightTheme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w500,
              ),
            ),

            SizedBox(height: 1.h),

            Slider(
              value: food['portion'] as double,
              min: 0.1,
              max: 3.0,
              divisions: 29,
              onChanged: (value) => _updatePortion(index, value),
              activeColor: AppTheme.lightTheme.primaryColor,
            ),

            // Nutrition Facts
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildNutritionItem(
                    'Protein', '${(food['protein'] as double).toInt()}g'),
                _buildNutritionItem(
                    'Carbs', '${(food['carbs'] as double).toInt()}g'),
                _buildNutritionItem(
                    'Fat', '${(food['fat'] as double).toInt()}g'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNutritionItem(String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: AppTheme.lightTheme.textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.w600,
            color: AppTheme.lightTheme.primaryColor,
          ),
        ),
        Text(
          label,
          style: AppTheme.lightTheme.textTheme.bodySmall,
        ),
      ],
    );
  }

  Widget _buildActionButtons() {
    return Container(
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: AppTheme.lightTheme.colorScheme.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 4,
            offset: Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: OutlinedButton(
              onPressed: widget.onRetake,
              child: Text('Retake Photo'),
            ),
          ),
          SizedBox(width: 4.w),
          Expanded(
            flex: 2,
            child: ElevatedButton(
              onPressed: _editableFoods.isNotEmpty ? widget.onSave : null,
              child: Text('Save to Log'),
            ),
          ),
        ],
      ),
    );
  }
}
