import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

class PerformanceMetricsWidget extends StatefulWidget {
  final String domain;
  final VoidCallback onRefresh;

  const PerformanceMetricsWidget({
    Key? key,
    required this.domain,
    required this.onRefresh,
  }) : super(key: key);

  @override
  State<PerformanceMetricsWidget> createState() => _PerformanceMetricsWidgetState();
}

class _PerformanceMetricsWidgetState extends State<PerformanceMetricsWidget> {
  bool _isLoading = false;

  // Mock performance data
  final Map<String, dynamic> _performanceData = {
    'lighthouse_score': 92,
    'page_load_time': 1.2,
    'first_contentful_paint': 0.8,
    'largest_contentful_paint': 1.4,
    'cumulative_layout_shift': 0.05,
    'time_to_interactive': 2.1,
  };

  final List<Map<String, dynamic>> _optimizationRecommendations = [
{ 'title': 'Image Optimization',
'description': 'Compress and convert images to WebP format',
'impact': 'High',
'status': 'completed',
'savings': '1.2s load time',
},
{ 'title': 'JavaScript Minification',
'description': 'Minify and compress JavaScript files',
'impact': 'Medium',
'status': 'completed',
'savings': '0.3s load time',
},
{ 'title': 'Enable Browser Caching',
'description': 'Set proper cache headers for static assets',
'impact': 'High',
'status': 'in_progress',
'savings': '0.8s load time',
},
{ 'title': 'Implement Service Worker',
'description': 'Add offline capability and resource caching',
'impact': 'Medium',
'status': 'pending',
'savings': '0.5s load time',
},
];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Performance Score Overview
        _buildPerformanceOverview(theme),
        
        SizedBox(height: 3.h),
        
        // Core Web Vitals
        _buildCoreWebVitals(theme),
        
        SizedBox(height: 3.h),
        
        // Performance Metrics Chart
        _buildPerformanceChart(theme),
        
        SizedBox(height: 3.h),
        
        // Optimization Recommendations
        _buildOptimizationRecommendations(theme),
        
        SizedBox(height: 3.h),
        
