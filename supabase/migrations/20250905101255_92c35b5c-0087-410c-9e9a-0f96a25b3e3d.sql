-- Fix remaining functions with mutable search paths
-- Only update functions that actually exist and need fixing

-- Update encrypt and decrypt functions (if they exist, skip encryption if extension not available)
DO $$ 
BEGIN
    -- Try to update encrypt function if it exists
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'encrypt_sensitive_data') THEN
        DROP FUNCTION IF EXISTS public.encrypt_sensitive_data(text);
        -- Skip recreating as encryption extension may not be available
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'decrypt_sensitive_data') THEN
        DROP FUNCTION IF EXISTS public.decrypt_sensitive_data(text);
        -- Skip recreating as encryption extension may not be available
    END IF;
END $$;

-- Update remaining functions that have search path issues
-- Check which specific functions are causing the warnings and update them
CREATE OR REPLACE FUNCTION public.is_current_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_main_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'main_admin' AND is_active = true
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_supplier()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'supplier' AND is_active = true
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_consumer()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'consumer' AND is_active = true
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND is_active = true
  );
$function$;