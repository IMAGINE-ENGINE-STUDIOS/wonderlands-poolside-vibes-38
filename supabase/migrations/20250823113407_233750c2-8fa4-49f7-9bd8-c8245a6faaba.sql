-- Simplified encryption approach without pgcrypto advanced functions

-- Remove the complex encryption functions for now and add simple data protection
DROP FUNCTION IF EXISTS encrypt_sensitive_data(text);
DROP FUNCTION IF EXISTS decrypt_sensitive_data(text);

-- Add a simple function to hash sensitive data (one-way for security)
CREATE OR REPLACE FUNCTION hash_sensitive_data(data text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT encode(digest(data, 'sha256'), 'hex');
$$;

-- Update the admin session cleanup to run more frequently
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Clean up sessions older than expiry time
    DELETE FROM public.admin_sessions 
    WHERE expires_at < now();
    
    -- Also clean up sessions older than 4 hours regardless of expiry
    DELETE FROM public.admin_sessions 
    WHERE created_at < now() - interval '4 hours';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$function$;