import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

class CaptureButtonWidget extends StatefulWidget {
  final VoidCallback onCapture;
  final bool isProcessing;

  const CaptureButtonWidget({
    Key? key,
    required this.onCapture,
    required this.isProcessing,
  }) : super(key: key);

  @override
  State<CaptureButtonWidget> createState() => _CaptureButtonWidgetState();
}

class _CaptureButtonWidgetState extends State<CaptureButtonWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 150),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 0.9,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _handleTapDown(TapDownDetails details) {
    _animationController.forward();
    HapticFeedback.lightImpact();
  }

  void _handleTapUp(TapUpDetails details) {
    _animationController.reverse();
  }

  void _handleTapCancel() {
    _animationController.reverse();
  }

  void _handleTap() {
    if (!widget.isProcessing) {
      HapticFeedback.mediumImpact();
      widget.onCapture();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Positioned(
      bottom: 8.h,
      left: 0,
      right: 0,
      child: Center(
        child: GestureDetector(
          onTapDown: _handleTapDown,
          onTapUp: _handleTapUp,
          onTapCancel: _handleTapCancel,
          onTap: _handleTap,
          child: AnimatedBuilder(
            animation: _scaleAnimation,
            builder: (context, child) {
              return Transform.scale(
                scale: _scaleAnimation.value,
                child: Container(
                  width: 20.w,
                  height: 20.w,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: widget.isProcessing
                        ? Colors.grey[400]
                        : AppTheme.lightTheme.primaryColor,
                    border: Border.all(
                      color: Colors.white,
                      width: 4,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.3),
                        blurRadius: 10,
                        offset: Offset(0, 4),
                      ),
                    ],
                  ),
                  child: widget.isProcessing
                      ? Center(
                          child: SizedBox(
                            width: 8.w,
                            height: 8.w,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2,
                            ),
                          ),
                        )
                      : Center(
                          child: CustomIconWidget(
                            iconName: 'camera_alt',
                            color: Colors.white,
                            size: 32,
                          ),
                        ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
