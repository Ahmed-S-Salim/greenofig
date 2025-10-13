import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../core/app_export.dart';
import './widgets/billing_toggle.dart';
import './widgets/feature_comparison_sheet.dart';
import './widgets/subscription_tier_card.dart';
import './widgets/trial_banner.dart';
import './widgets/usage_analytics_card.dart';

class SubscriptionManagement extends StatefulWidget {
  const SubscriptionManagement({Key? key}) : super(key: key);

  @override
  State<SubscriptionManagement> createState() => _SubscriptionManagementState();
}

class _SubscriptionManagementState extends State<SubscriptionManagement> {
  bool _isYearlyBilling = false;
  String _currentPlan = 'Basic';
  bool _showTrialBanner = true;

  final List<Map<String, dynamic>> _subscriptionTiers = [
    {
      "id": "basic",
      "name": "Basic",
      "description": "Essential health tracking with ads",
      "price": "Free",
      "yearlyDiscount": null,
      "features": [
        "Basic nutrition tracking",
        "Simple workout logging",
        "Weight tracking",
        "Basic progress charts",
        "Community access",
        "Ad-supported experience"
      ]
    },
    {
      "id": "premium",
      "name": "Premium",
      "description": "Enhanced features for serious health enthusiasts",
      "price": "9.99",
      "yearlyDiscount": 20,
      "features": [
        "AI meal planning",
        "Barcode food scanner",
        "Custom workout programs",
        "Advanced analytics",
        "Wearable integration",
        "Ad-free experience",
        "Export health reports",
        "Priority customer support"
      ]
    },
    {
      "id": "pro",
      "name": "Pro",
      "description": "Professional-grade health management",
      "price": "19.99",
      "yearlyDiscount": 25,
      "features": [
        "AI food photo recognition",
        "Personalized coaching",
        "Advanced meal planning",
        "Professional workout videos",
        "Biometric tracking",
        "Sleep analysis",
        "Stress management tools",
        "Family sharing (up to 5 members)",
        "Nutritionist consultations",
        "Custom challenge creation"
      ]
    },
    {
      "id": "elite",
      "name": "Elite",
      "description": "Ultimate wellness experience with VIP support",
      "price": "29.99",
      "yearlyDiscount": 30,
      "features": [
        "Voice AI health coach",
        "Real-time form analysis",
        "Professional health reports",
        "VIP customer support",
        "Early access to features",
        "Unlimited consultations",
        "Advanced biometric insights",
        "Custom app branding",
        "API access for developers",
        "White-label solutions"
      ]
    }
  ];

