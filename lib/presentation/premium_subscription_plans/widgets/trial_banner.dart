import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../../models/user_subscription.dart';

class TrialBanner extends StatelessWidget {
  final UserSubscription subscription;

  const TrialBanner({
    super.key,
    required this.subscription,
  });

  @override
  Widget build(BuildContext context) {
    final daysRemaining = subscription.trialDaysRemaining;
    final isLastDay = daysRemaining <= 1;

    return Container(
      margin: EdgeInsets.all(16.h),
      padding: EdgeInsets.all(16.h),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: isLastDay
              ? [Colors.orange, Colors.red]
              : [Colors.blue, Colors.blue.shade600],
        ),
        borderRadius: BorderRadius.circular(16.h),
        boxShadow: [
          BoxShadow(
            color: (isLastDay ? Colors.orange : Colors.blue)
                .withValues(alpha: 0.3),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                padding: EdgeInsets.all(8.h),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(12.h),
                ),
                child: Icon(
                  isLastDay ? Icons.schedule : Icons.star_rounded,
                  color: Colors.white,
                  size: 24.0,
                ),
              ),
              SizedBox(width: 12.h),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isLastDay ? 'Trial Ending Soon!' : 'Free Trial Active',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    SizedBox(height: 2.0),
                    Text(
                      _getTrialMessage(daysRemaining),
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.white.withValues(alpha: 0.9),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          SizedBox(height: 16.0),

          // Progress bar
          Container(
            height: 6.0,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(3.h),
            ),
            child: LayoutBuilder(
              builder: (context, constraints) {
                // Assuming trial is 30 days
                const totalTrialDays = 30;
                final progress =
                    (totalTrialDays - daysRemaining) / totalTrialDays;

                return Stack(
                  children: [
                    Container(
                      width: constraints.maxWidth * progress.clamp(0.0, 1.0),
                      height: 6.0,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(3.h),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.white.withValues(alpha: 0.5),
                            blurRadius: 8,
                          ),
                        ],
                      ),
                    ),
                  ],
                );
              },
            ),
          ),

          SizedBox(height: 16.0),

          // Action button
          SizedBox(
            width: double.infinity,
            height: 44.0,
            child: ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor:
                    isLastDay ? Colors.orange.shade700 : Colors.blue,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12.h),
                ),
                elevation: 0,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    isLastDay ? 'Choose Your Plan' : 'Upgrade to Premium',
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  SizedBox(width: 8.h),
                  Icon(
                    Icons.arrow_forward_rounded,
                    size: 18.0,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _getTrialMessage(int daysRemaining) {
    if (daysRemaining <= 0) {
      return 'Your trial has expired';
    } else if (daysRemaining == 1) {
      return 'Last day of your free trial';
    } else if (daysRemaining <= 3) {
      return '$daysRemaining days left in your free trial';
    } else if (daysRemaining <= 7) {
      return '$daysRemaining days remaining in your trial';
    } else {
      return 'You have $daysRemaining days left to explore all features';
    }
  }
}