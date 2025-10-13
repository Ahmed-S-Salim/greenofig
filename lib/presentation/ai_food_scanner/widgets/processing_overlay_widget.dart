import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';
import '../../../theme/app_theme.dart';

class ProcessingOverlayWidget extends StatefulWidget {
  final bool isVisible;
  final int confidencePercentage;
  final List<Map<String, dynamic>> detectedFoods;

  const ProcessingOverlayWidget({
    Key? key,
    required this.isVisible,
    required this.confidencePercentage,
    required this.detectedFoods,
  }) : super(key: key);

  @override
  State<ProcessingOverlayWidget> createState() =>
      _ProcessingOverlayWidgetState();
}

class _ProcessingOverlayWidgetState extends State<ProcessingOverlayWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
    _scaleAnimation = Tween<double>(
      begin: 0.8,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.elasticOut,
    ));
  }

  @override
  void didUpdateWidget(ProcessingOverlayWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isVisible && !oldWidget.isVisible) {
      _animationController.forward();
    } else if (!widget.isVisible && oldWidget.isVisible) {
      _animationController.reverse();
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.isVisible) return SizedBox.shrink();

    return AnimatedBuilder(
      animation: _animationController,
      builder: (context, child) {
        return Opacity(
          opacity: _fadeAnimation.value,
          child: Container(
            width: 100.w,
            height: 100.h,
            color: Colors.black.withValues(alpha: 0.7),
            child: Center(
              child: Transform.scale(
                scale: _scaleAnimation.value,
                child: Container(
                  margin: EdgeInsets.symmetric(horizontal: 8.w),
                  padding: EdgeInsets.all(6.w),
                  decoration: BoxDecoration(
                    color: AppTheme.lightTheme.colorScheme.surface,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.2),
                        blurRadius: 20,
                        offset: Offset(0, 10),
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Processing Animation
                      _buildProcessingAnimation(),

                      SizedBox(height: 3.h),

                      // Confidence Indicator
                      if (widget.confidencePercentage > 0)
                        _buildConfidenceIndicator(),

                      SizedBox(height: 2.h),

                      // Detected Foods
                      if (widget.detectedFoods.isNotEmpty)
                        _buildDetectedFoods(),
                    ],
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildProcessingAnimation() {
    return Column(
      children: [
        Container(
          width: 16.w,
          height: 16.w,
          child: CircularProgressIndicator(
            color: AppTheme.lightTheme.primaryColor,
            strokeWidth: 3,
          ),
        ),
        SizedBox(height: 2.h),
        Text(
          'Analyzing Food...',
          style: AppTheme.lightTheme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        SizedBox(height: 1.h),
        Text(
          'Please wait while our AI identifies your food',
          style: AppTheme.lightTheme.textTheme.bodySmall,
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildConfidenceIndicator() {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Confidence',
              style: AppTheme.lightTheme.textTheme.bodyMedium,
            ),
            Text(
              '${widget.confidencePercentage}%',
              style: AppTheme.lightTheme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w600,
                color: _getConfidenceColor(),
              ),
            ),
          ],
        ),
        SizedBox(height: 1.h),
        LinearProgressIndicator(
          value: widget.confidencePercentage / 100,
          backgroundColor: Colors.grey[300],
          valueColor: AlwaysStoppedAnimation<Color>(_getConfidenceColor()),
        ),
      ],
    );
  }

  Widget _buildDetectedFoods() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Detected Foods:',
          style: AppTheme.lightTheme.textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        SizedBox(height: 1.h),
        ...widget.detectedFoods
            .map((food) => Padding(
                  padding: EdgeInsets.symmetric(vertical: 0.5.h),
                  child: Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: AppTheme.lightTheme.primaryColor,
                          shape: BoxShape.circle,
                        ),
                      ),
                      SizedBox(width: 2.w),
                      Expanded(
                        child: Text(
                          '${food['name']} (${food['portion']})',
                          style: AppTheme.lightTheme.textTheme.bodySmall,
                        ),
                      ),
                    ],
                  ),
                ))
            .toList(),
      ],
    );
  }

  Color _getConfidenceColor() {
    if (widget.confidencePercentage >= 80) {
      return AppTheme.lightTheme.primaryColor;
    } else if (widget.confidencePercentage >= 60) {
      return Colors.orange;
    } else {
      return Colors.red;
    }
  }
}
