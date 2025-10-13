import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../core/app_export.dart';
import './widgets/category_tabs_widget.dart';
import './widgets/goal_setting_widget.dart';
import './widgets/metrics_card_widget.dart';
import './widgets/progress_chart_widget.dart';
import './widgets/progress_photos_widget.dart';
import './widgets/streak_tracking_widget.dart';
import './widgets/timeframe_selector_widget.dart';

class ProgressTracking extends StatefulWidget {
  const ProgressTracking({Key? key}) : super(key: key);

  @override
  State<ProgressTracking> createState() => _ProgressTrackingState();
}

class _ProgressTrackingState extends State<ProgressTracking>
    with TickerProviderStateMixin {
  int _selectedTimeframe = 0;
  int _selectedCategory = 0;
  late TabController _tabController;

  final List<String> _timeframes = ['Week', 'Month', 'Year'];

  final List<Map<String, dynamic>> _categories = [
    {
      'name': 'Body\nMeasurements',
      'icon': 'monitor_weight',
    },
    {
      'name': 'Nutrition\nGoals',
      'icon': 'restaurant',
    },
    {
      'name': 'Fitness\nPerformance',
      'icon': 'fitness_center',
    },
    {
      'name': 'Sleep\nQuality',
      'icon': 'bedtime',
    },
  ];

  // Mock data for metrics cards
  final List<Map<String, dynamic>> _metricsData = [
    {
      'title': 'Weight',
      'value': '72.5',
      'unit': 'kg',
      'change': '-2.3kg',
      'isPositive': true,
      'color': AppTheme.lightTheme.colorScheme.primary,
      'icon': Icons.monitor_weight,
    },
    {
      'title': 'Body Fat',
      'value': '18.2',
      'unit': '%',
      'change': '-1.5%',
      'isPositive': true,
      'color': Colors.orange,
      'icon': Icons.accessibility_new,
    },
    {
      'title': 'BMI',
      'value': '23.1',
      'unit': '',
      'change': '+0.2',
      'isPositive': false,
      'color': Colors.blue,
      'icon': Icons.calculate,
    },
  ];

  // Mock data for progress photos
  final List<Map<String, dynamic>> _progressPhotos = [
    {
      'imageUrl':
          'https://images.unsplash.com/photo-1676453721317-13a188a04f4b',
      'semanticLabel':
          'Progress photo showing person in athletic wear standing against white background for body measurement tracking',
      'date': 'Oct 1, 2024',
      'notes': 'Starting point - feeling motivated!',
    },
    {
      'imageUrl':
          'https://images.unsplash.com/photo-1618292118403-be6bcb93d0b7',
      'semanticLabel':
          'Progress photo showing person in fitness attire demonstrating improved posture and muscle definition',
      'date': 'Oct 8, 2024',
      'notes': 'Week 1 - already seeing some changes',
    },
    {
      'imageUrl':
          'https://images.unsplash.com/photo-1708011108776-45ad9e625269',
      'semanticLabel':
          'Progress photo showing person in workout clothes with visible fitness improvements and confident stance',
      'date': 'Oct 13, 2024',
      'notes': 'Two weeks in - feeling stronger!',
    },
  ];

  // Mock data for goals
  Map<String, dynamic> _currentGoals = {
    'Weight Loss': {
      'current': 72.5,
      'target': 70.0,
      'unit': 'kg',
      'min': 60.0,
      'max': 90.0,
    },
    'Daily Steps': {
      'current': 8500.0,
      'target': 10000.0,
      'unit': 'steps',
      'min': 5000.0,
      'max': 15000.0,
    },
    'Water Intake': {
      'current': 2.2,
      'target': 3.0,
      'unit': 'L',
      'min': 1.0,
      'max': 5.0,
    },
    'Sleep Hours': {
      'current': 7.5,
      'target': 8.0,
      'unit': 'hrs',
      'min': 6.0,
      'max': 10.0,
    },
  };

  // Mock data for streaks
  final List<Map<String, dynamic>> _streakData = [
    {
      'title': 'Daily Workout',
      'currentStreak': 12,
      'bestStreak': 28,
      'isActive': true,
      'icon': 'fitness_center',
      'color': AppTheme.lightTheme.colorScheme.primary,
    },
    {
      'title': 'Meal Logging',
      'currentStreak': 7,
      'bestStreak': 45,
      'isActive': true,
      'icon': 'restaurant',
      'color': Colors.green,
    },
    {
      'title': 'Water Goal',
      'currentStreak': 0,
      'bestStreak': 15,
      'isActive': false,
      'icon': 'water_drop',
      'color': Colors.blue,
    },
    {
      'title': 'Sleep Schedule',
      'currentStreak': 5,
      'bestStreak': 21,
      'isActive': true,
      'icon': 'bedtime',
      'color': Colors.purple,
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.lightTheme.scaffoldBackgroundColor,
      appBar: _buildAppBar(),
      body: SafeArea(
        child: Column(
          children: [
            TimeframeSelectorWidget(
              timeframes: _timeframes,
              selectedIndex: _selectedTimeframe,
              onTimeframeChanged: (index) {
                setState(() {
                  _selectedTimeframe = index;
                });
              },
            ),
            _buildMetricsCards(),
            CategoryTabsWidget(
              categories: _categories,
              selectedIndex: _selectedCategory,
              onCategoryChanged: (index) {
                setState(() {
                  _selectedCategory = index;
                });
                _tabController.animateTo(index);
              },
            ),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildBodyMeasurementsTab(),
                  _buildNutritionGoalsTab(),
                  _buildFitnessPerformanceTab(),
                  _buildSleepQualityTab(),
                ],
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showQuickLogDialog,
        child: CustomIconWidget(
          iconName: 'add',
          color: AppTheme.lightTheme.colorScheme.onPrimary,
          size: 6.w,
        ),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      title: Text(
        'Progress Tracking',
        style: AppTheme.lightTheme.textTheme.titleLarge?.copyWith(
          fontWeight: FontWeight.w600,
        ),
      ),
      actions: [
        IconButton(
          onPressed: _exportProgress,
          icon: CustomIconWidget(
            iconName: 'file_download',
            color: AppTheme.lightTheme.colorScheme.onSurface,
            size: 6.w,
          ),
        ),
        IconButton(
          onPressed: () => Navigator.pushNamed(context, '/profile-settings'),
          icon: CustomIconWidget(
            iconName: 'settings',
            color: AppTheme.lightTheme.colorScheme.onSurface,
            size: 6.w,
          ),
        ),
      ],
    );
  }

  Widget _buildMetricsCards() {
    return Container(
      height: 18.h,
      margin: EdgeInsets.symmetric(vertical: 1.h),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: EdgeInsets.symmetric(horizontal: 3.w),
        itemCount: _metricsData.length,
        itemBuilder: (context, index) {
          final metric = _metricsData[index];
          return MetricsCardWidget(
            title: metric['title'] as String,
            value: metric['value'] as String,
            unit: metric['unit'] as String,
            change: metric['change'] as String,
            isPositive: metric['isPositive'] as bool,
            cardColor: metric['color'] as Color,
            icon: metric['icon'] as IconData,
          );
        },
      ),
    );
  }

  Widget _buildBodyMeasurementsTab() {
    return SingleChildScrollView(
      child: Column(
        children: [
          ProgressChartWidget(
            title: 'Weight Trend',
            dataPoints: _getWeightDataPoints(),
            lineColor: AppTheme.lightTheme.colorScheme.primary,
            unit: 'kg',
            minY: 70,
            maxY: 76,
          ),
          ProgressChartWidget(
            title: 'Body Fat Percentage',
            dataPoints: _getBodyFatDataPoints(),
            lineColor: Colors.orange,
            unit: '%',
            minY: 18,
            maxY: 22,
          ),
          ProgressPhotosWidget(
            photos: _progressPhotos,
            onAddPhoto: _addProgressPhoto,
          ),
          SizedBox(height: 10.h),
        ],
      ),
    );
  }

  Widget _buildNutritionGoalsTab() {
    return SingleChildScrollView(
      child: Column(
        children: [
          ProgressChartWidget(
            title: 'Daily Calories',
            dataPoints: _getCalorieDataPoints(),
            lineColor: Colors.green,
            unit: 'kcal',
            minY: 1800,
            maxY: 2200,
          ),
          ProgressChartWidget(
            title: 'Water Intake',
            dataPoints: _getWaterDataPoints(),
            lineColor: Colors.blue,
            unit: 'L',
            minY: 1.5,
            maxY: 3.5,
          ),
          GoalSettingWidget(
            currentGoals: _currentGoals,
            onGoalsUpdated: (updatedGoals) {
              setState(() {
                _currentGoals = updatedGoals;
              });
            },
          ),
          SizedBox(height: 10.h),
        ],
      ),
    );
  }

  Widget _buildFitnessPerformanceTab() {
    return SingleChildScrollView(
      child: Column(
        children: [
          ProgressChartWidget(
            title: 'Daily Steps',
            dataPoints: _getStepsDataPoints(),
            lineColor: AppTheme.lightTheme.colorScheme.tertiary,
            unit: '',
            minY: 6000,
            maxY: 12000,
          ),
          ProgressChartWidget(
            title: 'Workout Duration',
            dataPoints: _getWorkoutDataPoints(),
            lineColor: Colors.purple,
            unit: 'min',
            minY: 30,
            maxY: 90,
          ),
          StreakTrackingWidget(streaks: _streakData),
          SizedBox(height: 10.h),
        ],
      ),
    );
  }

  Widget _buildSleepQualityTab() {
    return SingleChildScrollView(
      child: Column(
        children: [
          ProgressChartWidget(
            title: 'Sleep Duration',
            dataPoints: _getSleepDataPoints(),
            lineColor: Colors.indigo,
            unit: 'hrs',
            minY: 6,
            maxY: 9,
          ),
          ProgressChartWidget(
            title: 'Sleep Quality Score',
            dataPoints: _getSleepQualityDataPoints(),
            lineColor: Colors.teal,
            unit: '/10',
            minY: 6,
            maxY: 10,
          ),
          SizedBox(height: 10.h),
        ],
      ),
    );
  }

  // Mock data generation methods
  List<FlSpot> _getWeightDataPoints() {
    return [
      const FlSpot(0, 75.2),
      const FlSpot(1, 74.8),
      const FlSpot(2, 74.5),
      const FlSpot(3, 73.9),
      const FlSpot(4, 73.2),
      const FlSpot(5, 72.8),
      const FlSpot(6, 72.5),
    ];
  }

  List<FlSpot> _getBodyFatDataPoints() {
    return [
      const FlSpot(0, 20.1),
      const FlSpot(1, 19.8),
      const FlSpot(2, 19.5),
      const FlSpot(3, 19.1),
      const FlSpot(4, 18.8),
      const FlSpot(5, 18.4),
      const FlSpot(6, 18.2),
    ];
  }

  List<FlSpot> _getCalorieDataPoints() {
    return [
      const FlSpot(0, 2050),
      const FlSpot(1, 1980),
      const FlSpot(2, 2100),
      const FlSpot(3, 1950),
      const FlSpot(4, 2020),
      const FlSpot(5, 1990),
      const FlSpot(6, 2000),
    ];
  }

  List<FlSpot> _getWaterDataPoints() {
    return [
      const FlSpot(0, 2.1),
      const FlSpot(1, 2.8),
      const FlSpot(2, 2.5),
      const FlSpot(3, 3.2),
      const FlSpot(4, 2.9),
      const FlSpot(5, 2.4),
      const FlSpot(6, 2.2),
    ];
  }

  List<FlSpot> _getStepsDataPoints() {
    return [
      const FlSpot(0, 8200),
      const FlSpot(1, 9500),
      const FlSpot(2, 7800),
      const FlSpot(3, 10200),
      const FlSpot(4, 8900),
      const FlSpot(5, 9100),
      const FlSpot(6, 8500),
    ];
  }

  List<FlSpot> _getWorkoutDataPoints() {
    return [
      const FlSpot(0, 45),
      const FlSpot(1, 60),
      const FlSpot(2, 0),
      const FlSpot(3, 75),
      const FlSpot(4, 50),
      const FlSpot(5, 65),
      const FlSpot(6, 55),
    ];
  }

  List<FlSpot> _getSleepDataPoints() {
    return [
      const FlSpot(0, 7.2),
      const FlSpot(1, 8.1),
      const FlSpot(2, 6.8),
      const FlSpot(3, 7.9),
      const FlSpot(4, 7.5),
      const FlSpot(5, 8.2),
      const FlSpot(6, 7.5),
    ];
  }

  List<FlSpot> _getSleepQualityDataPoints() {
    return [
      const FlSpot(0, 7.5),
      const FlSpot(1, 8.2),
      const FlSpot(2, 6.8),
      const FlSpot(3, 8.5),
      const FlSpot(4, 7.9),
      const FlSpot(5, 8.8),
      const FlSpot(6, 8.1),
    ];
  }

  void _addProgressPhoto() {
    // Mock implementation - in real app would open camera
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('Camera functionality would open here'),
        backgroundColor: AppTheme.lightTheme.colorScheme.primary,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }

  void _showQuickLogDialog() {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        child: Container(
          padding: EdgeInsets.all(4.w),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Quick Log',
                style: AppTheme.lightTheme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              SizedBox(height: 3.h),
              _buildQuickLogOption('Weight', 'monitor_weight', () {
                Navigator.pop(context);
                _showWeightLogDialog();
              }),
              _buildQuickLogOption('Water', 'water_drop', () {
                Navigator.pop(context);
                _logWater();
              }),
              _buildQuickLogOption('Workout', 'fitness_center', () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/workout-programs');
              }),
              _buildQuickLogOption('Progress Photo', 'camera_alt', () {
                Navigator.pop(context);
                _addProgressPhoto();
              }),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildQuickLogOption(
      String title, String iconName, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        margin: EdgeInsets.only(bottom: 2.h),
        padding: EdgeInsets.all(3.w),
        decoration: BoxDecoration(
          color: AppTheme.lightTheme.colorScheme.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color:
                AppTheme.lightTheme.colorScheme.outline.withValues(alpha: 0.2),
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: EdgeInsets.all(2.w),
              decoration: BoxDecoration(
                color: AppTheme.lightTheme.colorScheme.primary
                    .withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: CustomIconWidget(
                iconName: iconName,
                color: AppTheme.lightTheme.colorScheme.primary,
                size: 5.w,
              ),
            ),
            SizedBox(width: 3.w),
            Text(
              title,
              style: AppTheme.lightTheme.textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w500,
              ),
            ),
            const Spacer(),
            CustomIconWidget(
              iconName: 'chevron_right',
              color: AppTheme.lightTheme.colorScheme.onSurfaceVariant,
              size: 5.w,
            ),
          ],
        ),
      ),
    );
  }

  void _showWeightLogDialog() {
    final TextEditingController weightController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        child: Container(
          padding: EdgeInsets.all(4.w),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Log Weight',
                style: AppTheme.lightTheme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              SizedBox(height: 3.h),
              TextField(
                controller: weightController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Weight (kg)',
                  hintText: 'Enter your current weight',
                ),
              ),
              SizedBox(height: 3.h),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Cancel'),
                  ),
                  SizedBox(width: 2.w),
                  ElevatedButton(
                    onPressed: () {
                      if (weightController.text.isNotEmpty) {
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                                'Weight logged: ${weightController.text} kg'),
                            backgroundColor:
                                AppTheme.lightTheme.colorScheme.tertiary,
                          ),
                        );
                      }
                    },
                    child: const Text('Save'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _logWater() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('Water intake logged: +250ml'),
        backgroundColor: AppTheme.lightTheme.colorScheme.tertiary,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }

  void _exportProgress() {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        child: Container(
          padding: EdgeInsets.all(4.w),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Export Progress',
                style: AppTheme.lightTheme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              SizedBox(height: 3.h),
              Text(
                'Choose export format:',
                style: AppTheme.lightTheme.textTheme.bodyMedium,
              ),
              SizedBox(height: 2.h),
              _buildExportOption('PDF Report', 'picture_as_pdf', () {
                Navigator.pop(context);
                _exportToPDF();
              }),
              _buildExportOption('CSV Data', 'table_chart', () {
                Navigator.pop(context);
                _exportToCSV();
              }),
              _buildExportOption('Excel File', 'description', () {
                Navigator.pop(context);
                _exportToExcel();
              }),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildExportOption(String title, String iconName, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        margin: EdgeInsets.only(bottom: 2.h),
        padding: EdgeInsets.all(3.w),
        decoration: BoxDecoration(
          color: AppTheme.lightTheme.colorScheme.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color:
                AppTheme.lightTheme.colorScheme.outline.withValues(alpha: 0.2),
          ),
        ),
        child: Row(
          children: [
            CustomIconWidget(
              iconName: iconName,
              color: AppTheme.lightTheme.colorScheme.primary,
              size: 5.w,
            ),
            SizedBox(width: 3.w),
            Text(
              title,
              style: AppTheme.lightTheme.textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _exportToPDF() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('PDF report exported successfully'),
        backgroundColor: AppTheme.lightTheme.colorScheme.tertiary,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }

  void _exportToCSV() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('CSV data exported successfully'),
        backgroundColor: AppTheme.lightTheme.colorScheme.tertiary,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }

  void _exportToExcel() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('Excel file exported successfully'),
        backgroundColor: AppTheme.lightTheme.colorScheme.tertiary,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }
}
