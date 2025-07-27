-- Fix remaining security definer functions search paths
ALTER FUNCTION public.is_admin_user() SET search_path = '';
ALTER FUNCTION public.get_user_role(uuid) SET search_path = '';
ALTER FUNCTION public.is_main_admin() SET search_path = '';
ALTER FUNCTION public.is_supplier() SET search_path = '';
ALTER FUNCTION public.is_consumer() SET search_path = '';
ALTER FUNCTION public.verify_admin_password(text, text) SET search_path = '';
ALTER FUNCTION public.cleanup_expired_sessions() SET search_path = '';
ALTER FUNCTION public.log_admin_action(uuid, text, text, text, jsonb) SET search_path = '';
ALTER FUNCTION public.promote_user_to_main_admin(text) SET search_path = '';
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';