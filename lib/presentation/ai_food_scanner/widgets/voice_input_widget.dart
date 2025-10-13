import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:record/record.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

class VoiceInputWidget extends StatefulWidget {
  final Function(String) onVoiceInput;
  final bool isVisible;

  const VoiceInputWidget({
    Key? key,
    required this.onVoiceInput,
    required this.isVisible,
  }) : super(key: key);

  @override
  State<VoiceInputWidget> createState() => _VoiceInputWidgetState();
}

class _VoiceInputWidgetState extends State<VoiceInputWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _pulseAnimation;
  final AudioRecorder _audioRecorder = AudioRecorder();
  bool _isRecording = false;
  bool _hasPermission = false;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );
    _pulseAnimation = Tween<double>(
      begin: 1.0,
      end: 1.3,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));

    _checkMicrophonePermission();
  }

  @override
  void dispose() {
    _animationController.dispose();
    _audioRecorder.dispose();
    super.dispose();
  }

  Future<void> _checkMicrophonePermission() async {
    final hasPermission = await _audioRecorder.hasPermission();
    setState(() {
      _hasPermission = hasPermission;
    });
  }

  Future<void> _startRecording() async {
    if (!_hasPermission) {
      final hasPermission = await _audioRecorder.hasPermission();
      if (!hasPermission) {
        _showPermissionDialog();
        return;
      }
      setState(() {
        _hasPermission = true;
      });
    }

    try {
      setState(() {
        _isRecording = true;
      });

      _animationController.repeat(reverse: true);
      HapticFeedback.lightImpact();

      await _audioRecorder.start(const RecordConfig(), path: 'voice_input.m4a');
    } catch (e) {
      setState(() {
        _isRecording = false;
      });
      _animationController.stop();
    }
  }

  Future<void> _stopRecording() async {
    try {
      final path = await _audioRecorder.stop();
      setState(() {
        _isRecording = false;
      });

      _animationController.stop();
      _animationController.reset();
      HapticFeedback.mediumImpact();

      if (path != null) {
        // Simulate voice processing - in real app, this would use speech-to-text
        await Future.delayed(Duration(seconds: 1));
        widget.onVoiceInput("Grilled chicken breast with vegetables");
      }
    } catch (e) {
      setState(() {
        _isRecording = false;
      });
      _animationController.stop();
    }
  }

  void _showPermissionDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Microphone Permission'),
        content: Text(
            'Please allow microphone access to use voice input for food logging.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              openAppSettings();
            },
            child: Text('Settings'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.isVisible) return SizedBox.shrink();

    return Positioned(
      bottom: 20.h,
      right: 4.w,
      child: GestureDetector(
        onTapDown: (_) => _startRecording(),
        onTapUp: (_) => _stopRecording(),
        onTapCancel: () => _stopRecording(),
        child: AnimatedBuilder(
          animation: _pulseAnimation,
          builder: (context, child) {
            return Transform.scale(
              scale: _isRecording ? _pulseAnimation.value : 1.0,
              child: Container(
                width: 14.w,
                height: 14.w,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: _isRecording
                      ? Colors.red
                      : AppTheme.lightTheme.primaryColor,
                  boxShadow: [
                    BoxShadow(
                      color: (_isRecording
                              ? Colors.red
                              : AppTheme.lightTheme.primaryColor)
                          .withValues(alpha: 0.3),
                      blurRadius: _isRecording ? 20 : 10,
                      spreadRadius: _isRecording ? 5 : 0,
                    ),
                  ],
                ),
                child: Center(
                  child: CustomIconWidget(
                    iconName: _isRecording ? 'mic' : 'mic_none',
                    color: Colors.white,
                    size: 24,
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
