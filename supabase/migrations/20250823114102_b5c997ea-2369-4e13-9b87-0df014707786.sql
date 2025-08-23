-- Comprehensive Security Fix Migration
-- Fix all critical security vulnerabilities identified in security scan

-- 1. Fix function search_path issues - set proper search_path for all security definer functions
CREATE OR REPLACE FUNCTION public.get_installer_profile_safe(installer_uuid uuid)
 RETURNS json
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    result JSON;
BEGIN
    -- Only allow users to view their own profile or public data
    IF auth.uid() = installer_uuid OR is_main_admin() THEN
        SELECT json_build_object(
            'profile', row_to_json(ip.*),
            'licenses', COALESCE(
                (SELECT json_agg(row_to_json(il.*))
                 FROM public.installer_licenses il
                 WHERE il.installer_id = installer_uuid), '[]'::json
            ),
            'service_areas', COALESCE(
                (SELECT json_agg(
                    json_build_object(
                        'area', row_to_json(isa.*),
                        'location', row_to_json(fl.*)
                    )
                )
                 FROM public.installer_service_areas isa
                 JOIN public.florida_locations fl ON fl.id = isa.location_id
                 WHERE isa.installer_id = installer_uuid), '[]'::json
            )
        ) INTO result
        FROM public.installer_profiles ip
        WHERE ip.installer_id = installer_uuid;
    ELSE
        -- Return only public information for other users
        SELECT json_build_object(
            'profile', json_build_object(
                'company_name', ip.company_name,
                'service_radius', ip.service_radius,
                'rating', ip.rating,
                'total_reviews', ip.total_reviews
            ),
            'licenses', COALESCE(
                (SELECT json_agg(json_build_object(
                    'license_type', il.license_type,
                    'is_verified', il.is_verified
                ))
                 FROM public.installer_licenses il
                 WHERE il.installer_id = installer_uuid AND il.is_verified = true), '[]'::json
            ),
            'service_areas', COALESCE(
                (SELECT json_agg(
                    json_build_object(
                        'location', json_build_object(
                            'city', fl.city,
                            'county', fl.county,
                            'region', fl.region
                        )
                    )
                )
                 FROM public.installer_service_areas isa
                 JOIN public.florida_locations fl ON fl.id = isa.location_id
                 WHERE isa.installer_id = installer_uuid), '[]'::json
            )
        ) INTO result
        FROM public.installer_profiles ip
        WHERE ip.installer_id = installer_uuid;
    END IF;
    
    RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.hash_sensitive_data(data text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT encode(digest(data, 'sha256'), 'hex');
$$;

-- 2. Restrict RLS policies on api_configurations - remove public access
DROP POLICY IF EXISTS "Admins can manage API configurations" ON public.api_configurations;
CREATE POLICY "Only main admins can manage API configurations"
ON public.api_configurations
FOR ALL
TO authenticated
USING (is_main_admin())
WITH CHECK (is_main_admin());

-- 3. Strengthen RLS on admin_users - ensure no public access
DROP POLICY IF EXISTS "Admin users can manage other users" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can view admin data" ON public.admin_users;

CREATE POLICY "Only current admin can view own data"
ON public.admin_users
FOR SELECT
TO authenticated
USING (id = auth.uid() AND is_current_admin());

CREATE POLICY "Only main admin can manage other admins"
ON public.admin_users
FOR ALL
TO authenticated
USING (is_main_admin())
WITH CHECK (is_main_admin());

-- 4. Strengthen RLS on supplier_banking_config
DROP POLICY IF EXISTS "Main admins can manage all banking configs" ON public.supplier_banking_config;
DROP POLICY IF EXISTS "Suppliers can manage their own banking config" ON public.supplier_banking_config;

CREATE POLICY "Suppliers can only access own banking config"
ON public.supplier_banking_config
FOR ALL
TO authenticated
USING (supplier_id = auth.uid())
WITH CHECK (supplier_id = auth.uid());

CREATE POLICY "Main admins can manage all banking configs"
ON public.supplier_banking_config
FOR ALL
TO authenticated
USING (is_main_admin())
WITH CHECK (is_main_admin());

-- 5. Strengthen RLS on product_orders - remove system update policy
DROP POLICY IF EXISTS "System can update orders" ON public.product_orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.product_orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.product_orders;

CREATE POLICY "Users can only view own orders"
ON public.product_orders
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR (user_id IS NULL AND customer_email = auth.email()));

