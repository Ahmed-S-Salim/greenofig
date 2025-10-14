import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../core/app_export.dart';
import './widgets/measurement_category_card.dart';

class MeasurementTracking extends StatefulWidget {
  const MeasurementTracking({Key? key}) : super(key: key);

  @override
  State<MeasurementTracking> createState() => _MeasurementTrackingState();
}

class _MeasurementTrackingState extends State<MeasurementTracking>
    with TickerProviderStateMixin {
  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;

  String _selectedTimeframe = '1M';
  bool _isMetricUnits = true;

  final List<String> _timeframes = ['1W', '1M', '3M', '6M', '1Y'];

  final List<Map<String, dynamic>> _measurementCategories = [
    {
      'id': 'weight',
      'name': 'Weight',
      'icon': 'monitor_weight',
      'currentValue': '68.5',
      'unit': 'kg',
      'unitImperial': 'lbs',
      'trend': 'down',
      'trendValue': 2.3,
      'color': Color(0xFF6C63FF),
      'targetValue': '65.0',
    },
    {
      'id': 'body_fat',
      'name': 'Body Fat %',
      'icon': 'body_fat',
      'currentValue': '18.2',
      'unit': '%',
      'unitImperial': '%',
      'trend': 'down',
      'trendValue': 1.8,
      'color': Color(0xFF00D4FF),
      'targetValue': '15.0',
    },
    {
      'id': 'muscle_mass',
      'name': 'Muscle Mass',
      'icon': 'fitness_center',
      'currentValue': '55.4',
      'unit': 'kg',
      'unitImperial': 'lbs',
      'trend': 'up',
      'trendValue': 1.2,
      'color': Color(0xFF4CAF50),
      'targetValue': '58.0',
    },
    {
      'id': 'bmi',
      'name': 'BMI',
      'icon': 'calculate',
      'currentValue': '22.1',
      'unit': '',
      'unitImperial': '',
      'trend': 'stable',
      'trendValue': 0.1,
      'color': Color(0xFFFF9800),
      'targetValue': '21.0',
    },
  ];

  @override
  void initState() {
    super.initState();
    _setupAnimations();
  }

  void _setupAnimations() {
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeOut,
    ));

    _fadeController.forward();
  }

  @override
  void dispose() {
    _fadeController.dispose();
    super.dispose();
  }

  void _showMeasurementInput(Map<String, dynamic> category) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: EdgeInsets.all(4.w),
        decoration: BoxDecoration(
          color: Theme.of(context).scaffoldBackgroundColor,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Add ${category['name']} Measurement',
              style: GoogleFonts.inter(
                fontSize: 18.sp,
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: 2.h),
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                _handleMeasurementSave(category['id'], 70.0, 'Manual entry');
              },
              child: Text('Save Measurement'),
            ),
          ],
        ),
      ),
    );
  }

  void _handleMeasurementSave(String categoryId, double value, String notes) {
    // Mock save functionality
    setState(() {
      final categoryIndex =
          _measurementCategories.indexWhere((cat) => cat['id'] == categoryId);
      if (categoryIndex != -1) {
        _measurementCategories[categoryIndex]['currentValue'] =
            value.toStringAsFixed(1);
        // Update trend calculation (simplified)
        _measurementCategories[categoryIndex]['trendValue'] = 0.5;
        _measurementCategories[categoryIndex]['trend'] = 'up';
      }
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Measurement saved successfully!'),
        backgroundColor: Colors.green,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  void _showCalibrationHelp() {
    final theme = Theme.of(context);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: theme.scaffoldBackgroundColor,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            Icon(Icons.help_outline, color: theme.colorScheme.primary),
            SizedBox(width: 2.w),
            Text(
              'Scale Calibration',
              style: GoogleFonts.inter(
                fontSize: 18.sp,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Tips for accurate measurements:',
              style: GoogleFonts.inter(
                fontSize: 16.sp,
                fontWeight: FontWeight.w600,
                color: theme.colorScheme.onSurface,
              ),
            ),
            SizedBox(height: 2.h),
            _buildTip('Weigh yourself at the same time each day'),
            _buildTip('Use the same scale consistently'),
            _buildTip('Ensure the scale is on a hard, flat surface'),
            _buildTip('Step on the scale barefoot'),
            _buildTip('Avoid weighing after intense workouts'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Got it'),
          ),
        ],
      ),
    );
  }

  Widget _buildTip(String tip) {
    final theme = Theme.of(context);
    return Padding(
      padding: EdgeInsets.only(bottom: 1.h),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 1.5.w,
            height: 1.5.w,
            margin: EdgeInsets.only(top: 0.5.h, right: 3.w),
            decoration: BoxDecoration(
              color: theme.colorScheme.primary,
              shape: BoxShape.circle,
            ),
          ),
          Expanded(
            child: Text(
              tip,
              style: GoogleFonts.inter(
                fontSize: 14.sp,
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimeframeSelector() {
    final theme = Theme.of(context);

    return Container(
      padding: EdgeInsets.all(1.w),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
            color: theme.colorScheme.outline.withAlpha((0.3 * 255).round())),
      ),
      child: Row(
        children: _timeframes.map((timeframe) {
          final isSelected = _selectedTimeframe == timeframe;
          return Expanded(
            child: GestureDetector(
              onTap: () => setState(() => _selectedTimeframe = timeframe),
              child: Container(
                padding: EdgeInsets.symmetric(vertical: 1.h),
                decoration: BoxDecoration(
                  color: isSelected
                      ? theme.colorScheme.primary
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Center(
                  child: Text(
                    timeframe,
                    style: GoogleFonts.inter(
                      fontSize: 14.sp,
                      fontWeight: FontWeight.w500,
                      color: isSelected
                          ? Colors.white
                          : theme.colorScheme.onSurface,
                    ),
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildUnitToggle() {
    final theme = Theme.of(context);

    return Container(
      padding: EdgeInsets.all(0.5.w),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
            color: theme.colorScheme.outline.withAlpha((0.3 * 255).round())),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildUnitOption('Metric', _isMetricUnits,
              () => setState(() => _isMetricUnits = true)),
          _buildUnitOption('Imperial', !_isMetricUnits,
              () => setState(() => _isMetricUnits = false)),
        ],
      ),
    );
  }

  Widget _buildUnitOption(String label, bool isSelected, VoidCallback onTap) {
    final theme = Theme.of(context);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.h),
        decoration: BoxDecoration(
          color: isSelected ? theme.colorScheme.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 12.sp,
            fontWeight: FontWeight.w500,
            color: isSelected ? Colors.white : theme.colorScheme.onSurface,
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          'Measurement Tracking',
          style: GoogleFonts.inter(
            fontSize: 20.sp,
            fontWeight: FontWeight.w600,
            color: theme.colorScheme.onSurface,
          ),
        ),
        actions: [
          IconButton(
            onPressed: _showCalibrationHelp,
            icon: Icon(
              Icons.help_outline,
              color: theme.colorScheme.onSurface,
            ),
          ),
          SizedBox(width: 2.w),
          _buildUnitToggle(),
          SizedBox(width: 4.w),
        ],
      ),
      body: FadeTransition(
        opacity: _fadeAnimation,
        child: SingleChildScrollView(
          padding: EdgeInsets.all(4.w),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Calibration section
              Container(
                padding: EdgeInsets.all(4.w),
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Icon(Icons.settings, color: theme.colorScheme.primary),
                    SizedBox(width: 3.w),
                    Expanded(
                      child: Text(
                        'Scale Calibration',
                        style: GoogleFonts.inter(
                          fontSize: 16.sp,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    TextButton(
                      onPressed: _showCalibrationHelp,
                      child: Text('Calibrate'),
                    ),
                  ],
                ),
              ),

              SizedBox(height: 4.h),

              // Measurement categories
              Text(
                'Body Measurements',
                style: GoogleFonts.inter(
                  fontSize: 20.sp,
                  fontWeight: FontWeight.w700,
                  color: theme.colorScheme.onSurface,
                ),
              ),

              SizedBox(height: 2.h),

              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 4.w,
                  mainAxisSpacing: 4.w,
                  childAspectRatio: 0.85,
                ),
                itemCount: _measurementCategories.length,
                itemBuilder: (context, index) {
                  final category = _measurementCategories[index];
                  return MeasurementCategoryCard(
                    category: category,
                    isMetricUnits: _isMetricUnits,
                    onTap: () => _showMeasurementInput(category),
                  );
                },
              ),

              SizedBox(height: 4.h),

              // Progress charts section
              Text(
                'Progress Charts',
                style: GoogleFonts.inter(
                  fontSize: 20.sp,
                  fontWeight: FontWeight.w700,
                  color: theme.colorScheme.onSurface,
                ),
              ),

              SizedBox(height: 2.h),

              // Timeframe selector
              _buildTimeframeSelector(),

              SizedBox(height: 3.h),

              // Chart
              Container(
                height: 25.h,
                padding: EdgeInsets.all(4.w),
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    Text(
                      'Progress Chart',
                      style: GoogleFonts.inter(
                        fontSize: 16.sp,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    SizedBox(height: 2.h),
                    Expanded(
                      child: Center(
                        child: Text(
                          'Chart visualization coming soon',
                          style: GoogleFonts.inter(
                            fontSize: 14.sp,
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              SizedBox(height: 4.h),

              // Photo comparison
              Container(
                padding: EdgeInsets.all(4.w),
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        Icon(Icons.photo_camera, color: theme.colorScheme.primary),
                        SizedBox(width: 3.w),
                        Expanded(
                          child: Text(
                            'Photo Comparison',
                            style: GoogleFonts.inter(
                              fontSize: 16.sp,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        IconButton(
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('Photo comparison feature coming soon!'),
                                backgroundColor: theme.colorScheme.primary,
                                behavior: SnackBarBehavior.floating,
                              ),
                            );
                          },
                          icon: Icon(Icons.add),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              SizedBox(height: 6.h),
            ],
          ),
        ),
      ),
    );
  }
}