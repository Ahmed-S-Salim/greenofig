# =====================================================
# STRIPE DEPLOYMENT SCRIPT (PowerShell)
# =====================================================

Write-Host ""
Write-Host "========================================"
Write-Host "  DEPLOYING STRIPE INTEGRATION"
Write-Host "========================================"
Write-Host ""

Set-Location "C:\Users\ADMIN\OneDrive\Desktop\GreeonFig Rocet code\greenofigwebsite"

# Step 1: Set Stripe Secret Key in Supabase
Write-Host "[1/3] Setting Stripe Secret Key..." -ForegroundColor Cyan
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_51SHrlbPPAckGFnuThXJQldkGspIwv1pcsisOFUxtUxkxEoouu1cUz9na5G09LdcE55XdkGmbJlSbTnGgJaitSN1m00MUoe01Pr
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to set Stripe secret key" -ForegroundColor Red
    pause
    exit 1
}
Write-Host "Success!" -ForegroundColor Green
Write-Host ""

# Step 2: Deploy create-checkout-session Edge Function
Write-Host "[2/3] Deploying create-checkout-session Edge Function..." -ForegroundColor Cyan
npx supabase functions deploy create-checkout-session
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to deploy create-checkout-session" -ForegroundColor Red
    pause
    exit 1
}
Write-Host "Success!" -ForegroundColor Green
Write-Host ""

# Step 3: Deploy stripe-webhook Edge Function
Write-Host "[3/3] Deploying stripe-webhook Edge Function..." -ForegroundColor Cyan
npx supabase functions deploy stripe-webhook
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to deploy stripe-webhook" -ForegroundColor Red
    pause
    exit 1
}
Write-Host "Success!" -ForegroundColor Green
Write-Host ""

Write-Host "========================================"
Write-Host "  DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Go to Supabase SQL Editor"
Write-Host "2. Run the SQL in: supabase\migrations\add_stripe_configuration.sql"
Write-Host "3. Configure webhook in Stripe Dashboard"
Write-Host "4. Test the integration!"
Write-Host ""
pause
