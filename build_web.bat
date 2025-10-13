@echo off
echo ========================================
echo Building Greenofig for Web Deployment
echo ========================================
echo.

echo Cleaning previous build...
flutter clean

echo.
echo Getting dependencies...
flutter pub get

echo.
echo Building web version (release mode)...
flutter build web --release --web-renderer canvaskit

echo.
echo ========================================
echo Build complete!
echo Output directory: build\web
echo ========================================
echo.
echo To test locally, run:
echo flutter run -d chrome --web-port=8080
echo.
pause
