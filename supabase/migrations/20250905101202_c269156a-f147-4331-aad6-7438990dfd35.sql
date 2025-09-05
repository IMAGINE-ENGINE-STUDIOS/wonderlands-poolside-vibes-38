-- Fix remaining security issues (skip encryption functions as they depend on extensions not available)

-- Update mask_sensitive_data function with proper search_path
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

-- Update get_user_role function with proper search_path
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
 RETURNS user_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role FROM public.profiles WHERE id = user_id;
$function$;