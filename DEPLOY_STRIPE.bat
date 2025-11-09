@echo off
REM =====================================================
REM STRIPE DEPLOYMENT SCRIPT
REM =====================================================

echo.
echo ========================================
echo   DEPLOYING STRIPE INTEGRATION
echo ========================================
echo.

cd "C:\Users\ADMIN\OneDrive\Desktop\GreeonFig Rocet code\greenofigwebsite"

REM Step 1: Set Stripe Secret Key in Supabase
echo [1/3] Setting Stripe Secret Key...
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_51SHrlbPPAckGFnuThXJQldkGspIwv1pcsisOFUxtUxkxEoouu1cUz9na5G09LdcE55XdkGmbJlSbTnGgJaitSN1m00MUoe01Pr
if errorlevel 1 (
    echo ERROR: Failed to set Stripe secret key
    pause
    exit /b 1
)
echo Success!
echo.

REM Step 2: Deploy create-checkout-session Edge Function
echo [2/3] Deploying create-checkout-session Edge Function...
npx supabase functions deploy create-checkout-session
if errorlevel 1 (
    echo ERROR: Failed to deploy create-checkout-session
    pause
    exit /b 1
)
echo Success!
echo.

REM Step 3: Deploy stripe-webhook Edge Function
echo [3/3] Deploying stripe-webhook Edge Function...
npx supabase functions deploy stripe-webhook
if errorlevel 1 (
    echo ERROR: Failed to deploy stripe-webhook
    pause
    exit /b 1
)
echo Success!
echo.

echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Go to Supabase SQL Editor
echo 2. Run the SQL in: supabase\migrations\add_stripe_configuration.sql
echo 3. Configure webhook in Stripe Dashboard
echo 4. Test the integration!
echo.
pause
