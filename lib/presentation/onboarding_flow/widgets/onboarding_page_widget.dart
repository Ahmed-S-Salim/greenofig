import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

class OnboardingPageWidget extends StatelessWidget {
  final String title;
  final String description;
  final String imageUrl;
  final String semanticLabel;
  final bool showAnimation;

  const OnboardingPageWidget({
    Key? key,
    required this.title,
    required this.description,
    required this.imageUrl,
    required this.semanticLabel,
    this.showAnimation = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 4.h),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Expanded(
              flex: 3,
              child: Container(
                width: double.infinity,
                constraints: BoxConstraints(
                  maxHeight: 35.h,
                  maxWidth: 85.w,
                ),
                child: AnimatedContainer(
                  duration: showAnimation
                      ? const Duration(milliseconds: 800)
                      : Duration.zero,
                  curve: Curves.easeOutBack,
                  transform: Matrix4.identity()
                    ..scale(showAnimation ? 1.0 : 0.8)
                    ..translate(0.0, showAnimation ? 0.0 : 20.0),
                  child: CustomImageWidget(
                    imageUrl: imageUrl,
                    width: double.infinity,
                    height: double.infinity,
                    fit: BoxFit.contain,
                    semanticLabel: semanticLabel,
                  ),
                ),
              ),
            ),
            SizedBox(height: 4.h),
            Expanded(
              flex: 2,
              child: Column(
                children: [
                  AnimatedOpacity(
                    opacity: showAnimation ? 1.0 : 0.0,
                    duration: const Duration(milliseconds: 600),
                    child: Text(
                      title,
                      style: AppTheme.lightTheme.textTheme.headlineMedium
                          ?.copyWith(
                        color: AppTheme.lightTheme.colorScheme.onSurface,
                        fontWeight: FontWeight.w700,
                      ),
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  SizedBox(height: 2.h),
                  AnimatedOpacity(
                    opacity: showAnimation ? 1.0 : 0.0,
                    duration: const Duration(milliseconds: 800),
                    child: Text(
                      description,
                      style: AppTheme.lightTheme.textTheme.bodyLarge?.copyWith(
                        color: AppTheme.lightTheme.colorScheme.onSurfaceVariant,
                        height: 1.5,
                      ),
                      textAlign: TextAlign.center,
                      maxLines: 4,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
