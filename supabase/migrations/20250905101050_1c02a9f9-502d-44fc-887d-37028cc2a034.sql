-- Fix additional security issues detected by the linter

-- 1. Fix existing functions that don't have secure search_path set
-- Update encrypt_sensitive_data function
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(data text)
 RETURNS text
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT encode(encrypt(data::bytea, 'banking_secret_key', 'aes'), 'base64');
$function$;

-- Update decrypt_sensitive_data function  
CREATE OR REPLACE FUNCTION public.decrypt_sensitive_data(encrypted_data text)
 RETURNS text
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT convert_from(decrypt(decode(encrypted_data, 'base64'), 'banking_secret_key', 'aes'), 'utf8');
$function$;

-- Update mask_sensitive_data function
CREATE OR REPLACE FUNCTION public.mask_sensitive_data(data text)
 RETURNS text
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT CASE 
    WHEN data IS NULL OR length(data) = 0 THEN data
    WHEN length(data) <= 4 THEN '****'
    ELSE substring(data from 1 for 2) || '****' || substring(data from length(data) - 1)
  END;
$function$;

-- Update get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
 RETURNS user_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role FROM public.profiles WHERE id = user_id;
$function$;