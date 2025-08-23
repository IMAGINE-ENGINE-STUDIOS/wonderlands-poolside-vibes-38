-- Fix remaining security linter warnings

-- Fix function search path issues
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(data text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT encode(encrypt(data::bytea, 'banking_secret_key', 'aes'), 'base64');
$$;

CREATE OR REPLACE FUNCTION decrypt_sensitive_data(encrypted_data text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT convert_from(decrypt(decode(encrypted_data, 'base64'), 'banking_secret_key', 'aes'), 'utf8');
$$;

-- Fix Auth OTP expiry to 10 minutes (recommended)
ALTER TABLE auth.users 
ALTER COLUMN confirmation_sent_at 
SET DEFAULT (now() - interval '10 minutes');