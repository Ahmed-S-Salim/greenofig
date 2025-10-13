import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';

import '../../core/app_export.dart';
import '../../core/image_constants.dart';
import '../../models/subscription_plan.dart';
import '../../models/user_subscription.dart';
import '../../services/auth_service.dart';
import '../../services/subscription_service.dart';
import './widgets/billing_toggle.dart';
import './widgets/feature_comparison_sheet.dart';
import './widgets/subscription_tier_card.dart';
import './widgets/trial_banner.dart';
import './widgets/usage_analytics_card.dart';

class PremiumSubscriptionPlansScreen extends StatefulWidget {
  const PremiumSubscriptionPlansScreen({super.key});

  @override
  State<PremiumSubscriptionPlansScreen> createState() =>
      _PremiumSubscriptionPlansScreenState();
}

class _PremiumSubscriptionPlansScreenState
    extends State<PremiumSubscriptionPlansScreen>
    with TickerProviderStateMixin {
  // Loading and data state
  bool _isLoading = true;
  bool _isProcessingUpgrade = false;
  String? _errorMessage;

  // Data
  List<SubscriptionPlan> _subscriptionPlans = [];
  UserSubscription? _currentSubscription;
  Map<String, dynamic> _usageAnalytics = {};

  // UI state
  String _selectedBillingInterval = 'monthly';
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _initializeAnimations();
    _loadSubscriptionData();
  }

  void _initializeAnimations() {
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
  }

  Future<void> _loadSubscriptionData() async {
    try {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });

      // Load subscription plans
      final plans = await SubscriptionService.instance.getSubscriptionPlans();

      // Load current subscription if user is authenticated
      UserSubscription? currentSub;
      Map<String, dynamic> usage = {};

      if (AuthService().isLoggedIn) {
        currentSub =
            await SubscriptionService.instance.getCurrentUserSubscription();
        usage = await SubscriptionService.instance.getSubscriptionUsage();
      }

      setState(() {
        _subscriptionPlans = plans;
        _currentSubscription = currentSub;
        _usageAnalytics = usage;
        _isLoading = false;
      });

      _animationController.forward();
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  void _onBillingIntervalChanged(String interval) {
    setState(() {
      _selectedBillingInterval = interval;
    });
  }

  Future<void> _handleUpgrade(SubscriptionPlan plan) async {
    if (!AuthService().isLoggedIn) {
      _showLoginPrompt();
      return;
    }

    setState(() {
      _isProcessingUpgrade = true;
    });

    try {
      // Show payment confirmation dialog
      final shouldProceed = await _showPaymentConfirmationDialog(plan);
      if (!shouldProceed) {
        setState(() {
          _isProcessingUpgrade = false;
        });
        return;
      }

      // For demo purposes, simulate subscription creation
      // In a real app, this would integrate with Stripe payment processing
      await SubscriptionService.instance.createSubscription(
        planId: plan.id!,
        billingInterval: _selectedBillingInterval,
      );

      // Reload data to reflect changes
      await _loadSubscriptionData();

      // Show success message
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Successfully upgraded to ${plan.name}!'),
          backgroundColor: Theme.of(context).primaryColor,
          behavior: SnackBarBehavior.floating,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Upgrade failed: $e'),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
        ),
      );
    } finally {
      setState(() {
        _isProcessingUpgrade = false;
      });
    }
  }

  void _showLoginPrompt() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Sign In Required'),
        content: const Text('Please sign in to upgrade your subscription.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pushNamed(context, AppRoutes.loginScreen);
            },
            child: const Text('Sign In'),
          ),
        ],
      ),
    );
  }

  Future<bool> _showPaymentConfirmationDialog(SubscriptionPlan plan) async {
    final price = plan.getFormattedPrice(_selectedBillingInterval);
    final period = plan.getBillingPeriod(_selectedBillingInterval);

    return await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            title: Text('Confirm Upgrade'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Upgrade to ${plan.name}?'),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Icon(Icons.credit_card,
                        color: Theme.of(context).primaryColor),
                    const SizedBox(width: 8),
                    Text('$price$period'),
                  ],
                ),
                const SizedBox(height: 8),
                if (_selectedBillingInterval == 'yearly' &&
                    plan.getSavingsPercentage() > 0)
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Theme.of(context).primaryColor.withAlpha(26),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      'Save ${plan.getSavingsPercentage().round()}% annually',
                      style: TextStyle(
                        color: Theme.of(context).primaryColor,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                onPressed: () => Navigator.pop(context, true),
                child: const Text('Upgrade Now'),
              ),
            ],
          ),
        ) ??
        false;
  }

  void _showFeatureComparison() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => FeatureComparisonSheet(
        plans: _subscriptionPlans,
        billingInterval: _selectedBillingInterval,
      ),
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: _buildAppBar(),
      body: _isLoading ? _buildLoadingState() : _buildContent(),
    );
  }

  AppBar _buildAppBar() {
    return AppBar(
      elevation: 0,
      backgroundColor: Colors.white,
      leading: IconButton(
        icon: Icon(Icons.arrow_back_ios, color: Colors.grey[900]),
        onPressed: () => Navigator.pop(context),
      ),
      title: Text(
        'Premium Plans',
        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              color: Colors.grey[900],
              fontWeight: FontWeight.w600,
            ),
      ),
      centerTitle: true,
      actions: [
        IconButton(
          icon: Icon(Icons.compare_arrows, color: Colors.grey[700]),
          onPressed: _showFeatureComparison,
        ),
      ],
    );
  }

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(color: Theme.of(context).primaryColor),
          const SizedBox(height: 16),
          Text(
            'Loading subscription plans...',
            style: TextStyle(color: Colors.grey[600]),
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    if (_errorMessage != null) {
      return _buildErrorState();
    }

    return FadeTransition(
      opacity: _fadeAnimation,
      child: CustomScrollView(
        slivers: [
          // Header section with trial banner
          SliverToBoxAdapter(
            child: Column(
              children: [
                if (_currentSubscription?.isInTrial == true)
                  TrialBanner(subscription: _currentSubscription!),

                if (AuthService().isLoggedIn && _usageAnalytics.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: UsageAnalyticsCard(analytics: _usageAnalytics),
                  ),

                // Billing toggle
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: BillingToggle(
                    selectedInterval: _selectedBillingInterval,
                    onIntervalChanged: _onBillingIntervalChanged,
                  ),
                ),

                const SizedBox(height: 24),
              ],
            ),
          ),

          // Subscription plans grid
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            sliver: SliverGrid(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.75,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
              ),
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final plan = _subscriptionPlans[index];
                  final isCurrentPlan = _currentSubscription?.planId == plan.id;

                  return SubscriptionTierCard(
                    plan: plan,
                    billingInterval: _selectedBillingInterval,
                    isCurrentPlan: isCurrentPlan,
                    isProcessing: _isProcessingUpgrade,
                    onUpgrade: () => _handleUpgrade(plan),
                  );
                },
                childCount: _subscriptionPlans.length,
              ),
            ),
          ),

          // Bottom spacing
          const SliverToBoxAdapter(
            child: SizedBox(height: 100),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CustomImageWidget(
              imageUrl: ImageConstant.sadFace,
              height: 120.h,
              width: 120.h,
            ),
            const SizedBox(height: 24),
            Text(
              'Failed to Load Plans',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    color: Colors.grey[900],
                    fontWeight: FontWeight.w600,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              _errorMessage ?? 'Something went wrong',
              style: TextStyle(color: Colors.grey[600]),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _loadSubscriptionData,
              style: ElevatedButton.styleFrom(
                backgroundColor: Theme.of(context).primaryColor,
                foregroundColor: Colors.white,
                padding:
                    const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
              ),
              child: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }
}