  final Map<String, dynamic> _analyticsData = {
    "featureUsage": {
      "Nutrition Tracking": 45,
      "Workout Logging": 30,
      "Progress Analytics": 15,
      "Community Features": 10
    },
    "recommendedUpgrade": "Premium"
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.lightTheme.scaffoldBackgroundColor,
      appBar: _buildAppBar(),
      body: SingleChildScrollView(
        child: Column(
          children: [
            if (_showTrialBanner && _currentPlan == 'Basic')
              TrialBanner(onStartTrial: _startFreeTrial),
            BillingToggle(
              isYearly: _isYearlyBilling,
              onToggle: (isYearly) {
                setState(() {
                  _isYearlyBilling = isYearly;
                });
              },
            ),
            SizedBox(height: 2.h),
            ..._subscriptionTiers.map((tier) => SubscriptionTierCard(
                  tierData: _getAdjustedTierData(tier),
                  isCurrentPlan: tier['name'] == _currentPlan,
                  isMostPopular: tier['name'] == 'Pro',
                  onUpgrade: () => _handleUpgrade(tier),
                )),
            SizedBox(height: 2.h),
            _buildCompareButton(),
            SizedBox(height: 3.h),
            UsageAnalyticsCard(analyticsData: _analyticsData),
            SizedBox(height: 2.h),
            _buildSupportSection(),
            SizedBox(height: 4.h),
          ],
        ),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: AppTheme.lightTheme.scaffoldBackgroundColor,
      elevation: 0,
      leading: GestureDetector(
        onTap: () => Navigator.pop(context),
        child: Container(
          margin: EdgeInsets.all(2.w),
          decoration: BoxDecoration(
            color: AppTheme.lightTheme.colorScheme.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: AppTheme.lightTheme.colorScheme.outline,
              width: 1,
            ),
          ),
          child: CustomIconWidget(
            iconName: 'arrow_back_ios',
            color: AppTheme.lightTheme.colorScheme.onSurface,
            size: 20,
          ),
        ),
      ),
      title: Text(
        'Subscription Plans',
        style: GoogleFonts.inter(
          fontSize: 18.sp,
          fontWeight: FontWeight.w600,
          color: AppTheme.lightTheme.colorScheme.onSurface,
        ),
      ),
      actions: [
        GestureDetector(
          onTap: _showRestorePurchases,
          child: Container(
            margin: EdgeInsets.all(2.w),
            padding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 1.h),
            decoration: BoxDecoration(
              color: AppTheme.lightTheme.colorScheme.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: AppTheme.lightTheme.colorScheme.outline,
                width: 1,
              ),
            ),
            child: Text(
              'Restore',
              style: GoogleFonts.inter(
                fontSize: 12.sp,
                fontWeight: FontWeight.w500,
                color: AppTheme.lightTheme.primaryColor,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildCompareButton() {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 4.w),
      child: TextButton(
        onPressed: _showFeatureComparison,
        style: TextButton.styleFrom(
          padding: EdgeInsets.symmetric(vertical: 2.h),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: BorderSide(
              color: AppTheme.lightTheme.primaryColor,
              width: 1,
            ),
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CustomIconWidget(
              iconName: 'compare_arrows',
              color: AppTheme.lightTheme.primaryColor,
              size: 20,
            ),
            SizedBox(width: 2.w),
            Text(
              'Compare All Features',
              style: GoogleFonts.inter(
                fontSize: 14.sp,
                fontWeight: FontWeight.w600,
                color: AppTheme.lightTheme.primaryColor,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSupportSection() {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 4.w),
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: AppTheme.lightTheme.colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppTheme.lightTheme.colorScheme.outline,
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CustomIconWidget(
                iconName: 'support_agent',
                color: AppTheme.lightTheme.primaryColor,
                size: 24,
              ),
              SizedBox(width: 2.w),
              Text(
                'Need Help?',
                style: GoogleFonts.inter(
                  fontSize: 16.sp,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.lightTheme.colorScheme.onSurface,
                ),
              ),
            ],
          ),
          SizedBox(height: 2.h),
          Text(
            'Our support team is here to help you choose the right plan and answer any billing questions.',
            style: GoogleFonts.inter(
              fontSize: 12.sp,
              fontWeight: FontWeight.w400,
              color: AppTheme.lightTheme.colorScheme.onSurfaceVariant,
            ),
          ),
          SizedBox(height: 2.h),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: _contactSupport,
                  style: OutlinedButton.styleFrom(
                    padding: EdgeInsets.symmetric(vertical: 1.5.h),
                  ),
                  child: Text(
                    'Contact Support',
                    style: GoogleFonts.inter(
                      fontSize: 12.sp,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ),
              SizedBox(width: 2.w),
              Expanded(
                child: TextButton(
                  onPressed: _viewFAQ,
                  style: TextButton.styleFrom(
                    padding: EdgeInsets.symmetric(vertical: 1.5.h),
                  ),
                  child: Text(
                    'View FAQ',
                    style: GoogleFonts.inter(
                      fontSize: 12.sp,
                      fontWeight: FontWeight.w500,
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

  Map<String, dynamic> _getAdjustedTierData(Map<String, dynamic> tier) {
    if (tier['price'] == 'Free') return tier;

    final basePrice = double.parse(tier['price'] as String);
    final discount = tier['yearlyDiscount'] as int?;

    if (_isYearlyBilling && discount != null) {
      final yearlyPrice = basePrice * 12 * (1 - discount / 100);
      final monthlyEquivalent = yearlyPrice / 12;

      return {
        ...tier,
        'price': monthlyEquivalent.toStringAsFixed(2),
        'displayYearlyDiscount': true,
      };
    }

    return tier;
  }

  void _handleUpgrade(Map<String, dynamic> tier) {
    if (tier['name'] == _currentPlan) return;

    _showUpgradeDialog(tier);
  }

  void _showUpgradeDialog(Map<String, dynamic> tier) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: Text(
          'Upgrade to ${tier['name']}',
          style: GoogleFonts.inter(
            fontSize: 16.sp,
            fontWeight: FontWeight.w600,
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'You\'re about to upgrade to ${tier['name']} plan.',
              style: GoogleFonts.inter(
                fontSize: 12.sp,
                fontWeight: FontWeight.w400,
              ),
            ),
            SizedBox(height: 2.h),
            if (tier['price'] != 'Free') ...[
              Text(
                'Price: \$${tier['price']}/month',
                style: GoogleFonts.inter(
                  fontSize: 14.sp,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.lightTheme.primaryColor,
                ),
              ),
              SizedBox(height: 1.h),
            ],
            Text(
              'Billing will be handled through your device\'s app store.',
              style: GoogleFonts.inter(
                fontSize: 10.sp,
                fontWeight: FontWeight.w400,
                color: AppTheme.lightTheme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Cancel',
              style: GoogleFonts.inter(
                fontSize: 12.sp,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _processUpgrade(tier);
            },
            child: Text(
              'Upgrade',
              style: GoogleFonts.inter(
                fontSize: 12.sp,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _processUpgrade(Map<String, dynamic> tier) {
    // Simulate platform-specific payment processing
    if (kIsWeb) {
      _showWebPaymentRedirect(tier);
    } else {
      _showMobilePaymentSheet(tier);
    }
  }

  void _showWebPaymentRedirect(Map<String, dynamic> tier) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: Text(
          'Payment Processing',
          style: GoogleFonts.inter(
            fontSize: 16.sp,
            fontWeight: FontWeight.w600,
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CustomIconWidget(
              iconName: 'payment',
              color: AppTheme.lightTheme.primaryColor,
              size: 48,
            ),
            SizedBox(height: 2.h),
            Text(
              'You will be redirected to our secure payment page to complete your ${tier['name']} subscription.',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                fontSize: 12.sp,
                fontWeight: FontWeight.w400,
              ),
            ),
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
              _simulateSuccessfulUpgrade(tier);
            },
            child: Text('Continue'),
          ),
        ],
      ),
    );
  }

  void _showMobilePaymentSheet(Map<String, dynamic> tier) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
      ),
      builder: (context) => Container(
        padding: EdgeInsets.all(4.w),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 12.w,
              height: 0.5.h,
              decoration: BoxDecoration(
                color: AppTheme.lightTheme.colorScheme.outline,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            SizedBox(height: 3.h),
            CustomIconWidget(
              iconName: 'security',
              color: AppTheme.lightTheme.primaryColor,
              size: 48,
            ),
            SizedBox(height: 2.h),
            Text(
              'Secure Payment',
              style: GoogleFonts.inter(
                fontSize: 18.sp,
                fontWeight: FontWeight.w600,
              ),
            ),
            SizedBox(height: 1.h),
            Text(
              'Complete your ${tier['name']} subscription using ${defaultTargetPlatform == TargetPlatform.iOS ? 'Face ID/Touch ID' : 'biometric authentication'}.',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                fontSize: 12.sp,
                fontWeight: FontWeight.w400,
              ),
            ),
            SizedBox(height: 3.h),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  _simulateSuccessfulUpgrade(tier);
                },
                style: ElevatedButton.styleFrom(
                  padding: EdgeInsets.symmetric(vertical: 2.h),
                ),
                child: Text(
                  'Confirm with ${defaultTargetPlatform == TargetPlatform.iOS ? 'Face ID' : 'Fingerprint'}',
                  style: GoogleFonts.inter(
                    fontSize: 14.sp,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
            SizedBox(height: 1.h),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text(
                'Cancel',
                style: GoogleFonts.inter(
                  fontSize: 12.sp,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            SizedBox(height: 2.h),
          ],
        ),
      ),
    );
  }

  void _simulateSuccessfulUpgrade(Map<String, dynamic> tier) {
    setState(() {
      _currentPlan = tier['name'] as String;
      _showTrialBanner = false;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Successfully upgraded to ${tier['name']}! Welcome to your new plan.',
          style: GoogleFonts.inter(
            fontSize: 12.sp,
            fontWeight: FontWeight.w500,
          ),
        ),
        backgroundColor: AppTheme.lightTheme.colorScheme.secondary,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        margin: EdgeInsets.all(4.w),
      ),
    );
  }

  void _startFreeTrial() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: Text(
          'Start Free Trial',
          style: GoogleFonts.inter(
            fontSize: 16.sp,
            fontWeight: FontWeight.w600,
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CustomIconWidget(
              iconName: 'star',
              color: AppTheme.lightTheme.primaryColor,
              size: 48,
            ),
            SizedBox(height: 2.h),
            Text(
              'Get 7 days of Pro features absolutely free. You can cancel anytime before the trial ends.',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(
                fontSize: 12.sp,
                fontWeight: FontWeight.w400,
              ),
            ),
            SizedBox(height: 2.h),
            Text(
              'After trial: \$19.99/month',
              style: GoogleFonts.inter(
                fontSize: 14.sp,
                fontWeight: FontWeight.w600,
                color: AppTheme.lightTheme.primaryColor,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Maybe Later'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              setState(() {
                _showTrialBanner = false;
              });
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                      'Free trial activated! Enjoy Pro features for 7 days.'),
                  backgroundColor: AppTheme.lightTheme.colorScheme.secondary,
                ),
              );
            },
            child: Text('Start Trial'),
          ),
        ],
      ),
    );
  }

  void _showFeatureComparison() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
      ),
      builder: (context) => FeatureComparisonSheet(
        subscriptionTiers: _subscriptionTiers,
      ),
    );
  }

  void _showRestorePurchases() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: Text(
          'Restore Purchases',
          style: GoogleFonts.inter(
            fontSize: 16.sp,
            fontWeight: FontWeight.w600,
          ),
        ),
        content: Text(
          'This will restore any previous purchases made with this Apple ID or Google account.',
          style: GoogleFonts.inter(
            fontSize: 12.sp,
            fontWeight: FontWeight.w400,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('No previous purchases found.'),
                  backgroundColor:
                      AppTheme.lightTheme.colorScheme.onSurfaceVariant,
                ),
              );
            },
            child: Text('Restore'),
          ),
        ],
      ),
    );
  }

  void _contactSupport() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: Text(
          'Contact Support',
          style: GoogleFonts.inter(
            fontSize: 16.sp,
            fontWeight: FontWeight.w600,
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Choose how you\'d like to contact our support team:',
              style: GoogleFonts.inter(
                fontSize: 12.sp,
                fontWeight: FontWeight.w400,
              ),
            ),
            SizedBox(height: 2.h),
            ListTile(
              leading: CustomIconWidget(
                iconName: 'chat',
                color: AppTheme.lightTheme.primaryColor,
                size: 24,
              ),
              title: Text(
                'Live Chat',
                style: GoogleFonts.inter(
                  fontSize: 14.sp,
                  fontWeight: FontWeight.w500,
                ),
              ),
              subtitle: Text(
                'Available 24/7',
                style: GoogleFonts.inter(
                  fontSize: 10.sp,
                  fontWeight: FontWeight.w400,
                ),
              ),
              onTap: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Opening live chat...')),
                );
              },
            ),
            ListTile(
              leading: CustomIconWidget(
                iconName: 'email',
                color: AppTheme.lightTheme.primaryColor,
                size: 24,
              ),
              title: Text(
                'Email Support',
                style: GoogleFonts.inter(
                  fontSize: 14.sp,
                  fontWeight: FontWeight.w500,
                ),
              ),
              subtitle: Text(
                'Response within 24 hours',
                style: GoogleFonts.inter(
                  fontSize: 10.sp,
                  fontWeight: FontWeight.w400,
                ),
              ),
              onTap: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Opening email client...')),
                );
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Close'),
          ),
        ],
      ),
    );
  }

  void _viewFAQ() {
    Navigator.pushNamed(context, '/faq');
  }
}
