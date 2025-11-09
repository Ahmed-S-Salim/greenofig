@echo off
echo ================================
echo GreenoFig Complete Features Deployment
echo ================================
echo.

echo Step 1: Building project...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Build failed! Please fix errors and try again.
    pause
    exit /b 1
)
echo Build successful!
echo.

echo Step 2: Creating deployment archive...
tar -czf dist-complete-features-seo.tar.gz -C dist .
if %ERRORLEVEL% NEQ 0 (
    echo Failed to create archive!
    pause
    exit /b 1
)
echo Archive created successfully!
echo.

echo Step 3: Uploading to Hostinger...
"C:\Program Files\Git\usr\bin\scp.exe" -P 65002 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null dist-complete-features-seo.tar.gz u492735793@157.173.209.161:domains/greenofig.com/
if %ERRORLEVEL% NEQ 0 (
    echo Upload failed!
    pause
    exit /b 1
)
echo Upload successful!
echo.

echo Step 4: Deploying on server...
"C:\Program Files\Git\usr\bin\ssh.exe" -p 65002 -o StrictHostKeyChecking=no u492735793@157.173.209.161 "cd domains/greenofig.com && tar -xzf dist-complete-features-seo.tar.gz -C public_html/ && rm dist-complete-features-seo.tar.gz && echo '✅ Complete Features & SEO Deployed Successfully!' && date"
if %ERRORLEVEL% NEQ 0 (
    echo Deployment failed!
    pause
    exit /b 1
)
echo.

echo ================================
echo 🎉 Deployment Complete!
echo ================================
echo.
echo Your website has been updated with:
echo - Fixed Error Monitor (no more horizontal scrolling)
echo - Enhanced Customer Messaging Access
echo - AI-Powered Blog Content Generator
echo - Complete Features Database (42 features)
echo - SEO Strategy & 20 Recommendations
echo.
echo Next Steps:
echo 1. Run the features migration in Supabase
echo 2. Test the AI Blog Writer in admin panel
echo 3. Verify features page displays correctly
echo 4. Start creating SEO-optimized content!
echo.
echo Visit: https://greenofig.com
echo.
pause
