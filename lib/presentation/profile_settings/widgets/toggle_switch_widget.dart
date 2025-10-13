import 'package:flutter/material.dart';

import '../../../core/app_export.dart';
import '../../../theme/app_theme.dart';

class ToggleSwitchWidget extends StatelessWidget {
  final bool value;
  final ValueChanged<bool> onChanged;
  final bool enabled;

  const ToggleSwitchWidget({
    super.key,
    required this.value,
    required this.onChanged,
    this.enabled = true,
  });

  @override
  Widget build(BuildContext context) {
    return Switch(
      value: value,
      onChanged: enabled ? onChanged : null,
      activeColor: AppTheme.lightTheme.primaryColor,
      inactiveThumbColor: Theme.of(context).colorScheme.onSurfaceVariant,
      inactiveTrackColor:
          Theme.of(context).colorScheme.onSurfaceVariant.withValues(alpha: 0.3),
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
    );
  }
}
