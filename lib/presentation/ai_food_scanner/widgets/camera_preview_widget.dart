import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:sizer/sizer.dart';


class CameraPreviewWidget extends StatefulWidget {
  final CameraController? cameraController;
  final VoidCallback onTap;
  final bool isFlashOn;
  final VoidCallback onFlashToggle;
  final bool showGrid;
  final double? height;

  const CameraPreviewWidget({
    Key? key,
    required this.cameraController,
    required this.onTap,
    required this.isFlashOn,
    required this.onFlashToggle,
    required this.showGrid,
    this.height,
  }) : super(key: key);

  @override
  State<CameraPreviewWidget> createState() => _CameraPreviewWidgetState();
}

class _CameraPreviewWidgetState extends State<CameraPreviewWidget> {
  late CameraController _cameraController;
  late List<CameraDescription> _cameras;
  bool _hasError = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _initializeCamera();
  }

  Future<void> _initializeCamera() async {
    try {
      if (kIsWeb) {
        // Web-specific camera initialization with enhanced error handling
        await _initializeWebCamera();
      } else {
        // Mobile camera initialization
        await _initializeMobileCamera();
      }
    } catch (e) {
      debugPrint('Camera initialization error: $e');
      if (mounted) {
        setState(() {
          _hasError = true;
          _errorMessage = _getWebSafeCameraError(e.toString());
        });
      }
    }
  }

  Future<void> _initializeWebCamera() async {
    try {
      _cameras = await availableCameras();
      if (_cameras.isEmpty) {
        throw Exception('No cameras available');
      }

      // Prefer front camera for web, fallback to any available camera
      final camera = _cameras.firstWhere(
        (c) => c.lensDirection == CameraLensDirection.front,
        orElse: () => _cameras.first,
      );

      _cameraController = CameraController(
        camera,
        ResolutionPreset.medium, // Lower resolution for web performance
        enableAudio: false, // Disable audio for web
      );

      await _cameraController.initialize();

      // Skip unsupported settings on web
      try {
        await _cameraController.setFocusMode(FocusMode.auto);
      } catch (e) {
        debugPrint('Focus mode not supported on web: $e');
        // Continue without focus mode
      }

      // Don't try to set flash mode on web - it's not supported
      debugPrint('✅ Web camera initialized successfully');

      if (mounted) {
        setState(() {
          _hasError = false;
          _errorMessage = null;
        });
      }
    } catch (e) {
      debugPrint('❌ Web camera initialization failed: $e');
      rethrow;
    }
  }

  Future<void> _initializeMobileCamera() async {
    try {
      _cameras = await availableCameras();
      if (_cameras.isEmpty) {
        throw Exception('No cameras available');
      }

      final camera = _cameras.firstWhere(
        (c) => c.lensDirection == CameraLensDirection.back,
        orElse: () => _cameras.first,
      );

      _cameraController = CameraController(
        camera,
        ResolutionPreset.high,
        enableAudio: false,
      );

      await _cameraController.initialize();

      // Mobile-specific settings
      try {
        await _cameraController.setFocusMode(FocusMode.auto);
        await _cameraController.setFlashMode(FlashMode.auto);
      } catch (e) {
        debugPrint('Some camera settings not supported: $e');
        // Continue without these settings
      }

      debugPrint('✅ Mobile camera initialized successfully');

      if (mounted) {
        setState(() {
          _hasError = false;
          _errorMessage = null;
        });
      }
    } catch (e) {
      debugPrint('❌ Mobile camera initialization failed: $e');
      rethrow;
    }
  }

  String _getWebSafeCameraError(String error) {
    if (error.contains('NotAllowedError') ||
        error.contains('Permission denied')) {
      return 'Camera permission denied. Please allow camera access and refresh the page.';
    } else if (error.contains('NotFoundError') ||
        error.contains('No cameras available')) {
      return 'No camera found. Please ensure your device has a camera.';
    } else if (error.contains('NotReadableError')) {
      return 'Camera is already in use by another application.';
    } else if (error.contains('OverconstrainedError')) {
      return 'Camera settings not supported by your device.';
    } else if (error.contains('setFocusMode() is not implemented')) {
      // This is expected on web, don't show as error
      debugPrint('Settings error: $error');
      return 'Camera settings not fully supported.'; // Return a non-null string instead
    } else {
      return 'Camera not available. Please check your browser permissions.';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: widget.height ?? 50.h,
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Theme.of(context).colorScheme.primary,
          width: 2,
        ),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(14),
        child: _buildCameraPreview(),
      ),
    );
  }

  Widget _buildCameraPreview() {
    if (_hasError && _errorMessage != null) {
      return _buildErrorState();
    }

    if (!_cameraController.value.isInitialized) {
      return _buildLoadingState();
    }

    return Stack(
      children: [
        // Camera preview with aspect ratio handling for mobile browsers
        SizedBox.expand(
          child: FittedBox(
            fit: BoxFit.cover,
            child: SizedBox(
              width: _cameraController.value.previewSize?.height ?? 1,
              height: _cameraController.value.previewSize?.width ?? 1,
              child: CameraPreview(_cameraController),
            ),
          ),
        ),

        // Enhanced overlay for mobile browsers
        if (widget.showGrid) _buildEnhancedOverlay(),
      ],
    );
  }

  Widget _buildEnhancedOverlay() {
    return Container(
      width: double.infinity,
      height: double.infinity,
      child: Stack(
        children: [
          // Scanning area indicator
          Center(
            child: Container(
              width: 60.w,
              height: 60.w,
              decoration: BoxDecoration(
                border: Border.all(
                  color: Theme.of(context).colorScheme.primary,
                  width: 3,
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Stack(
                children: [
                  // Corner indicators
                  ...List.generate(4, (index) {
                    return Positioned(
                      top: index < 2 ? -2 : null,
                      bottom: index >= 2 ? -2 : null,
                      left: index % 2 == 0 ? -2 : null,
                      right: index % 2 == 1 ? -2 : null,
                      child: Container(
                        width: 8.w,
                        height: 8.w,
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.primary,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    );
                  }),
                ],
              ),
            ),
          ),

          // Instructions for mobile users
          Positioned(
            bottom: 4.h,
            left: 4.w,
            right: 4.w,
            child: Container(
              padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
              decoration: BoxDecoration(
                color: Colors.black.withAlpha(179),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                kIsWeb
                    ? 'Position food within the frame and tap to scan'
                    : 'Center your food in the viewfinder',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w500,
                    ),
                textAlign: TextAlign.center,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState() {
    return Container(
      color: Colors.black,
      child: Center(
        child: Padding(
          padding: EdgeInsets.all(4.w),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.camera_alt_outlined,
                color: Colors.grey[400],
                size: 12.w,
              ),
              SizedBox(height: 2.h),
              Text(
                _errorMessage ?? 'Camera not available',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.grey[400],
                      fontSize:
                          kIsWeb ? 14.sp : 12.sp, // Smaller text on mobile
                    ),
                textAlign: TextAlign.center,
              ),
              if (kIsWeb) ...[
                SizedBox(height: 2.h),
                ElevatedButton.icon(
                  onPressed: () {
                    setState(() {
                      _hasError = false;
                      _errorMessage = null;
                    });
                    _initializeCamera();
                  },
                  icon: Icon(Icons.refresh, size: 4.w),
                  label: Text('Retry'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Theme.of(context).colorScheme.primary,
                    foregroundColor: Colors.black,
                    padding:
                        EdgeInsets.symmetric(horizontal: 6.w, vertical: 1.h),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLoadingState() {
    return Container(
      color: Colors.black,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SizedBox(
              width: 12.w,
              height: 12.w,
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(
                  Theme.of(context).colorScheme.primary,
                ),
                strokeWidth: 3,
              ),
            ),
            SizedBox(height: 2.h),
            Text(
              'Initializing camera...',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.grey[400],
                  ),
            ),
          ],
        ),
      ),
    );
  }
}

class GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withValues(alpha: 0.3)
      ..strokeWidth = 1.0;

    // Vertical lines
    canvas.drawLine(
      Offset(size.width / 3, 0),
      Offset(size.width / 3, size.height),
      paint,
    );
    canvas.drawLine(
      Offset(size.width * 2 / 3, 0),
      Offset(size.width * 2 / 3, size.height),
      paint,
    );

    // Horizontal lines
    canvas.drawLine(
      Offset(0, size.height / 3),
      Offset(size.width, size.height / 3),
      paint,
    );
    canvas.drawLine(
      Offset(0, size.height * 2 / 3),
      Offset(size.width, size.height * 2 / 3),
      paint,
    );
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}