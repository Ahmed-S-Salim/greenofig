import 'package:camera/camera.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:sizer/sizer.dart';

import '../../core/app_export.dart';
import './widgets/bottom_sheet_widget.dart';
import './widgets/camera_preview_widget.dart';
import './widgets/capture_button_widget.dart';
import './widgets/processing_overlay_widget.dart';
import './widgets/results_screen_widget.dart';
import './widgets/viewfinder_widget.dart';
import './widgets/voice_input_widget.dart';

class AiFoodScanner extends StatefulWidget {
  const AiFoodScanner({Key? key}) : super(key: key);

  @override
  State<AiFoodScanner> createState() => _AiFoodScannerState();
}

class _AiFoodScannerState extends State<AiFoodScanner>
    with WidgetsBindingObserver, TickerProviderStateMixin {
  // Camera related
  List<CameraDescription> _cameras = [];
  CameraController? _cameraController;
  bool _isFlashOn = false;
  bool _showGrid = false;

  // UI State
  bool _isProcessing = false;
  bool _showResults = false;
  bool _showVoiceInput = true;
  int _confidencePercentage = 0;

  // Focus related
  Offset? _focusPoint;
  bool _showFocusCircle = false;

  // Data
  List<Map<String, dynamic>> _detectedFoods = [];
  List<Map<String, dynamic>> _recentScans = [];

  // Mock data for recent scans
  final List<Map<String, dynamic>> mockRecentScans = [
    {
      "id": 1,
      "name": "Grilled Chicken",
      "image":
          "https://images.unsplash.com/photo-1583208108406-e32814a219ce",
      "semanticLabel": "Grilled chicken breast with herbs on a white plate",
      "calories": 165,
      "timestamp": DateTime.now().subtract(Duration(hours: 2)),
    },
    {
      "id": 2,
      "name": "Caesar Salad",
      "image":
          "https://images.unsplash.com/photo-1605491380998-f39919b668fd",
      "semanticLabel":
          "Fresh Caesar salad with croutons and parmesan cheese in a white bowl",
      "calories": 320,
      "timestamp": DateTime.now().subtract(Duration(hours: 5)),
    },
    {
      "id": 3,
      "name": "Banana",
      "image":
          "https://images.unsplash.com/photo-1593280443077-ae46e0100ad1",
      "semanticLabel": "Ripe yellow banana on a wooden surface",
      "calories": 105,
      "timestamp": DateTime.now().subtract(Duration(days: 1)),
    },
    {
      "id": 4,
      "name": "Avocado Toast",
      "image":
          "https://images.unsplash.com/photo-1672590312418-99a233c561c4",
      "semanticLabel": "Sliced avocado on toasted bread with seeds on top",
      "calories": 234,
      "timestamp": DateTime.now().subtract(Duration(days: 1)),
    },
    {
      "id": 5,
      "name": "Greek Yogurt",
      "image":
          "https://images.unsplash.com/photo-1657183507180-30d4736ade57",
      "semanticLabel": "Bowl of white Greek yogurt with berries and granola",
      "calories": 150,
      "timestamp": DateTime.now().subtract(Duration(days: 2)),
    },
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _initializeCamera();
    _recentScans = List.from(mockRecentScans);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _cameraController?.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    final CameraController? cameraController = _cameraController;
    if (cameraController == null || !cameraController.value.isInitialized) {
      return;
    }

    if (state == AppLifecycleState.inactive) {
      cameraController.dispose();
    } else if (state == AppLifecycleState.resumed) {
      _initializeCamera();
    }
  }

  Future<bool> _requestCameraPermission() async {
    if (kIsWeb) return true;
    final status = await Permission.camera.request();
    return status.isGranted;
  }

  Future<void> _initializeCamera() async {
    try {
      final hasPermission = await _requestCameraPermission();
      if (!hasPermission) {
        _showPermissionDialog();
        return;
      }

      _cameras = await availableCameras();
      if (_cameras.isEmpty) return;

      final camera = kIsWeb
          ? _cameras.firstWhere(
              (c) => c.lensDirection == CameraLensDirection.front,
              orElse: () => _cameras.first,
            )
          : _cameras.firstWhere(
              (c) => c.lensDirection == CameraLensDirection.back,
              orElse: () => _cameras.first,
            );

      _cameraController = CameraController(
        camera,
        kIsWeb ? ResolutionPreset.medium : ResolutionPreset.high,
        enableAudio: false,
      );

      await _cameraController!.initialize();
      await _applySettings();

      if (mounted) {
        setState(() {});
      }
    } catch (e) {
      debugPrint('Camera initialization error: $e');
    }
  }

  Future<void> _applySettings() async {
    if (_cameraController == null) return;

    try {
      await _cameraController!.setFocusMode(FocusMode.auto);
      if (!kIsWeb) {
        try {
          await _cameraController!.setFlashMode(FlashMode.auto);
        } catch (e) {
          debugPrint('Flash mode not supported: $e');
        }
      }
    } catch (e) {
      debugPrint('Settings error: $e');
    }
  }

  void _showPermissionDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Camera Permission Required'),
        content: Text('Please allow camera access to scan food items.'),
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

  Future<void> _capturePhoto() async {
    if (_cameraController == null || !_cameraController!.value.isInitialized) {
      return;
    }

    try {
      setState(() {
        _isProcessing = true;
        _confidencePercentage = 0;
        _detectedFoods.clear();
      });

      HapticFeedback.mediumImpact();

      // Flash animation effect
      if (!kIsWeb && _isFlashOn) {
        SystemChrome.setSystemUIOverlayStyle(
          SystemUiOverlayStyle.light.copyWith(
            statusBarColor: Colors.white,
          ),
        );
        await Future.delayed(Duration(milliseconds: 100));
        SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle.dark);
      }

      await _cameraController!.takePicture();

      // Simulate AI processing with realistic progression
      await _simulateAIProcessing();
    } catch (e) {
      debugPrint('Capture error: $e');
      setState(() {
        _isProcessing = false;
      });
    }
  }

  Future<void> _simulateAIProcessing() async {
    // Simulate confidence building up
    for (int i = 0; i <= 100; i += 10) {
      await Future.delayed(Duration(milliseconds: 150));
      if (mounted) {
        setState(() {
          _confidencePercentage = i;
        });
      }
    }

    // Simulate food detection results
    await Future.delayed(Duration(milliseconds: 500));

    final mockDetectedFoods = [
      {
        "name": "Grilled Salmon",
        "portion": 1.0,
        "baseCalories": 206.0,
        "calories": 206.0,
        "protein": 22.0,
        "carbs": 0.0,
        "fat": 12.0,
        "confidence": 94,
      },
      {
        "name": "Steamed Broccoli",
        "portion": 0.8,
        "baseCalories": 55.0,
        "calories": 44.0,
        "protein": 3.7,
        "carbs": 11.2,
        "fat": 0.6,
        "confidence": 87,
      },
    ];

    if (mounted) {
      setState(() {
        _detectedFoods = mockDetectedFoods;
        _isProcessing = false;
        _showResults = true;
      });
    }
  }

  Future<void> _selectFromGallery() async {
    try {
      final ImagePicker picker = ImagePicker();
      final XFile? image = await picker.pickImage(source: ImageSource.gallery);

      if (image != null) {
        setState(() {
          _isProcessing = true;
        });

        await _simulateAIProcessing();
      }
    } catch (e) {
      debugPrint('Gallery selection error: $e');
    }
  }

  void _toggleFlash() {
    if (kIsWeb || _cameraController == null) return;

    setState(() {
      _isFlashOn = !_isFlashOn;
    });

    try {
      _cameraController!
          .setFlashMode(_isFlashOn ? FlashMode.torch : FlashMode.off);
    } catch (e) {
      debugPrint('Flash toggle error: $e');
    }
  }

  void _onCameraPreviewTap(TapDownDetails details) {
    if (_cameraController == null) return;

    final Offset localPosition = details.localPosition;
    final RenderBox renderBox = context.findRenderObject() as RenderBox;
    final Offset globalPosition = renderBox.localToGlobal(localPosition);

    setState(() {
      _focusPoint = globalPosition;
      _showFocusCircle = true;
    });

    // Hide focus circle after 2 seconds
    Future.delayed(Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _showFocusCircle = false;
        });
      }
    });

    // Set focus point
    try {
      final double x = localPosition.dx / renderBox.size.width;
      final double y = localPosition.dy / renderBox.size.height;
      _cameraController!.setFocusPoint(Offset(x, y));
      _cameraController!.setExposurePoint(Offset(x, y));
    } catch (e) {
      debugPrint('Focus error: $e');
    }
  }

  void _handleVoiceInput(String input) {
    // In a real app, this would process the voice input
    // For now, we'll simulate adding a food item
    final voiceFood = {
      "name": input,
      "portion": 1.0,
      "baseCalories": 180.0,
      "calories": 180.0,
      "protein": 25.0,
      "carbs": 5.0,
      "fat": 8.0,
      "confidence": 85,
    };

    setState(() {
      _detectedFoods = [voiceFood];
      _showResults = true;
    });
  }

  void _saveResults() {
    // Add to recent scans
    final newScan = {
      "id": _recentScans.length + 1,
      "name": _detectedFoods.first['name'],
      "image":
          "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      "semanticLabel": "Freshly scanned food item on a plate",
      "calories": (_detectedFoods.first['calories'] as double).toInt(),
      "timestamp": DateTime.now(),
    };

    setState(() {
      _recentScans.insert(0, newScan);
      if (_recentScans.length > 10) {
        _recentScans.removeLast();
      }
      _showResults = false;
      _detectedFoods.clear();
    });

    // Navigate back to dashboard or show success message
    Navigator.pushReplacementNamed(context, '/dashboard-home');
  }

  void _retakePhoto() {
    setState(() {
      _showResults = false;
      _detectedFoods.clear();
      _confidencePercentage = 0;
    });
  }

  void _showManualCorrection() {
    // Navigate to food database search
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: 80.h,
        decoration: BoxDecoration(
          color: AppTheme.lightTheme.colorScheme.surface,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(20),
            topRight: Radius.circular(20),
          ),
        ),
        child: Column(
          children: [
            Container(
              margin: EdgeInsets.only(top: 1.h),
              width: 12.w,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            Padding(
              padding: EdgeInsets.all(4.w),
              child: Text(
                'Search Food Database',
                style: AppTheme.lightTheme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            Expanded(
              child: Center(
                child: Text(
                  'Food database search would be implemented here',
                  style: AppTheme.lightTheme.textTheme.bodyMedium,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showTips() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Scanning Tips'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('• Ensure good lighting'),
            Text('• Keep food centered'),
            Text('• Hold device steady'),
            Text('• Avoid shadows'),
            Text('• Clean camera lens'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Got it'),
          ),
        ],
      ),
    );
  }

  void _handleRecentScanTap(Map<String, dynamic> scan) {
    // Re-log the recent scan
    setState(() {
      _detectedFoods = [
        {
          "name": scan['name'],
          "portion": 1.0,
          "baseCalories": (scan['calories'] as int).toDouble(),
          "calories": (scan['calories'] as int).toDouble(),
          "protein": 20.0,
          "carbs": 15.0,
          "fat": 8.0,
          "confidence": 95,
        }
      ];
      _showResults = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_showResults) {
      return Scaffold(
        body: ResultsScreenWidget(
          detectedFoods: _detectedFoods,
          onSave: _saveResults,
          onRetake: _retakePhoto,
          onManualCorrection: _showManualCorrection,
        ),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Camera Preview
          GestureDetector(
            onTapDown: (details) => _onCameraPreviewTap(details),
            child: CameraPreviewWidget(
              cameraController: _cameraController,
              onTap: () {},
              isFlashOn: _isFlashOn,
              onFlashToggle: _toggleFlash,
              showGrid: _showGrid,
            ),
          ),

          // Focus Circle
          if (_showFocusCircle && _focusPoint != null)
            Positioned(
              left: _focusPoint!.dx - 30,
              top: _focusPoint!.dy - 30,
              child: Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: AppTheme.lightTheme.primaryColor,
                    width: 2,
                  ),
                ),
              ),
            ),

          // Viewfinder
          ViewfinderWidget(
            isScanning: _isProcessing,
          ),

          // Top Controls
          Positioned(
            top: 6.h,
            left: 4.w,
            child: SafeArea(
              child: Row(
                children: [
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: CustomIconWidget(
                      iconName: 'close',
                      color: Colors.white,
                      size: 24,
                    ),
                  ),
                  SizedBox(width: 4.w),
                  IconButton(
                    onPressed: () {
                      setState(() {
                        _showGrid = !_showGrid;
                      });
                    },
                    icon: CustomIconWidget(
                      iconName: _showGrid ? 'grid_on' : 'grid_off',
                      color: Colors.white,
                      size: 24,
                    ),
                  ),
                  SizedBox(width: 4.w),
                  IconButton(
                    onPressed: _selectFromGallery,
                    icon: CustomIconWidget(
                      iconName: 'photo_library',
                      color: Colors.white,
                      size: 24,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Capture Button
          CaptureButtonWidget(
            onCapture: _capturePhoto,
            isProcessing: _isProcessing,
          ),

          // Voice Input
          VoiceInputWidget(
            onVoiceInput: _handleVoiceInput,
            isVisible: _showVoiceInput && !_isProcessing,
          ),

          // Bottom Sheet
          BottomSheetWidget(
            recentScans: _recentScans,
            onTipsPressed: _showTips,
            onRecentScanTap: _handleRecentScanTap,
          ),

          // Processing Overlay
          ProcessingOverlayWidget(
            isVisible: _isProcessing,
            confidencePercentage: _confidencePercentage,
            detectedFoods: _detectedFoods,
          ),
        ],
      ),
    );
  }
}