        // Resource Analysis
        _buildResourceAnalysis(theme),
      ],
    );
  }

  Widget _buildPerformanceOverview(ThemeData theme) {
    final score = _performanceData['lighthouse_score'] as int;
    final scoreColor = _getScoreColor(score);

    return Container(
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            scoreColor.withAlpha(26),
            scoreColor.withAlpha(13),
          ],
        ),
        borderRadius: BorderRadius.circular(15),
        border: Border.all(
          color: scoreColor.withAlpha(77),
        ),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 20.w,
                height: 20.w,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: scoreColor,
                    width: 4,
                  ),
                ),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        score.toString(),
                        style: GoogleFonts.inter(
                          fontSize: 28.sp,
                          fontWeight: FontWeight.w800,
                          color: scoreColor,
                        ),
                      ),
                      Text(
                        'Score',
                        style: GoogleFonts.inter(
                          fontSize: 10.sp,
                          fontWeight: FontWeight.w600,
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              
              SizedBox(width: 6.w),
              
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Lighthouse Performance',
                      style: GoogleFonts.inter(
                        fontSize: 18.sp,
                        fontWeight: FontWeight.w700,
                        color: theme.colorScheme.onSurface,
                      ),
                    ),
                    SizedBox(height: 1.h),
                    Text(
                      '${widget.domain} is performing excellently with fast load times and good user experience metrics.',
                      style: GoogleFonts.inter(
                        fontSize: 12.sp,
                        fontWeight: FontWeight.w400,
                        color: theme.colorScheme.onSurfaceVariant,
                        height: 1.4,
                      ),
                    ),
                    SizedBox(height: 2.h),
                    Row(
                      children: [
                        _buildQuickStat('Load Time', '${_performanceData['page_load_time']}s', Colors.blue, theme),
                        SizedBox(width: 4.w),
                        _buildQuickStat('FCP', '${_performanceData['first_contentful_paint']}s', Colors.green, theme),
                      ],
                    ),
                  ],
                ),
              ),
              
              IconButton(
                onPressed: _refreshMetrics,
                icon: _isLoading
                    ? SizedBox(
                        width: 5.w,
                        height: 5.w,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(scoreColor),
                        ),
                      )
                    : Icon(
                        Icons.refresh,
                        color: scoreColor,
                        size: 6.w,
                      ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickStat(String label, String value, Color color, ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          value,
          style: GoogleFonts.inter(
            fontSize: 16.sp,
            fontWeight: FontWeight.w700,
            color: color,
          ),
        ),
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 10.sp,
            fontWeight: FontWeight.w500,
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }

  Widget _buildCoreWebVitals(ThemeData theme) {
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
                iconName: 'speed',
                color: theme.colorScheme.primary,
                size: 6.w,
              ),
              SizedBox(width: 3.w),
              Text(
                'Core Web Vitals',
                style: GoogleFonts.inter(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.w700,
                  color: theme.colorScheme.onSurface,
                ),
              ),
            ],
          ),
          
          SizedBox(height: 3.h),
          
          Row(
            children: [
              Expanded(
                child: _buildWebVitalCard(
                  'LCP',
                  'Largest Contentful Paint',
                  '${_performanceData['largest_contentful_paint']}s',
                  'Good',
                  Colors.green,
                  theme,
                ),
              ),
              SizedBox(width: 3.w),
              Expanded(
                child: _buildWebVitalCard(
                  'CLS',
                  'Cumulative Layout Shift',
                  _performanceData['cumulative_layout_shift'].toString(),
                  'Good',
                  Colors.green,
                  theme,
                ),
              ),
            ],
          ),
          
          SizedBox(height: 2.h),
          
          Row(
            children: [
              Expanded(
                child: _buildWebVitalCard(
                  'FCP',
                  'First Contentful Paint',
                  '${_performanceData['first_contentful_paint']}s',
                  'Good',
                  Colors.green,
                  theme,
                ),
              ),
              SizedBox(width: 3.w),
              Expanded(
                child: _buildWebVitalCard(
                  'TTI',
                  'Time to Interactive',
                  '${_performanceData['time_to_interactive']}s',
                  'Needs Work',
                  Colors.orange,
                  theme,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildWebVitalCard(String abbr, String title, String value, String status, Color color, ThemeData theme) {
    return Container(
      padding: EdgeInsets.all(3.w),
      decoration: BoxDecoration(
        color: color.withAlpha(26),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: color.withAlpha(77),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                abbr,
                style: GoogleFonts.inter(
                  fontSize: 14.sp,
                  fontWeight: FontWeight.w800,
                  color: color,
                ),
              ),
              Container(
                width: 2.w,
                height: 2.w,
                decoration: BoxDecoration(
                  color: color,
                  shape: BoxShape.circle,
                ),
              ),
            ],
          ),
          SizedBox(height: 1.h),
          Text(
            value,
            style: GoogleFonts.inter(
              fontSize: 20.sp,
              fontWeight: FontWeight.w700,
              color: theme.colorScheme.onSurface,
            ),
          ),
          SizedBox(height: 0.5.h),
          Text(
            title,
            style: GoogleFonts.inter(
              fontSize: 10.sp,
              fontWeight: FontWeight.w500,
              color: theme.colorScheme.onSurfaceVariant,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          SizedBox(height: 1.h),
          Text(
            status,
            style: GoogleFonts.inter(
              fontSize: 10.sp,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPerformanceChart(ThemeData theme) {
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
                iconName: 'analytics',
                color: theme.colorScheme.primary,
                size: 6.w,
              ),
              SizedBox(width: 3.w),
              Text(
                'Performance Trends (7 Days)',
                style: GoogleFonts.inter(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.w700,
                  color: theme.colorScheme.onSurface,
                ),
              ),
            ],
          ),
          
          SizedBox(height: 3.h),
          
          // Simplified chart representation
          Container(
            height: 20.h,
            decoration: BoxDecoration(
              color: theme.colorScheme.surfaceContainerHighest.withAlpha(128),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Stack(
              children: [
                // Mock chart lines
                Positioned(
                  bottom: 8.h,
                  left: 5.w,
                  right: 5.w,
                  child: Container(
                    height: 0.3.h,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Colors.green, Colors.blue],
                      ),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                
                // Chart labels
                Positioned(
                  bottom: 2.h,
                  left: 5.w,
                  right: 5.w,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Jan 6', style: GoogleFonts.inter(fontSize: 10.sp)),
                      Text('Jan 8', style: GoogleFonts.inter(fontSize: 10.sp)),
                      Text('Jan 10', style: GoogleFonts.inter(fontSize: 10.sp)),
                      Text('Jan 12', style: GoogleFonts.inter(fontSize: 10.sp)),
                      Text('Today', style: GoogleFonts.inter(fontSize: 10.sp, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
                
                // Performance indicators
                Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          _buildTrendIndicator('Load Time', '↓ 12%', Colors.green, theme),
                          _buildTrendIndicator('Bounce Rate', '↓ 8%', Colors.green, theme),
                          _buildTrendIndicator('Page Views', '↑ 24%', Colors.blue, theme),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTrendIndicator(String metric, String change, Color color, ThemeData theme) {
    return Column(
      children: [
        Text(
          change,
          style: GoogleFonts.inter(
            fontSize: 16.sp,
            fontWeight: FontWeight.w700,
            color: color,
          ),
        ),
        Text(
          metric,
          style: GoogleFonts.inter(
            fontSize: 11.sp,
            fontWeight: FontWeight.w500,
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }

  Widget _buildOptimizationRecommendations(ThemeData theme) {
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
                iconName: 'recommend',
                color: theme.colorScheme.primary,
                size: 6.w,
              ),
              SizedBox(width: 3.w),
              Text(
                'Optimization Recommendations',
                style: GoogleFonts.inter(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.w700,
                  color: theme.colorScheme.onSurface,
                ),
              ),
            ],
          ),
          
          SizedBox(height: 3.h),
          
          ..._optimizationRecommendations.map((rec) => _buildRecommendationItem(rec, theme)).toList(),
        ],
      ),
    );
  }

  Widget _buildRecommendationItem(Map<String, dynamic> recommendation, ThemeData theme) {
    Color statusColor;
    IconData statusIcon;
    
    switch (recommendation['status']) {
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

    return Container(
      margin: EdgeInsets.only(bottom: 2.h),
      padding: EdgeInsets.all(3.w),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest.withAlpha(128),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: theme.colorScheme.outline.withAlpha(51),
        ),
      ),
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
          
          SizedBox(width: 3.w),
          
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        recommendation['title'],
                        style: GoogleFonts.inter(
                          fontSize: 14.sp,
                          fontWeight: FontWeight.w600,
                          color: theme.colorScheme.onSurface,
                        ),
                      ),
                    ),
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 2.w, vertical: 0.5.h),
                      decoration: BoxDecoration(
                        color: _getImpactColor(recommendation['impact']).withAlpha(26),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        recommendation['impact'],
                        style: GoogleFonts.inter(
                          fontSize: 10.sp,
                          fontWeight: FontWeight.w600,
                          color: _getImpactColor(recommendation['impact']),
                        ),
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 0.5.h),
                Text(
                  recommendation['description'],
                  style: GoogleFonts.inter(
                    fontSize: 12.sp,
                    fontWeight: FontWeight.w400,
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
                SizedBox(height: 1.h),
                Text(
                  'Potential savings: ${recommendation['savings']}',
                  style: GoogleFonts.inter(
                    fontSize: 11.sp,
                    fontWeight: FontWeight.w600,
                    color: Colors.green,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildResourceAnalysis(ThemeData theme) {
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
                iconName: 'assessment',
                color: theme.colorScheme.primary,
                size: 6.w,
              ),
              SizedBox(width: 3.w),
              Text(
                'Resource Analysis',
                style: GoogleFonts.inter(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.w700,
                  color: theme.colorScheme.onSurface,
                ),
              ),
            ],
          ),
          
          SizedBox(height: 3.h),
          
          Row(
            children: [
              Expanded(
                child: _buildResourceCard('Images', '2.1 MB', '45%', Colors.blue, theme),
              ),
              SizedBox(width: 3.w),
              Expanded(
                child: _buildResourceCard('JavaScript', '890 KB', '19%', Colors.orange, theme),
              ),
            ],
          ),
          
          SizedBox(height: 2.h),
          
          Row(
            children: [
              Expanded(
                child: _buildResourceCard('CSS', '320 KB', '7%', Colors.green, theme),
              ),
              SizedBox(width: 3.w),
              Expanded(
                child: _buildResourceCard('Fonts', '180 KB', '4%', Colors.purple, theme),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildResourceCard(String type, String size, String percentage, Color color, ThemeData theme) {
    return Container(
      padding: EdgeInsets.all(3.w),
      decoration: BoxDecoration(
        color: color.withAlpha(26),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: color.withAlpha(77),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            type,
            style: GoogleFonts.inter(
              fontSize: 12.sp,
              fontWeight: FontWeight.w600,
              color: theme.colorScheme.onSurface,
            ),
          ),
          SizedBox(height: 1.h),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                size,
                style: GoogleFonts.inter(
                  fontSize: 16.sp,
                  fontWeight: FontWeight.w700,
                  color: color,
                ),
              ),
              Text(
                percentage,
                style: GoogleFonts.inter(
                  fontSize: 12.sp,
                  fontWeight: FontWeight.w600,
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Color _getScoreColor(int score) {
    if (score >= 90) return Colors.green;
    if (score >= 70) return Colors.orange;
    return Colors.red;
  }

  Color _getImpactColor(String impact) {
    switch (impact.toLowerCase()) {
      case 'high':
        return Colors.red;
      case 'medium':
        return Colors.orange;
      default:
        return Colors.blue;
    }
  }

  void _refreshMetrics() async {
    setState(() => _isLoading = true);
    
    await Future.delayed(const Duration(seconds: 2));
    
    if (mounted) {
      setState(() => _isLoading = false);
      widget.onRefresh();
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Performance metrics refreshed for ${widget.domain}'),
          backgroundColor: Colors.green,
        ),
      );
    }
  }
}