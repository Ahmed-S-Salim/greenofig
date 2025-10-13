import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:sizer/sizer.dart';

import '../../core/app_export.dart';
import '../../theme/app_theme.dart';
import './widgets/navigation_buttons_widget.dart';
import './widgets/onboarding_page_widget.dart';
import './widgets/page_indicator_widget.dart';
import './widgets/privacy_indicators_widget.dart';
import './widgets/subscription_tier_card_widget.dart';

class OnboardingFlow extends StatefulWidget {
  const OnboardingFlow({Key? key}) : super(key: key);

  @override
  State<OnboardingFlow> createState() => _OnboardingFlowState();
}

class _OnboardingFlowState extends State<OnboardingFlow>
    with TickerProviderStateMixin {
  late PageController _pageController;
  late AnimationController _animationController;
  int _currentPage = 0;
  int _selectedTier = 1; // Default to Premium
  final int _totalPages = 5;

  final List<Map<String, dynamic>> _onboardingData = [
    {
      'title': 'AI-Powered Food Recognition',
      'description':
          'Simply snap a photo of your meal and let our AI instantly identify ingredients, calories, and nutritional information with 96% accuracy.',
      'imageUrl':
          'https://images.unsplash.com/photo-1524240621968-dac9cc982482',
      'semanticLabel':
          'Smartphone camera scanning a colorful salad bowl with vegetables and grains on a wooden table'
    },
    {
      'title': 'Personalized Meal Planning',
      'description':
          'Get weekly meal plans tailored to your dietary preferences, cultural background, and budget. Choose from 10+ diet types including vegan, keto, and Mediterranean.',
      'imageUrl':
          'https://images.unsplash.com/photo-1656690099915-6d216495741c',
      'semanticLabel':
          'Organized meal prep containers with colorful healthy foods arranged on a kitchen counter'
    },
    {
      'title': 'Smart Workout Programs',
      'description':
          'Access personalized fitness programs based on your equipment, location, and time constraints. HD video demonstrations guide every exercise.',
      'imageUrl':
          'https://images.unsplash.com/photo-1518310952931-b1de897abd40',
      'semanticLabel':
          'Person doing yoga poses on a mat in a bright modern fitness studio with natural lighting'
    },
    {
      'title': 'Comprehensive Wellness Tracking',
      'description':
          'Monitor sleep, stress, mood, and vital signs. Sync with your favorite wearables for automatic data collection and insights.',
      'imageUrl':
          'https://images.unsplash.com/photo-1710237727671-8c104972fe55',
      'semanticLabel':
          'Smartwatch displaying health metrics on wrist with fitness tracking data and heart rate monitor'
    }
  ];

  final List<Map<String, dynamic>> _subscriptionTiers = [
    {
      'title': 'Basic',
      'price': 'Free',
      'period': 'forever',
      'features': [
        'Basic meal logging',
        'Simple workout tracking',
        'Limited AI features',
        'Ads supported'
      ],
      'isPopular': false,
    },
    {
      'title': 'Premium',
      'price': '\$9.99',
      'period': '/month',
      'features': [
        'AI food scanning',
        'Personalized meal plans',
        'HD workout videos',
        'Progress analytics',
        'Ad-free experience'
      ],
      'isPopular': true,
    },
    {
      'title': 'Pro',
      'price': '\$19.99',
      'period': '/month',
      'features': [
        'Everything in Premium',
        'Advanced AI coaching',
        'Wearable integration',
        'Custom workout programs',
        'Priority support'
      ],
      'isPopular': false,
    },
    {
      'title': 'Elite',
      'price': '\$29.99',
      'period': '/month',
      'features': [
        'Everything in Pro',
        'Voice AI interaction',
        'Professional consultations',
        'Family sharing',
        'VIP support'
      ],
      'isPopular': false,
    },
  ];

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
  }

  @override
  void dispose() {
    _pageController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  void _nextPage() {
    if (_currentPage < _totalPages - 1) {
      HapticFeedback.lightImpact();
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  void _skipOnboarding() {
    HapticFeedback.lightImpact();
    Navigator.pushReplacementNamed(context, '/dashboard-home');
  }

  void _startFreeTrial() {
    HapticFeedback.mediumImpact();
    // Navigate to authentication or dashboard
    Navigator.pushReplacementNamed(context, '/authentication-screen');
  }

  void _continueWithBasic() {
    HapticFeedback.lightImpact();
    // Navigate directly to dashboard with basic features
    Navigator.pushReplacementNamed(context, '/dashboard-home');
  }

  void _selectTier(int index) {
    setState(() {
      _selectedTier = index;
    });
    HapticFeedback.selectionClick();
  }

  Widget _buildOnboardingPages() {
    return PageView.builder(
      controller: _pageController,
      onPageChanged: (index) {
        setState(() {
          _currentPage = index;
        });
        HapticFeedback.selectionClick();
      },
      itemCount: _totalPages,
      itemBuilder: (context, index) {
        if (index < _onboardingData.length) {
          return OnboardingPageWidget(
            title: _onboardingData[index]['title'] as String,
            description: _onboardingData[index]['description'] as String,
            imageUrl: _onboardingData[index]['imageUrl'] as String,
            semanticLabel: _onboardingData[index]['semanticLabel'] as String,
            showAnimation: _currentPage == index,
          );
        } else {
          // Subscription page
          return _buildSubscriptionPage();
        }
      },
    );
  }

  Widget _buildSubscriptionPage() {
    return SafeArea(
      child: SingleChildScrollView(
        padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
        child: Column(
          children: [
            SizedBox(height: 2.h),
            Text(
              'Choose Your Plan',
              style: AppTheme.lightTheme.textTheme.headlineMedium?.copyWith(
                color: AppTheme.lightTheme.colorScheme.onSurface,
                fontWeight: FontWeight.w700,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 1.h),
            Text(
              'Start your wellness journey with the perfect plan for your needs',
              style: AppTheme.lightTheme.textTheme.bodyLarge?.copyWith(
                color: AppTheme.lightTheme.colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            SizedBox(height: 3.h),

            // Subscription tiers
            Container(
              constraints: BoxConstraints(maxHeight: 50.h),
              child: ListView.builder(
                shrinkWrap: true,
                itemCount: _subscriptionTiers.length,
                itemBuilder: (context, index) {
                  final tier = _subscriptionTiers[index];
                  return SubscriptionTierCardWidget(
                    title: tier['title'] as String,
                    price: tier['price'] as String,
                    period: tier['period'] as String,
                    features: (tier['features'] as List).cast<String>(),
                    isPopular: tier['isPopular'] as bool,
                    isSelected: _selectedTier == index,
                    onTap: () => _selectTier(index),
                  );
                },
              ),
            ),

            SizedBox(height: 3.h),
            const PrivacyIndicatorsWidget(),
            SizedBox(height: 2.h),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.lightTheme.scaffoldBackgroundColor,
      appBar: _currentPage < _totalPages - 1
          ? AppBar(
              backgroundColor: Colors.transparent,
              elevation: 0,
              automaticallyImplyLeading: false,
              actions: [
                TextButton(
                  onPressed: _skipOnboarding,
                  child: Text(
                    'Skip',
                    style: AppTheme.lightTheme.textTheme.titleMedium?.copyWith(
                      color: AppTheme.lightTheme.colorScheme.onSurfaceVariant,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                SizedBox(width: 2.w),
              ],
            )
          : null,
      body: Column(
        children: [
          // Page content
          Expanded(
            child: _buildOnboardingPages(),
          ),

          // Page indicator (only for onboarding pages, not subscription)
          if (_currentPage < _totalPages - 1) ...[
            PageIndicatorWidget(
              currentPage: _currentPage,
              totalPages: _onboardingData.length,
            ),
            SizedBox(height: 2.h),
          ],

          // Navigation buttons
          NavigationButtonsWidget(
            isLastPage: _currentPage == _totalPages - 1,
            showSkip: _currentPage < _totalPages - 1,
            onNext: _nextPage,
            onSkip: _skipOnboarding,
            onStartTrial: _startFreeTrial,
            onContinueBasic: _continueWithBasic,
          ),
        ],
      ),
    );
  }
}
