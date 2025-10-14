import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../core/app_export.dart';
import '../domain_publishing_preparation/widgets/app_store_optimization_widget.dart';
import '../domain_publishing_preparation/widgets/domain_configuration_widget.dart';
import '../domain_publishing_preparation/widgets/performance_metrics_widget.dart';
import '../domain_publishing_preparation/widgets/security_configuration_widget.dart';

class DomainPublishingPreparation extends StatefulWidget {
  const DomainPublishingPreparation({Key? key}) : super(key: key);

  @override
  State<DomainPublishingPreparation> createState() =>
      _DomainPublishingPreparationState();
}

class _DomainPublishingPreparationState
    extends State<DomainPublishingPreparation>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  int _currentTabIndex = 0;

  // Overall deployment readiness score (calculated from all sections)
  double _overallScore = 0.0;

  // Individual section completion scores
  Map<String, double> _sectionScores = {
    'domain': 0.85, // Domain setup at greenofig.com
    'security': 0.92, // Security configuration
    'performance': 0.78, // Performance optimization
    'app_store': 0.88, // App store preparation
    'deployment': 0.75, // Deployment readiness
  };

  final List<Map<String, dynamic>> _deploymentTabs = [
    {
      'title': 'Overview',
      'icon': 'dashboard',
      'description': 'Deployment status overview',
    },
    {
      'title': 'Domain Setup',
      'icon': 'public',
      'description': 'greenofig.com configuration',
    },
    {
      'title': 'Security',
      'icon': 'security',
      'description': 'SSL & security settings',
    },
    {
      'title': 'Performance',
      'icon': 'speed',
      'description': 'Optimization metrics',
    },
    {
      'title': 'App Stores',
      'icon': 'store',
      'description': 'iOS & Android preparation',
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _deploymentTabs.length, vsync: this);
    _tabController.addListener(() {
      if (mounted) {
        setState(() {
          _currentTabIndex = _tabController.index;
        });
      }
    });
    _calculateOverallScore();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _calculateOverallScore() {
    double total = 0;
    _sectionScores.forEach((key, value) {
      total += value;
    });
    _overallScore = total / _sectionScores.length;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Deployment Preparation',
              style: GoogleFonts.inter(
                fontSize: 18.sp,
                fontWeight: FontWeight.w700,
                color: theme.colorScheme.onSurface,
              ),
            ),
            Text(
              'greenofig.com readiness',
              style: GoogleFonts.inter(
                fontSize: 12.sp,
                fontWeight: FontWeight.w400,
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
        actions: [
          // Overall Score Indicator
          Container(
            margin: EdgeInsets.only(right: 4.w),
            padding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 1.h),
            decoration: BoxDecoration(
              color: _getScoreColor(_overallScore).withAlpha(26),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: _getScoreColor(_overallScore).withAlpha(77),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  _getScoreIcon(_overallScore),
                  size: 4.w,
                  color: _getScoreColor(_overallScore),
                ),
                SizedBox(width: 2.w),
                Text(
                  '${(_overallScore * 100).toInt()}%',
                  style: GoogleFonts.inter(
                    fontSize: 12.sp,
                    fontWeight: FontWeight.w700,
                    color: _getScoreColor(_overallScore),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Progress Header
          _buildProgressHeader(theme),

          // Tab Navigation
          _buildTabNavigation(theme),

          // Tab Content
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildOverviewTab(theme),
                _buildDomainTab(theme),
                _buildSecurityTab(theme),
                _buildPerformanceTab(theme),
                _buildAppStoreTab(theme),
              ],
            ),
          ),

          // Bottom Action Bar
          _buildBottomActionBar(theme),
        ],
      ),
    );
  }

  Widget _buildProgressHeader(ThemeData theme) {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            theme.colorScheme.primary.withAlpha(26),
            theme.colorScheme.primaryContainer.withAlpha(51),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: theme.colorScheme.primary.withAlpha(77),
        ),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                padding: EdgeInsets.all(3.w),
                decoration: BoxDecoration(
                  color: theme.colorScheme.primary.withAlpha(26),
                  borderRadius: BorderRadius.circular(15),
                ),
                child: CustomIconWidget(
                  iconName: 'public',
                  color: theme.colorScheme.primary,
                  size: 8.w,
                ),
              ),
              SizedBox(width: 4.w),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Greenofig App Deployment',
                      style: GoogleFonts.inter(
                        fontSize: 18.sp,
                        fontWeight: FontWeight.w700,
                        color: theme.colorScheme.onSurface,
                      ),
                    ),
                    SizedBox(height: 0.5.h),
                    Text(
                      'Production-ready health & fitness platform',
                      style: GoogleFonts.inter(
                        fontSize: 12.sp,
                        fontWeight: FontWeight.w400,
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                    SizedBox(height: 1.h),
                    Container(
                      padding: EdgeInsets.symmetric(
                          horizontal: 2.w, vertical: 0.5.h),
                      decoration: BoxDecoration(
                        color: Colors.green.withAlpha(26),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        'Live at greenofig.com',
                        style: GoogleFonts.inter(
                          fontSize: 11.sp,
                          fontWeight: FontWeight.w600,
                          color: Colors.green,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          SizedBox(height: 3.h),

          // Overall Progress Bar
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Deployment Readiness',
                    style: GoogleFonts.inter(
                      fontSize: 14.sp,
                      fontWeight: FontWeight.w600,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                  Text(
                    '${(_overallScore * 100).toInt()}% Complete',
                    style: GoogleFonts.inter(
                      fontSize: 14.sp,
                      fontWeight: FontWeight.w700,
                      color: _getScoreColor(_overallScore),
                    ),
                  ),
                ],
              ),
              SizedBox(height: 1.h),
              Container(
                height: 1.h,
                decoration: BoxDecoration(
                  color: theme.colorScheme.surfaceContainerHighest,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: FractionallySizedBox(
                  alignment: Alignment.centerLeft,
                  widthFactor: _overallScore,
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          _getScoreColor(_overallScore),
                          _getScoreColor(_overallScore).withAlpha(179),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTabNavigation(ThemeData theme) {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 4.w),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest.withAlpha(128),
        borderRadius: BorderRadius.circular(15),
      ),
      child: TabBar(
        controller: _tabController,
        isScrollable: true,
        tabAlignment: TabAlignment.start,
        indicator: BoxDecoration(
          color: theme.colorScheme.primary,
          borderRadius: BorderRadius.circular(12),
        ),
        labelColor: theme.colorScheme.onPrimary,
        unselectedLabelColor: theme.colorScheme.onSurfaceVariant,
        labelStyle: GoogleFonts.inter(
          fontSize: 11.sp,
          fontWeight: FontWeight.w600,
        ),
        tabs: _deploymentTabs
            .map((tab) => Tab(
                  child: Container(
                    padding:
                        EdgeInsets.symmetric(horizontal: 2.w, vertical: 1.h),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        CustomIconWidget(
                          iconName: tab['icon'],
                          size: 4.w,
                          color:
                              _currentTabIndex == _deploymentTabs.indexOf(tab)
                                  ? theme.colorScheme.onPrimary
                                  : theme.colorScheme.onSurfaceVariant,
                        ),
                        SizedBox(width: 2.w),
                        Text(tab['title']),
                      ],
                    ),
                  ),
                ))
            .toList(),
      ),
    );
  }

  Widget _buildOverviewTab(ThemeData theme) {
    return SingleChildScrollView(
      padding: EdgeInsets.all(4.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section Scores Grid
          Text(
            'Deployment Status Overview',
            style: GoogleFonts.inter(
              fontSize: 20.sp,
              fontWeight: FontWeight.w700,
              color: theme.colorScheme.onSurface,
            ),
          ),

          SizedBox(height: 3.h),

          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 3.w,
              mainAxisSpacing: 3.w,
              childAspectRatio: 1.2,
            ),
            itemCount: _sectionScores.length,
            itemBuilder: (context, index) {
              final entry = _sectionScores.entries.elementAt(index);
              return _buildScoreCard(entry.key, entry.value, theme);
            },
          ),

          SizedBox(height: 4.h),

          // Deployment Timeline
          _buildDeploymentTimeline(theme),

          SizedBox(height: 4.h),

          // Technical Specifications
          _buildTechnicalSpecs(theme),
        ],
      ),
    );
  }

  Widget _buildScoreCard(String sectionKey, double score, ThemeData theme) {
    final Map<String, Map<String, dynamic>> sectionInfo = {
      'domain': {
        'title': 'Domain Setup',
        'icon': 'public',
        'description': 'greenofig.com'
      },
      'security': {
        'title': 'Security',
        'icon': 'security',
        'description': 'SSL & Certificates'
      },
      'performance': {
        'title': 'Performance',
        'icon': 'speed',
        'description': 'Load & Response'
      },
      'app_store': {
        'title': 'App Stores',
        'icon': 'store',
        'description': 'iOS & Android'
      },
      'deployment': {
        'title': 'Deployment',
        'icon': 'cloud_upload',
        'description': 'Build & Release'
      },
    };

    final info = sectionInfo[sectionKey]!;
    final scoreColor = _getScoreColor(score);

    return Container(
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(15),
        border: Border.all(
          color: theme.colorScheme.outline.withAlpha(77),
        ),
        boxShadow: [
          BoxShadow(
            color: theme.shadowColor.withAlpha(25),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: EdgeInsets.all(2.w),
                decoration: BoxDecoration(
                  color: scoreColor.withAlpha(26),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: CustomIconWidget(
                  iconName: info['icon'],
                  color: scoreColor,
                  size: 6.w,
                ),
              ),
              SizedBox(width: 3.w),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      info['title'],
                      style: GoogleFonts.inter(
                        fontSize: 14.sp,
                        fontWeight: FontWeight.w700,
                        color: theme.colorScheme.onSurface,
                      ),
                    ),
                    Text(
                      info['description'],
                      style: GoogleFonts.inter(
                        fontSize: 11.sp,
                        fontWeight: FontWeight.w400,
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          SizedBox(height: 2.h),

          // Progress indicator
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${(score * 100).toInt()}%',
                style: GoogleFonts.inter(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.w800,
                  color: scoreColor,
                ),
              ),
              Icon(
                _getScoreIcon(score),
                color: scoreColor,
                size: 5.w,
              ),
            ],
          ),

          SizedBox(height: 1.h),

          LinearProgressIndicator(
            value: score,
            backgroundColor: theme.colorScheme.surfaceContainerHighest,
            valueColor: AlwaysStoppedAnimation<Color>(scoreColor),
            borderRadius: BorderRadius.circular(5),
          ),
        ],
      ),
    );
  }

  Widget _buildDeploymentTimeline(ThemeData theme) {
    final List<Map<String, dynamic>> timelineSteps = [
      {
        'title': 'Development Complete',
        'status': 'completed',
        'date': '2025-01-13',
        'description': 'All features implemented and tested'
      },
      {
        'title': 'Domain Configuration',
        'status': 'completed',
        'date': '2025-01-13',
        'description': 'greenofig.com setup and DNS configured'
      },
      {
        'title': 'Security Implementation',
        'status': 'in_progress',
        'date': '2025-01-14',
        'description': 'SSL certificates and security policies'
      },
      {
        'title': 'Performance Optimization',
        'status': 'pending',
        'date': '2025-01-15',
        'description': 'CDN setup and caching optimization'
      },
      {
        'title': 'App Store Submission',
        'status': 'pending',
        'date': '2025-01-16',
        'description': 'iOS App Store and Google Play deployment'
      },
    ];

    return Container(
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(15),
        border: Border.all(
          color: theme.colorScheme.outline.withAlpha(77),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Deployment Timeline',
            style: GoogleFonts.inter(
              fontSize: 18.sp,
              fontWeight: FontWeight.w700,
              color: theme.colorScheme.onSurface,
            ),
          ),
          SizedBox(height: 3.h),
          ...timelineSteps
              .map((step) => _buildTimelineItem(step, theme))
              .toList(),
        ],
      ),
    );
  }

  Widget _buildTimelineItem(Map<String, dynamic> step, ThemeData theme) {
    Color statusColor;
    IconData statusIcon;

    switch (step['status']) {
      case 'completed':
        statusColor = Colors.green;
        statusIcon = Icons.check_circle;
        break;
      case 'in_progress':
        statusColor = Colors.orange;
        statusIcon = Icons.schedule;
        break;
      default:
        statusColor = theme.colorScheme.outline;
        statusIcon = Icons.radio_button_unchecked;
    }

    return Padding(
      padding: EdgeInsets.only(bottom: 3.h),
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.all(2.w),
            decoration: BoxDecoration(
              color: statusColor.withAlpha(26),
              shape: BoxShape.circle,
            ),
            child: Icon(
              statusIcon,
              color: statusColor,
              size: 5.w,
            ),
          ),
          SizedBox(width: 4.w),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      step['title'],
                      style: GoogleFonts.inter(
                        fontSize: 14.sp,
                        fontWeight: FontWeight.w600,
                        color: theme.colorScheme.onSurface,
                      ),
                    ),
                    Text(
                      step['date'],
                      style: GoogleFonts.inter(
                        fontSize: 11.sp,
                        fontWeight: FontWeight.w500,
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 0.5.h),
                Text(
                  step['description'],
                  style: GoogleFonts.inter(
                    fontSize: 12.sp,
                    fontWeight: FontWeight.w400,
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTechnicalSpecs(ThemeData theme) {
    return Container(
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(15),
        border: Border.all(
          color: theme.colorScheme.outline.withAlpha(77),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CustomIconWidget(
                iconName: 'code',
                color: theme.colorScheme.primary,
                size: 6.w,
              ),
              SizedBox(width: 3.w),
              Text(
                'Technical Specifications',
                style: GoogleFonts.inter(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.w700,
                  color: theme.colorScheme.onSurface,
                ),
              ),
            ],
          ),
          SizedBox(height: 3.h),
          ...[
            {'label': 'Platform', 'value': 'Flutter 3.16.0'},
            {'label': 'Domain', 'value': 'greenofig.com'},
            {'label': 'Hosting', 'value': 'Hostinger Web Hosting'},
            {'label': 'Database', 'value': 'Supabase PostgreSQL'},
            {'label': 'Authentication', 'value': 'Supabase Auth'},
            {'label': 'Payments', 'value': 'Stripe Integration'},
            {'label': 'SSL Certificate', 'value': 'Automatic HTTPS'},
            {'label': 'CDN', 'value': 'Global Content Delivery'},
          ]
              .map((spec) => Padding(
                    padding: EdgeInsets.only(bottom: 2.h),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          spec['label']!,
                          style: GoogleFonts.inter(
                            fontSize: 13.sp,
                            fontWeight: FontWeight.w500,
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                        Text(
                          spec['value']!,
                          style: GoogleFonts.inter(
                            fontSize: 13.sp,
                            fontWeight: FontWeight.w600,
                            color: theme.colorScheme.onSurface,
                          ),
                        ),
                      ],
                    ),
                  ))
              .toList(),
        ],
      ),
    );
  }

  Widget _buildDomainTab(ThemeData theme) {
    return SingleChildScrollView(
      padding: EdgeInsets.all(4.w),
      child: DomainConfigurationWidget(
        domain: 'greenofig.com',
        hostingProvider: 'Hostinger',
        isConfigured: true,
        onRefresh: () => _refreshConfiguration(),
      ),
    );
  }

  Widget _buildSecurityTab(ThemeData theme) {
    return SingleChildScrollView(
      padding: EdgeInsets.all(4.w),
      child: SecurityConfigurationWidget(
        domain: 'greenofig.com',
        onRefresh: () => _refreshConfiguration(),
      ),
    );
  }

  Widget _buildPerformanceTab(ThemeData theme) {
    return SingleChildScrollView(
      padding: EdgeInsets.all(4.w),
      child: PerformanceMetricsWidget(
        domain: 'greenofig.com',
        onRefresh: () => _refreshConfiguration(),
      ),
    );
  }

  Widget _buildAppStoreTab(ThemeData theme) {
    return SingleChildScrollView(
      padding: EdgeInsets.all(4.w),
      child: AppStoreOptimizationWidget(
        appName: 'Greenofig Health & Fitness',
        onRefresh: () => _refreshConfiguration(),
      ),
    );
  }

  Widget _buildBottomActionBar(ThemeData theme) {
    return Container(
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        boxShadow: [
          BoxShadow(
            color: theme.shadowColor.withAlpha(25),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: OutlinedButton(
              onPressed: () => _exportDeploymentReport(),
              style: OutlinedButton.styleFrom(
                padding: EdgeInsets.symmetric(vertical: 2.h),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(25),
                ),
                side: BorderSide(color: theme.colorScheme.primary),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.file_download, size: 5.w),
                  SizedBox(width: 2.w),
                  Text(
                    'Export Report',
                    style: GoogleFonts.inter(
                      fontSize: 14.sp,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),
          SizedBox(width: 3.w),
          Expanded(
            flex: 2,
            child: ElevatedButton(
              onPressed: _overallScore > 0.8 ? () => _initiateDeploy() : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: theme.colorScheme.primary,
                padding: EdgeInsets.symmetric(vertical: 2.h),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(25),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.rocket_launch, size: 5.w),
                  SizedBox(width: 2.w),
                  Text(
                    _overallScore > 0.8
                        ? 'Deploy to Production'
                        : 'Not Ready for Deploy',
                    style: GoogleFonts.inter(
                      fontSize: 14.sp,
                      fontWeight: FontWeight.w700,
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

  Color _getScoreColor(double score) {
    if (score >= 0.9) return Colors.green;
    if (score >= 0.7) return Colors.orange;
    return Colors.red;
  }

  IconData _getScoreIcon(double score) {
    if (score >= 0.9) return Icons.check_circle;
    if (score >= 0.7) return Icons.warning;
    return Icons.error;
  }

  void _refreshConfiguration() {
    // Simulate configuration refresh
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted) {
        setState(() {
          // Update scores based on refresh
          _sectionScores['domain'] = 0.95;
          _sectionScores['security'] = 0.88;
          _calculateOverallScore();
        });
      }
    });
  }

  void _exportDeploymentReport() {
    // Generate deployment report data
    final reportData = StringBuffer();
    reportData.writeln('GREENOFIG DEPLOYMENT REPORT');
    reportData.writeln('Generated: ${DateTime.now().toString()}');
    reportData.writeln('Domain: greenofig.com');
    reportData.writeln('Overall Readiness: ${(_overallScore * 100).toInt()}%');
    reportData.writeln('\n--- SECTION SCORES ---');
    _sectionScores.forEach((key, value) {
      reportData.writeln('$key: ${(value * 100).toInt()}%');
    });
    reportData.writeln('\n--- TECHNICAL SPECIFICATIONS ---');
    reportData.writeln('Platform: Flutter 3.16.0');
    reportData.writeln('Hosting: Hostinger Web Hosting');
    reportData.writeln('Database: Supabase PostgreSQL');
    reportData.writeln('Authentication: Supabase Auth');
    reportData.writeln('Payments: Stripe Integration');
    reportData.writeln('SSL Certificate: Automatic HTTPS');

    // Show export dialog with report preview
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Deployment Report'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Report generated successfully!',
                style: GoogleFonts.inter(fontWeight: FontWeight.w600),
              ),
              SizedBox(height: 2.h),
              Container(
                padding: EdgeInsets.all(3.w),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surfaceContainerHighest,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  reportData.toString(),
                  style: GoogleFonts.robotoMono(fontSize: 10.sp),
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Close'),
          ),
        ],
      ),
    );

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Deployment report generated successfully'),
        backgroundColor: Colors.green,
      ),
    );
  }

  void _initiateDeploy() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Deploy to Production'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Ready to deploy Greenofig Health & Fitness to production?'),
            SizedBox(height: 2.h),
            Text('Domain: greenofig.com',
                style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
            Text('Readiness: ${(_overallScore * 100).toInt()}%',
                style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _executeDeployment();
            },
            child: Text('Deploy Now'),
          ),
        ],
      ),
    );
  }

  void _executeDeployment() {
    // Simulate deployment process with progress dialog
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => PopScope(
        canPop: false,
        child: AlertDialog(
          title: Row(
            children: [
              SizedBox(
                width: 5.w,
                height: 5.w,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
              SizedBox(width: 3.w),
              Text('Deploying...'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Deploying Greenofig to production environment...'),
              SizedBox(height: 2.h),
              Text('Domain: greenofig.com',
                  style: GoogleFonts.inter(fontSize: 12.sp)),
              Text('Build: Release',
                  style: GoogleFonts.inter(fontSize: 12.sp)),
              Text('Platform: Web',
                  style: GoogleFonts.inter(fontSize: 12.sp)),
            ],
          ),
        ),
      ),
    );

    // Simulate deployment steps
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        Navigator.pop(context); // Close progress dialog

        // Show success message
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: Row(
              children: [
                Icon(Icons.check_circle, color: Colors.green, size: 8.w),
                SizedBox(width: 2.w),
                Text('Deployment Successful!'),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Greenofig has been successfully deployed to production!',
                  style: GoogleFonts.inter(fontWeight: FontWeight.w500),
                ),
                SizedBox(height: 2.h),
                Text('Live URL: https://greenofig.com',
                    style: GoogleFonts.inter(
                      fontSize: 12.sp,
                      color: Theme.of(context).colorScheme.primary,
                      fontWeight: FontWeight.w600,
                    )),
                SizedBox(height: 1.h),
                Text('Status: Active',
                    style: GoogleFonts.inter(fontSize: 12.sp)),
                Text('Build Time: ${DateTime.now().toString().split('.')[0]}',
                    style: GoogleFonts.inter(fontSize: 12.sp)),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: Text('Close'),
              ),
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Visit https://greenofig.com to view your live app'),
                      backgroundColor: Colors.green,
                      duration: Duration(seconds: 5),
                    ),
                  );
                },
                child: Text('View Live Site'),
              ),
            ],
          ),
        );
      }
    });
  }
}