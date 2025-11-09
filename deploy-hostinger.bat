@echo off
echo ========================================
echo   GreenoFig Deployment to Hostinger
echo ========================================
echo.

REM Check if dist folder exists
if not exist "dist" (
    echo [ERROR] dist folder not found! Building project...
    call npm run build
    if errorlevel 1 (
        echo [ERROR] Build failed!
        pause
        exit /b 1
    )
)

echo [INFO] Build folder ready: dist\
echo.

echo ========================================
echo   Deployment Options
echo ========================================
echo.
echo Choose your deployment method:
echo.
echo 1. Deploy via SFTP (Recommended - using WinSCP CLI)
echo 2. Show manual deployment instructions
echo 3. Exit
echo.

set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" goto deploy_sftp
if "%choice%"=="2" goto manual_instructions
if "%choice%"=="3" goto end

:deploy_sftp
echo.
echo ========================================
echo   SFTP Deployment
echo ========================================
echo.

REM Check if WinSCP is installed
where winscp.com >nul 2>nul
if errorlevel 1 (
    echo [WARNING] WinSCP not found!
    echo.
    echo Please install WinSCP from: https://winscp.net/
    echo Or use manual deployment (Option 2)
    echo.
    pause
    goto manual_instructions
)

echo [INFO] Connecting to Hostinger...
echo [INFO] Server: 157.173.209.161:65002
echo [INFO] User: u492735793
echo.

REM Create WinSCP script
echo option batch abort > deploy_script.txt
echo option confirm off >> deploy_script.txt
echo open sftp://u492735793:Ahmed93@93@157.173.209.161:65002 >> deploy_script.txt
echo cd public_html >> deploy_script.txt
echo synchronize remote dist\ >> deploy_script.txt
echo chmod 644 *.* >> deploy_script.txt
echo chmod 755 assets >> deploy_script.txt
echo exit >> deploy_script.txt

echo [INFO] Uploading files...
winscp.com /script=deploy_script.txt

if errorlevel 1 (
    echo [ERROR] Deployment failed!
    del deploy_script.txt
    pause
    exit /b 1
)

del deploy_script.txt
echo.
echo [SUCCESS] Deployment completed!
echo.
echo Your site is live at: https://greenofig.com
echo.
echo Please:
echo 1. Visit https://greenofig.com
echo 2. Press Ctrl+Shift+R to hard refresh
echo 3. Test the survey: https://greenofig.com/survey
echo.
pause
goto end

:manual_instructions
echo.
echo ========================================
echo   Manual Deployment Instructions
echo ========================================
echo.
echo 1. Connect to your server via SFTP:
echo    Host: 157.173.209.161
echo    Port: 65002
echo    Username: u492735793
echo    Password: Ahmed93@93
echo.
echo 2. Navigate to: public_html folder
echo.
echo 3. Delete all old files in public_html
echo.
echo 4. Upload all files from this folder to public_html:
echo    %CD%\dist
echo.
echo 5. Make sure .htaccess is uploaded (show hidden files)
echo.
echo 6. Set permissions:
echo    Files: 644
echo    Folders: 755
echo.
echo 7. Visit https://greenofig.com and press Ctrl+Shift+R
echo.
echo ========================================
echo   Quick SFTP using FileZilla/WinSCP
echo ========================================
echo.
echo FileZilla Download: https://filezilla-project.org/
echo WinSCP Download: https://winscp.net/
echo.
pause
goto end

:end
echo.
echo Thank you for using GreenoFig deployment!
pause
