-- Fix remaining security issues with correct encryption functions

-- Fix function search path issues with proper pgcrypto functions
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(data text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT encode(pgp_sym_encrypt(data, 'banking_secret_key'), 'base64');
$$;

CREATE OR REPLACE FUNCTION decrypt_sensitive_data(encrypted_data text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT pgp_sym_decrypt(decode(encrypted_data, 'base64'), 'banking_secret_key');
$$;