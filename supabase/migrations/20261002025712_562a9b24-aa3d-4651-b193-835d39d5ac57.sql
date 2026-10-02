REVOKE EXECUTE ON FUNCTION public.promote_user_to_main_admin(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_login(text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.verify_admin_password(text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_admin_session(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_promote_first_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_proposal_count_cache() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_new_client_automation() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_future_expires() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_job_view_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_expired_sessions() FROM PUBLIC, anon, authenticated;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname='public' AND viewname='consolidated_products') THEN
    EXECUTE 'ALTER VIEW public.consolidated_products SET (security_invoker = true)';
  END IF;
END $$;
ALTER FUNCTION public.update_referrals_updated_at() SET search_path = public;
ALTER FUNCTION public.update_seo_updated_at_column() SET search_path = public;