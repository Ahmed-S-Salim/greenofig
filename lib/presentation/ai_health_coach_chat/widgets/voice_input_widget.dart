import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:record/record.dart';
import 'package:sizer/sizer.dart';

import '../../../core/app_export.dart';

class VoiceInputWidget extends StatefulWidget {
  final Function(String) onVoiceInput;

  const VoiceInputWidget({
    Key? key,
    required this.onVoiceInput,
  }) : super(key: key);

  @override
  State<VoiceInputWidget> createState() => _VoiceInputWidgetState();
}

class _VoiceInputWidgetState extends State<VoiceInputWidget>
    with TickerProviderStateMixin {
  final AudioRecorder _audioRecorder = AudioRecorder();
  bool _isRecording = false;
  bool _isProcessing = false;
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 1.2,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _animationController.dispose();
    _audioRecorder.dispose();
    super.dispose();
  }

  Future<bool> _requestMicrophonePermission() async {
    if (kIsWeb) return true;

    final status = await Permission.microphone.request();
    return status.isGranted;
  }

  Future<void> _startRecording() async {
    if (!await _requestMicrophonePermission()) {
      _showPermissionDialog();
      return;
    }

    try {
      if (await _audioRecorder.hasPermission()) {
        setState(() {
          _isRecording = true;
        });

        _animationController.repeat(reverse: true);

        if (kIsWeb) {
          await _audioRecorder.start(
            const RecordConfig(encoder: AudioEncoder.wav),
            path: 'recording.wav',
          );
        } else {
          final dir = await getTemporaryDirectory();
          String path = '${dir.path}/recording.m4a';
          await _audioRecorder.start(
            const RecordConfig(),
            path: path,
          );
        }
      }
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
        _isProcessing = true;
      });

      _animationController.stop();
      _animationController.reset();

      if (path != null) {
        // Simulate voice processing
        await Future.delayed(const Duration(seconds: 2));

        // Mock transcription result
        final transcribedText = _getMockTranscription();
        widget.onVoiceInput(transcribedText);
      }
    } catch (e) {
      // Handle error silently
    } finally {
      setState(() {
        _isProcessing = false;
      });
    }
  }

  String _getMockTranscription() {
    final mockTranscriptions = [
      "What should I eat for breakfast today?",
      "How many calories should I consume daily?",
      "Can you suggest a workout routine for beginners?",
      "What are some healthy snack options?",
      "How can I improve my sleep quality?",
      "What's the best time to exercise?",
    ];

    return mockTranscriptions[
        DateTime.now().millisecond % mockTranscriptions.length];
  }

  void _showPermissionDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(
            'Microphone Permission Required',
            style: AppTheme.lightTheme.textTheme.titleMedium,
          ),
          content: Text(
            'Please allow microphone access to use voice input feature.',
            style: AppTheme.lightTheme.textTheme.bodyMedium,
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text(
                'Cancel',
                style: TextStyle(color: AppTheme.textSecondaryDark),
              ),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                openAppSettings();
              },
              child: Text(
                'Settings',
                style: TextStyle(color: AppTheme.lightTheme.primaryColor),
              ),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _isProcessing
          ? null
          : (_isRecording ? _stopRecording : _startRecording),
      child: AnimatedBuilder(
        animation: _scaleAnimation,
        builder: (context, child) {
          return Transform.scale(
            scale: _isRecording ? _scaleAnimation.value : 1.0,
            child: Container(
              width: 12.w,
              height: 12.w,
              decoration: BoxDecoration(
                color: _isRecording
                    ? AppTheme.lightTheme.colorScheme.error
                    : _isProcessing
                        ? AppTheme.lightTheme.colorScheme.secondary
                        : AppTheme.lightTheme.primaryColor,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: (_isRecording
                            ? AppTheme.lightTheme.colorScheme.error
                            : AppTheme.lightTheme.primaryColor)
                        .withValues(alpha: 0.3),
                    blurRadius: _isRecording ? 8 : 4,
                    spreadRadius: _isRecording ? 2 : 0,
                  ),
                ],
              ),
              child: Center(
                child: _isProcessing
                    ? SizedBox(
                        width: 5.w,
                        height: 5.w,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor:
                              AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : CustomIconWidget(
                        iconName: _isRecording ? 'stop' : 'mic',
                        color: Colors.white,
                        size: 6.w,
                      ),
              ),
            ),
          );
        },
      ),
    );
  }
}