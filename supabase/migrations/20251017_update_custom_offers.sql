-- Add missing columns to custom_offers table
ALTER TABLE custom_offers
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS payment_plan_type TEXT DEFAULT 'full',
ADD COLUMN IF NOT EXISTS number_of_payments INTEGER,
ADD COLUMN IF NOT EXISTS payment_frequency TEXT;

-- Add comment to explain payment_plan_type
COMMENT ON COLUMN custom_offers.payment_plan_type IS 'Payment plan type: full, split_payment, installment, pay_as_you_go';
COMMENT ON COLUMN custom_offers.payment_frequency IS 'Payment frequency: weekly, biweekly, monthly';
