import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../core/app_export.dart';
import '../subscription_activation_flow/widgets/feature_comparison_widget.dart';
import '../subscription_activation_flow/widgets/subscription_pricing_card.dart';

class SubscriptionActivationFlow extends StatefulWidget {
  const SubscriptionActivationFlow({Key? key}) : super(key: key);

  @override
  State<SubscriptionActivationFlow> createState() =>
      _SubscriptionActivationFlowState();
}

class _SubscriptionActivationFlowState extends State<SubscriptionActivationFlow>
    with TickerProviderStateMixin {
  late AnimationController _fadeController;
  late AnimationController _slideController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  bool _isAnnual = false;
  int _selectedPlanIndex = 1; // Default to Premium plan
  bool _isLoading = false;

  final List<Map<String, dynamic>> _subscriptionPlans = [
    {
      'id': 'basic',
      'name': 'Basic',
      'description': 'Perfect for getting started',
      'monthlyPrice': 9.99,
      'yearlyPrice': 99.99,
      'color': const Color(0xFF4CAF50),
      'isPopular': false,
      'features': [
        'AI Food Scanner (50 scans/month)',
        'Basic Meal Planning',
        'Essential Workout Tracking',
        'Progress Photos',
        'Community Support',
      ],
      'limits': {
        'ai_scans': 50,
        'meal_plans': 10,
        'workouts': 'Basic',
        'storage': '500MB',
      }
    },
    {
      'id': 'premium',
      'name': 'Premium',
      'description': 'Most popular for serious users',
      'monthlyPrice': 19.99,
      'yearlyPrice': 199.99,
      'color': const Color(0xFF2196F3),
      'isPopular': true,
      'features': [
        'Unlimited AI Food Scanning',
        'Advanced Meal Planning & Recipes',
        'Personalized Workout Programs',
        'Health Device Integration',
        'Detailed Progress Analytics',
        'Nutrition Coaching',
        'Priority Support',
      ],
      'limits': {
        'ai_scans': -1, // Unlimited
        'meal_plans': -1, // Unlimited
        'workouts': 'Advanced',
        'storage': '5GB',
      }
    },
    {
      'id': 'pro',
      'name': 'Pro',
      'description': 'Ultimate health & fitness experience',
      'monthlyPrice': 29.99,
      'yearlyPrice': 299.99,
      'color': const Color(0xFFFF9800),
      'isPopular': false,
      'features': [
        'Everything in Premium',
        'Personal AI Health Coach',
        'Custom Workout Creation',
        'Advanced Biometric Tracking',
        'Meal Delivery Integration',
        'Live Coaching Sessions',
        'White-glove Support',
        'Family Plan (up to 4 users)',
      ],
      'limits': {
        'ai_scans': -1,
        'meal_plans': -1,
        'workouts': 'Professional',
        'storage': 'Unlimited',
      }
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

    _slideController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeOut,
    ));

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _slideController,
      curve: Curves.easeOutBack,
    ));

    _fadeController.forward();
    _slideController.forward();
  }

  @override
  void dispose() {
    _fadeController.dispose();
    _slideController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: theme.colorScheme.onSurface),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          TextButton(
            onPressed: () =>
                Navigator.pushNamed(context, AppRoutes.dashboardHome),
            child: Text(
              'Skip for now',
              style: GoogleFonts.inter(
                fontSize: 14.sp,
                fontWeight: FontWeight.w500,
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.symmetric(horizontal: 4.w),
              child: FadeTransition(
                opacity: _fadeAnimation,
                child: SlideTransition(
                  position: _slideAnimation,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      SizedBox(height: 2.h),

                      // Header Section
                      _buildHeaderSection(theme),

                      SizedBox(height: 4.h),

                      // Billing Toggle
                      _buildBillingToggle(theme),

                      SizedBox(height: 4.h),

                      // Subscription Plans
                      _buildSubscriptionPlans(theme),

                      SizedBox(height: 4.h),

                      // Feature Comparison
                      _buildFeatureComparison(theme),

                      SizedBox(height: 4.h),

                      // Trust Indicators
                      _buildTrustIndicators(theme),

                      SizedBox(height: 4.h),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // Bottom CTA
          _buildBottomCTA(theme),
        ],
      ),
    );
  }

  Widget _buildHeaderSection(ThemeData theme) {
    return Column(
      children: [
        Container(
          padding: EdgeInsets.all(4.w),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                theme.colorScheme.primary.withAlpha(26),
                theme.colorScheme.primaryContainer.withAlpha(51),
              ],
            ),
            shape: BoxShape.circle,
          ),
          child: CustomIconWidget(
            iconName: 'workspace_premium',
            color: theme.colorScheme.primary,
            size: 12.w,
          ),
        ),

        SizedBox(height: 3.h),

        Text(
          'Choose Your Greenofig Plan',
          style: GoogleFonts.inter(
            fontSize: 28.sp,
            fontWeight: FontWeight.w700,
            color: theme.colorScheme.onSurface,
            letterSpacing: -0.5,
          ),
          textAlign: TextAlign.center,
        ),

        SizedBox(height: 1.5.h),

        Text(
          'Transform your health journey with AI-powered nutrition and fitness tracking. Join thousands achieving their wellness goals.',
          style: GoogleFonts.inter(
            fontSize: 16.sp,
            fontWeight: FontWeight.w400,
            color: theme.colorScheme.onSurfaceVariant,
            height: 1.5,
          ),
          textAlign: TextAlign.center,
        ),

        SizedBox(height: 2.h),

        // Powered by Greenofig.com Badge
        Container(
          padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.h),
          decoration: BoxDecoration(
            color: theme.colorScheme.primary.withAlpha(26),
            borderRadius: BorderRadius.circular(25),
            border: Border.all(
              color: theme.colorScheme.primary.withAlpha((0.3 * 255).round()),
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.verified,
                size: 4.w,
                color: theme.colorScheme.primary,
              ),
              SizedBox(width: 2.w),
              Text(
                'Powered by greenofig.com',
                style: GoogleFonts.inter(
                  fontSize: 12.sp,
                  fontWeight: FontWeight.w600,
                  color: theme.colorScheme.primary,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildBillingToggle(ThemeData theme) {
    return Container(
      padding: EdgeInsets.all(1.w),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest.withAlpha(128),
        borderRadius: BorderRadius.circular(30),
        border: Border.all(
          color: theme.colorScheme.outline.withAlpha(77),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildToggleButton('Monthly', !_isAnnual, theme),
          _buildToggleButton('Annual', _isAnnual, theme, badge: 'Save 17%'),
        ],
      ),
    );
  }

  Widget _buildToggleButton(String text, bool isSelected, ThemeData theme,
      {String? badge}) {
    return GestureDetector(
      onTap: () {
        setState(() {
          _isAnnual = text == 'Annual';
        });
      },
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 1.5.h),
        decoration: BoxDecoration(
          color: isSelected ? theme.colorScheme.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(25),
        ),
        child: Row(
          children: [
            Text(
              text,
              style: GoogleFonts.inter(
                fontSize: 14.sp,
                fontWeight: FontWeight.w600,
                color: isSelected
                    ? theme.colorScheme.onPrimary
                    : theme.colorScheme.onSurfaceVariant,
              ),
            ),
            if (badge != null) ...[
              SizedBox(width: 2.w),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 2.w, vertical: 0.5.h),
                decoration: BoxDecoration(
                  color: isSelected
                      ? theme.colorScheme.onPrimary
                      : theme.colorScheme.primary,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  badge,
                  style: GoogleFonts.inter(
                    fontSize: 10.sp,
                    fontWeight: FontWeight.w700,
                    color: isSelected
                        ? theme.colorScheme.primary
                        : theme.colorScheme.onPrimary,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildSubscriptionPlans(ThemeData theme) {
    return Column(
      children: [
        // Plans Grid
        ...List.generate(_subscriptionPlans.length, (index) {
          final plan = _subscriptionPlans[index];
          final isSelected = _selectedPlanIndex == index;

          return Padding(
            padding: EdgeInsets.only(bottom: 3.h),
            child: SubscriptionPricingCard(
              plan: plan,
              isAnnual: _isAnnual,
              isSelected: isSelected,
              onTap: () => setState(() => _selectedPlanIndex = index),
            ),
          );
        }),
      ],
    );
  }

  Widget _buildFeatureComparison(ThemeData theme) {
    return Container(
      margin: EdgeInsets.symmetric(vertical: 2.h),
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
                iconName: 'compare',
                color: theme.colorScheme.primary,
                size: 6.w,
              ),
              SizedBox(width: 3.w),
              Expanded(
                child: Text(
                  'Compare All Features',
                  style: GoogleFonts.inter(
                    fontSize: 18.sp,
                    fontWeight: FontWeight.w700,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
              ),
              Icon(
                Icons.expand_more,
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ],
          ),
          SizedBox(height: 2.h),
          FeatureComparisonWidget(plans: _subscriptionPlans),
        ],
      ),
    );
  }

  Widget _buildTrustIndicators(ThemeData theme) {
    return Container(
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: theme.colorScheme.primaryContainer.withAlpha(51),
        borderRadius: BorderRadius.circular(15),
        border: Border.all(
          color: theme.colorScheme.primary.withAlpha(77),
        ),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildTrustItem('🔒', 'Secure\nPayments', theme),
              _buildTrustItem('📱', 'Cancel\nAnytime', theme),
              _buildTrustItem('⭐', '4.8/5\nRating', theme),
              _buildTrustItem('💪', '50K+\nUsers', theme),
            ],
          ),
          SizedBox(height: 3.h),
          Text(
            '30-day money-back guarantee • No hidden fees',
            style: GoogleFonts.inter(
              fontSize: 12.sp,
              fontWeight: FontWeight.w500,
              color: theme.colorScheme.primary,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildTrustItem(String emoji, String text, ThemeData theme) {
    return Column(
      children: [
        Text(
          emoji,
          style: TextStyle(fontSize: 24.sp),
        ),
        SizedBox(height: 1.h),
        Text(
          text,
          style: GoogleFonts.inter(
            fontSize: 11.sp,
            fontWeight: FontWeight.w600,
            color: theme.colorScheme.onSurface,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildBottomCTA(ThemeData theme) {
    final selectedPlan = _subscriptionPlans[_selectedPlanIndex];
    final price =
        _isAnnual ? selectedPlan['yearlyPrice'] : selectedPlan['monthlyPrice'];
    final billingText = _isAnnual ? '/year' : '/month';

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
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Price Summary
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${selectedPlan['name']} Plan',
                    style: GoogleFonts.inter(
                      fontSize: 16.sp,
                      fontWeight: FontWeight.w600,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                  Text(
                    '\$${price.toStringAsFixed(2)}$billingText',
                    style: GoogleFonts.inter(
                      fontSize: 20.sp,
                      fontWeight: FontWeight.w700,
                      color: theme.colorScheme.primary,
                    ),
                  ),
                ],
              ),
            ],
          ),

          SizedBox(height: 2.h),

          // Start Subscription Button
          SizedBox(
            width: double.infinity,
            height: 6.h,
            child: ElevatedButton(
              onPressed:
                  _isLoading ? null : () => _handleSubscriptionPurchase(),
              style: ElevatedButton.styleFrom(
                backgroundColor: theme.colorScheme.primary,
                foregroundColor: theme.colorScheme.onPrimary,
                elevation: 6,
                shadowColor: theme.colorScheme.primary.withAlpha(102),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(30),
                ),
              ),
              child: _isLoading
                  ? Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            color: theme.colorScheme.onPrimary,
                            strokeWidth: 2,
                          ),
                        ),
                        SizedBox(width: 3.w),
                        Text(
                          'Processing...',
                          style: GoogleFonts.inter(
                            fontSize: 16.sp,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    )
                  : Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CustomIconWidget(
                          iconName: 'rocket_launch',
                          color: theme.colorScheme.onPrimary,
                          size: 5.w,
                        ),
                        SizedBox(width: 3.w),
                        Text(
                          'Start ${selectedPlan['name']} Plan',
                          style: GoogleFonts.inter(
                            fontSize: 18.sp,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
            ),
          ),

          SizedBox(height: 1.h),

          Text(
            'By continuing, you agree to our Terms of Service and Privacy Policy',
            style: GoogleFonts.inter(
              fontSize: 11.sp,
              color: theme.colorScheme.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  void _handleSubscriptionPurchase() async {
    setState(() => _isLoading = true);

    try {
      final selectedPlan = _subscriptionPlans[_selectedPlanIndex];

      // Mock subscription purchase - integrate with actual payment service
      await Future.delayed(const Duration(seconds: 2));

      // Show success and navigate
      _showSubscriptionSuccessDialog(selectedPlan);
    } catch (e) {
      // Show error
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Subscription failed: ${e.toString()}'),
          backgroundColor: Theme.of(context).colorScheme.error,
        ),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showSubscriptionSuccessDialog(Map<String, dynamic> plan) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: EdgeInsets.all(4.w),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primary.withAlpha(26),
                shape: BoxShape.circle,
              ),
              child: CustomIconWidget(
                iconName: 'check_circle',
                color: Theme.of(context).colorScheme.primary,
                size: 12.w,
              ),
            ),
            SizedBox(height: 3.h),
            Text(
              'Welcome to ${plan['name']}!',
              style: GoogleFonts.inter(
                fontSize: 20.sp,
                fontWeight: FontWeight.w700,
                color: Theme.of(context).colorScheme.onSurface,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 2.h),
            Text(
              'Your subscription is now active. Start exploring all the premium features!',
              style: GoogleFonts.inter(
                fontSize: 14.sp,
                color: Theme.of(context).colorScheme.onSurfaceVariant,
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
        actions: [
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, AppRoutes.dashboardHome);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Theme.of(context).colorScheme.primary,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(25),
                ),
              ),
              child: Text(
                'Start Using Greenofig',
                style: GoogleFonts.inter(
                  fontSize: 16.sp,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
