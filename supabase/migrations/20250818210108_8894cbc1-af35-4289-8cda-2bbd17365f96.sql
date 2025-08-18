-- Fix the function references to use fully qualified table names

-- Update admin_login function with correct table references
CREATE OR REPLACE FUNCTION public.admin_login(email_param text, password_param text)
 RETURNS TABLE(success boolean, admin_id uuid, admin_email text, admin_role text, session_token text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  admin_record public.admin_users%ROWTYPE;
  token TEXT;
BEGIN
  -- Find admin user
  SELECT * INTO admin_record
  FROM public.admin_users
  WHERE email = email_param AND is_active = true;
  
  -- Check if user exists and password is correct
  IF admin_record.id IS NOT NULL AND public.verify_password(password_param, admin_record.password_hash) THEN
    -- Generate session token
    token := encode(gen_random_bytes(32), 'base64');
    
    -- Update last login
    UPDATE public.admin_users 
    SET updated_at = now() 
    WHERE id = admin_record.id;
    
    -- Store session in admin_sessions table
    INSERT INTO public.admin_sessions (admin_user_id, session_token, expires_at)
    VALUES (admin_record.id, token, now() + interval '24 hours');
    
    RETURN QUERY SELECT 
      true as success,
      admin_record.id as admin_id,
      admin_record.email as admin_email,
      admin_record.role as admin_role,
      token as session_token;
  ELSE
    RETURN QUERY SELECT 
      false as success,
      NULL::UUID as admin_id,
      NULL::TEXT as admin_email,
      NULL::TEXT as admin_role,
      NULL::TEXT as session_token;
  END IF;
END;
$function$;

-- Update validate_admin_session function with correct table references
CREATE OR REPLACE FUNCTION public.validate_admin_session(token text)
 RETURNS TABLE(is_valid boolean, admin_id uuid, admin_email text, admin_role text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  session_record public.admin_sessions%ROWTYPE;
  admin_record public.admin_users%ROWTYPE;
BEGIN
  -- Find active session
  SELECT * INTO session_record
  FROM public.admin_sessions
  WHERE session_token = token 
    AND expires_at > now();
  
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