import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';


class BillingToggle extends StatefulWidget {
  final String selectedInterval;
  final ValueChanged<String> onIntervalChanged;

  const BillingToggle({
    super.key,
    required this.selectedInterval,
    required this.onIntervalChanged,
  });

  @override
  State<BillingToggle> createState() => _BillingToggleState();
}

class _BillingToggleState extends State<BillingToggle>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 250),
      vsync: this,
    );
    _slideAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));

    if (widget.selectedInterval == 'yearly') {
      _animationController.value = 1.0;
    }
  }

  @override
  void didUpdateWidget(BillingToggle oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.selectedInterval != widget.selectedInterval) {
      if (widget.selectedInterval == 'yearly') {
        _animationController.forward();
      } else {
        _animationController.reverse();
      }
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 20.h),
      child: Column(
        children: [
          // Billing period toggle
          Container(
            padding: EdgeInsets.all(4.h),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(12.h),
            ),
            child: Stack(
              children: [
                // Animated background indicator
                AnimatedBuilder(
                  animation: _slideAnimation,
                  builder: (context, child) {
                    return Positioned.fill(
                      child: Align(
                        alignment: Alignment(
                          -1.0 + (2.0 * _slideAnimation.value),
                          0.0,
                        ),
                        child: FractionallySizedBox(
                          widthFactor: 0.5,
                          child: Container(
                            decoration: BoxDecoration(
                              color: Theme.of(context).colorScheme.primary,
                              borderRadius: BorderRadius.circular(8.h),
                              boxShadow: [
                                BoxShadow(
                                  color: Theme.of(context).colorScheme.primary.withAlpha(77),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),

                // Toggle buttons
                Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => _handleIntervalChange('monthly'),
                        child: Container(
                          padding: EdgeInsets.symmetric(vertical: 12.0),
                          child: Text(
                            'Monthly',
                            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                              color: widget.selectedInterval == 'monthly'
                                  ? Colors.white
                                  : Colors.grey[600],
                              fontWeight: FontWeight.w600,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => _handleIntervalChange('yearly'),
                        child: Container(
                          padding: EdgeInsets.symmetric(vertical: 12.0),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                'Yearly',
                                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                  color: widget.selectedInterval == 'yearly'
                                      ? Colors.white
                                      : Colors.grey[600],
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              SizedBox(width: 4.h),
                              Container(
                                padding: EdgeInsets.symmetric(
                                  horizontal: 6.h,
                                  vertical: 2.0,
                                ),
                                decoration: BoxDecoration(
                                  color: widget.selectedInterval == 'yearly'
                                      ? Colors.white.withAlpha(51)
                                      : Colors.orange[600],
                                  borderRadius: BorderRadius.circular(8.h),
                                ),
                                child: Text(
                                  '30% OFF',
                                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                    color: widget.selectedInterval == 'yearly'
                                        ? Colors.white
                                        : Colors.white,
                                    fontWeight: FontWeight.w700,
                                    fontSize: 10.0,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          SizedBox(height: 12.0),

          // Savings indicator
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 300),
            child: widget.selectedInterval == 'yearly'
                ? Container(
                    key: const ValueKey('yearly-savings'),
                    padding: EdgeInsets.symmetric(
                      horizontal: 16.h,
                      vertical: 8.0,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.orange[50],
                      borderRadius: BorderRadius.circular(20.h),
                      border: Border.all(
                        color: Colors.orange[200]!,
                        width: 1,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.savings_outlined,
                          size: 16.0,
                          color: Colors.orange[600],
                        ),
                        SizedBox(width: 6.h),
                        Text(
                          'Save up to 30% with annual billing',
                          style: Theme.of(context).textTheme.labelMedium?.copyWith(
                            color: Colors.orange[700],
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  )
                : Container(
                    key: const ValueKey('monthly-info'),
                    padding: EdgeInsets.symmetric(
                      horizontal: 16.h,
                      vertical: 8.0,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.blue[50],
                      borderRadius: BorderRadius.circular(20.h),
                      border: Border.all(
                        color: Colors.blue[200]!,
                        width: 1,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.credit_card_outlined,
                          size: 16.0,
                          color: Colors.blue[600],
                        ),
                        SizedBox(width: 6.h),
                        Text(
                          'Flexible monthly payments',
                          style: Theme.of(context).textTheme.labelMedium?.copyWith(
                            color: Colors.blue[700],
                            fontWeight: FontWeight.w600,
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

  void _handleIntervalChange(String interval) {
    if (interval != widget.selectedInterval) {
      widget.onIntervalChanged(interval);
    }
  }
}