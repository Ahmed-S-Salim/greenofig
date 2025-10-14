import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';
import '../core/app_export.dart';
import '../services/role_service.dart';

/// Widget that gates features based on user role and subscription
class FeatureGate extends StatefulWidget {
  final String feature;
  final Widget child;
  final Widget? lockedChild;
  final VoidCallback? onUpgradePressed;
  final bool showLockIcon;

  const FeatureGate({
    Key? key,
    required this.feature,
    required this.child,
    this.lockedChild,
    this.onUpgradePressed,
    this.showLockIcon = true,
  }) : super(key: key);

  @override
  State<FeatureGate> createState() => _FeatureGateState();
}

class _FeatureGateState extends State<FeatureGate> {
  bool _hasAccess = false;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _checkAccess();
  }

  Future<void> _checkAccess() async {
    final hasAccess =
        await RoleService.instance.hasAccessTo(widget.feature);
    if (mounted) {
      setState(() {
        _hasAccess = hasAccess;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const SizedBox.shrink();
    }

    if (_hasAccess) {
      return widget.child;
    }

    if (widget.lockedChild != null) {
      return widget.lockedChild!;
    }

    return _buildLockedOverlay();
  }

  Widget _buildLockedOverlay() {
    return Stack(
      children: [
        Opacity(
          opacity: 0.3,
          child: widget.child,
        ),
        Positioned.fill(
          child: Container(
            decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: 0.5),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (widget.showLockIcon)
                    Icon(
                      Icons.lock,
                      size: 48,
                      color: Colors.white,
                    ),
                  if (widget.showLockIcon) SizedBox(height: 2.h),
                  Text(
                    'Premium Feature',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16.sp,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  SizedBox(height: 1.h),
                  ElevatedButton(
                    onPressed: widget.onUpgradePressed ??
                        () => _showUpgradeDialog(context),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.lightTheme.primaryColor,
                      foregroundColor: Colors.white,
                    ),
                    child: Text('Upgrade Now'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  void _showUpgradeDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => UpgradeDialog(feature: widget.feature),
    );
  }
}

/// Dialog for showing upgrade options
class UpgradeDialog extends StatelessWidget {
  final String feature;

  const UpgradeDialog({Key? key, required this.feature}) : super(key: key);

  String _getFeatureDisplayName(String feature) {
    final names = {
      'ai_meal_planning': 'AI Meal Planning',
      'ai_food_scanner': 'AI Food Scanner',
      'ai_health_coach': 'AI Health Coach',
      'custom_workout_programs': 'Custom Workout Programs',
      'advanced_analytics': 'Advanced Analytics',
      'wearable_integration': 'Wearable Integration',
      'export_reports': 'Export Reports',
      'client_management': 'Client Management',
    };

    return names[feature] ?? feature.replaceAll('_', ' ').toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      title: Row(
        children: [
          Icon(
            Icons.star,
            color: AppTheme.lightTheme.primaryColor,
            size: 24,
          ),
          SizedBox(width: 2.w),
          Expanded(
            child: Text(
              'Upgrade Required',
              style: TextStyle(
                fontSize: 18.sp,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '${_getFeatureDisplayName(feature)} is a premium feature.',
            style: TextStyle(
              fontSize: 14.sp,
              fontWeight: FontWeight.w400,
            ),
          ),
          SizedBox(height: 2.h),
          Text(
            'Upgrade to Premium or Pro to unlock:',
            style: TextStyle(
              fontSize: 12.sp,
              fontWeight: FontWeight.w500,
            ),
          ),
          SizedBox(height: 1.h),
          _buildBenefitItem('AI-powered meal planning'),
          _buildBenefitItem('Advanced food scanning'),
          _buildBenefitItem('Personalized health coaching'),
          _buildBenefitItem('Custom workout programs'),
          _buildBenefitItem('Ad-free experience'),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text(
            'Maybe Later',
            style: TextStyle(color: Colors.grey),
          ),
        ),
        ElevatedButton(
          onPressed: () {
            Navigator.pop(context);
            Navigator.pushNamed(context, '/subscription-management');
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: AppTheme.lightTheme.primaryColor,
            foregroundColor: Colors.white,
          ),
          child: Text('View Plans'),
        ),
      ],
    );
  }

  Widget _buildBenefitItem(String text) {
    return Padding(
      padding: EdgeInsets.only(bottom: 0.5.h),
      child: Row(
        children: [
          Icon(
            Icons.check_circle,
            color: AppTheme.lightTheme.primaryColor,
            size: 16,
          ),
          SizedBox(width: 2.w),
          Text(
            text,
            style: TextStyle(
              fontSize: 11.sp,
              fontWeight: FontWeight.w400,
            ),
          ),
        ],
      ),
    );
  }
}

/// Banner widget to show role-specific information
class RoleBanner extends StatelessWidget {
  const RoleBanner({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<String>(
      future: RoleService.instance.getRoleDisplayName(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) return const SizedBox.shrink();

        final roleName = snapshot.data!;
        final color = _getRoleColor(roleName);

        return Container(
          padding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 1.h),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                _getRoleIcon(roleName),
                color: color,
                size: 16,
              ),
              SizedBox(width: 2.w),
              Text(
                roleName,
                style: TextStyle(
                  color: color,
                  fontSize: 12.sp,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Color _getRoleColor(String role) {
    switch (role.toLowerCase()) {
      case 'administrator':
        return Colors.red;
      case 'nutritionist':
        return Colors.green;
      case 'premium user':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }

  IconData _getRoleIcon(String role) {
    switch (role.toLowerCase()) {
      case 'administrator':
        return Icons.admin_panel_settings;
      case 'nutritionist':
        return Icons.science;
      case 'premium user':
        return Icons.star;
      default:
        return Icons.person;
    }
  }
}