CREATE POLICY "Authenticated users can create orders"
ON public.product_orders
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Only order owners can update their orders"
ON public.product_orders
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR is_main_admin())
WITH CHECK (user_id = auth.uid() OR is_main_admin());

-- 6. Strengthen RLS on user_quotations
DROP POLICY IF EXISTS "Users can view their own quotations" ON public.user_quotations;
DROP POLICY IF EXISTS "Users can update their own quotations" ON public.user_quotations;
DROP POLICY IF EXISTS "Authenticated users can create their own quotations" ON public.user_quotations;

CREATE POLICY "Users can only access own quotations"
ON public.user_quotations
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Main admins can manage all quotations"
ON public.user_quotations
FOR ALL
TO authenticated
USING (is_main_admin())
WITH CHECK (is_main_admin());

-- 7. Enhance admin audit log security
DROP POLICY IF EXISTS "Super admins can view audit logs" ON public.admin_audit_log;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.admin_audit_log;

CREATE POLICY "Only main admins can view audit logs"
ON public.admin_audit_log
FOR SELECT
TO authenticated
USING (is_main_admin());

CREATE POLICY "Only authenticated system can log actions"
ON public.admin_audit_log
FOR INSERT
TO authenticated
WITH CHECK (admin_user_id IS NOT NULL);

-- 8. Add data masking function for sensitive fields
CREATE OR REPLACE FUNCTION public.mask_sensitive_data(data text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT CASE 
    WHEN data IS NULL OR length(data) = 0 THEN data
    WHEN length(data) <= 4 THEN '****'
    ELSE substring(data from 1 for 2) || '****' || substring(data from length(data) - 1)
  END;
$$;

-- 9. Create secure function to check admin permissions with proper search path
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

-- 10. Add table-level security enhancement
ALTER TABLE public.api_configurations FORCE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users FORCE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_banking_config FORCE ROW LEVEL SECURITY;
ALTER TABLE public.product_orders FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_quotations FORCE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log FORCE ROW LEVEL SECURITY;

-- 11. Create function to validate admin session with enhanced security
CREATE OR REPLACE FUNCTION public.validate_admin_session(token text)
 RETURNS TABLE(is_valid boolean, admin_id uuid, admin_email text, admin_role text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  session_record public.admin_sessions%ROWTYPE;
  admin_record public.admin_users%ROWTYPE;
BEGIN
  -- Find active session with time validation
  SELECT * INTO session_record
  FROM public.admin_sessions
  WHERE session_token = token 
    AND expires_at > now()
    AND created_at > now() - interval '4 hours'; -- Force 4 hour max session
  
  IF session_record.id IS NOT NULL THEN
    -- Get admin user data
    SELECT * INTO admin_record
    FROM public.admin_users
    WHERE id = session_record.admin_user_id AND is_active = true;
    
    IF admin_record.id IS NOT NULL THEN
      RETURN QUERY SELECT 
        true as is_valid,
        admin_record.id as admin_id,
        admin_record.email as admin_email,
        admin_record.role as admin_role;
    ELSE
      RETURN QUERY SELECT 
        false as is_valid,
        NULL::UUID as admin_id,
        NULL::TEXT as admin_email,
        NULL::TEXT as admin_role;
    END IF;
  ELSE
    RETURN QUERY SELECT 
      false as is_valid,
      NULL::UUID as admin_id,
      NULL::TEXT as admin_email,
      NULL::TEXT as admin_role;
  END IF;
END;
$function$;