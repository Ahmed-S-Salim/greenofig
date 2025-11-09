@echo off
echo ========================================
echo   Deploying Fixed .htaccess to Hostinger
echo ========================================
echo.
echo This will upload the fixed .htaccess file that:
echo - Allows cdn.jsdelivr.net (for Eruda debug console)
echo - Allows worker scripts (for proper JS module loading)
echo.
echo This should fix:
echo ✓ Blank dashboard pages on mobile
echo ✓ Debug console not showing
echo.
pause

echo.
echo Creating deployment script...

REM Create the deployment script
echo option batch abort > deploy-htaccess.txt
echo option confirm off >> deploy-htaccess.txt
echo open sftp://u492735793:Ahmed93@93@157.173.209.161:65002 >> deploy-htaccess.txt
echo cd domains/greenofig.com/public_html >> deploy-htaccess.txt
echo put dist\.htaccess .htaccess >> deploy-htaccess.txt
echo chmod 644 .htaccess >> deploy-htaccess.txt
echo exit >> deploy-htaccess.txt

echo.
echo Checking for WinSCP...
where winscp.com >nul 2>nul
if errorlevel 1 (
    echo.
    echo [ERROR] WinSCP not found!
    echo.
    echo Please install WinSCP from: https://winscp.net/
    echo Or manually upload dist\.htaccess to the server:
    echo.
    echo Server: 157.173.209.161:65002
    echo Username: u492735793
    echo Password: Ahmed93@93
    echo Path: domains/greenofig.com/public_html/.htaccess
    echo.
    del deploy-htaccess.txt
    pause
    exit /b 1
)

echo.
echo Uploading .htaccess file...
winscp.com /script=deploy-htaccess.txt

if errorlevel 1 (
    echo.
    echo [ERROR] Upload failed!
    del deploy-htaccess.txt
    pause
    exit /b 1
)

del deploy-htaccess.txt

echo.
echo ========================================
echo   ✅ SUCCESS!
echo ========================================
echo.
echo The fixed .htaccess has been deployed!
echo.
echo NEXT STEPS:
echo 1. Open your mobile browser
echo 2. Go to https://greenofig.com
echo 3. Hard refresh (pull down to refresh or clear cache)
echo 4. Login with zhzh4690@gmail.com
echo 5. You should now see:
echo    - Green debug button (🐛) in bottom-right corner
echo    - Dashboard loads properly instead of blank page
echo.
echo If you see the green debug button, tap it and select "Console"
echo to see any remaining errors.
echo.
pause
