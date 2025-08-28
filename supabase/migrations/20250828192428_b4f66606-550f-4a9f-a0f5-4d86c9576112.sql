-- Update referral commission rate from 5% to 3%
ALTER TABLE public.referrals 
ALTER COLUMN commission_rate SET DEFAULT 3.00;

-- Update existing referrals that still have the old default rate
UPDATE public.referrals 
SET commission_rate = 3.00 
WHERE commission_rate = 5.00;