import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

class ViewfinderWidget extends StatefulWidget {
  final bool isScanning;

  const ViewfinderWidget({
    Key? key,
    required this.isScanning,
  }) : super(key: key);

  @override
  State<ViewfinderWidget> createState() => _ViewfinderWidgetState();
}

class _ViewfinderWidgetState extends State<ViewfinderWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );
    _pulseAnimation = Tween<double>(
      begin: 1.0,
      end: 1.2,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));

    if (widget.isScanning) {
      _animationController.repeat(reverse: true);
    }
  }

  @override
  void didUpdateWidget(ViewfinderWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isScanning && !oldWidget.isScanning) {
      _animationController.repeat(reverse: true);
    } else if (!widget.isScanning && oldWidget.isScanning) {
      _animationController.stop();
      _animationController.reset();
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: AnimatedBuilder(
        animation: _pulseAnimation,
        builder: (context, child) {
          return Transform.scale(
            scale: _pulseAnimation.value,
            child: Container(
              width: 60.w,
              height: 60.w,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: widget.isScanning
                      ? AppTheme.lightTheme.primaryColor
                      : Colors.white,
                  width: 3,
                ),
              ),
              child: Stack(
                children: [
                  // Corner indicators
                  Positioned(
                    top: 0,
                    left: 0,
                    child: _buildCornerIndicator(0),
                  ),
                  Positioned(
                    top: 0,
                    right: 0,
                    child: _buildCornerIndicator(90),
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: _buildCornerIndicator(180),
                  ),
                  Positioned(
                    bottom: 0,
                    left: 0,
                    child: _buildCornerIndicator(270),
                  ),

                  // Center instruction
                  Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CustomIconWidget(
                          iconName: 'restaurant',
                          color: Colors.white,
                          size: 32,
                        ),
                        SizedBox(height: 1.h),
                        Text(
                          'Position food here',
                          style:
                              AppTheme.lightTheme.textTheme.bodySmall?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w500,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildCornerIndicator(double rotation) {
    return Transform.rotate(
      angle: rotation * 3.14159 / 180,
      child: Container(
        width: 20,
        height: 20,
        decoration: BoxDecoration(
          border: Border(
            top: BorderSide(
              color: widget.isScanning
                  ? AppTheme.lightTheme.primaryColor
                  : Colors.white,
              width: 3,
            ),
            left: BorderSide(
              color: widget.isScanning
                  ? AppTheme.lightTheme.primaryColor
                  : Colors.white,
              width: 3,
            ),
          ),
        ),
      ),
    );
  }
}
