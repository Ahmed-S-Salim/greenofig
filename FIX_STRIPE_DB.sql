-- Quick fix: Insert Stripe publishable key
-- Run this in Supabase SQL Editor

-- Create table if needed
CREATE TABLE IF NOT EXISTS payment_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Stripe key
INSERT INTO payment_settings (provider, public_key, is_active)
VALUES ('stripe', 'pk_test_51SHrlbPPAckGFnuTvYujWq9sz4oO2cpWTlSRURA62g3MDIcqSx8wBV65fL5hP7hmaWylbAlY8CjZl5yirP27JzKg00OkbSgYy8', true)
ON CONFLICT (provider)
DO UPDATE SET
  public_key = EXCLUDED.public_key,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Verify it was inserted
SELECT provider, LEFT(public_key, 20) as key_preview, is_active
FROM payment_settings
WHERE provider = 'stripe';
