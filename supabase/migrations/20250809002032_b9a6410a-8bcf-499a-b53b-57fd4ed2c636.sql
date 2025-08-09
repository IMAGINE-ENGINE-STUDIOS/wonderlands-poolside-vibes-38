-- Fix the admin sessions table first, then the admin login function
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES public.admin_users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS on sessions
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy for admin sessions
CREATE POLICY "Users can access their own sessions" 
ON public.admin_sessions 
FOR ALL
USING (admin_id = auth.uid());

-- Update the admin login function
CREATE OR REPLACE FUNCTION public.admin_login(email_param TEXT, password_param TEXT)
RETURNS TABLE(
  success BOOLEAN,
  admin_id UUID,
  admin_email TEXT,
  admin_role TEXT,
  session_token TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_record admin_users%ROWTYPE;
  token TEXT;
BEGIN
  -- Find admin user
  SELECT * INTO admin_record
  FROM public.admin_users
  WHERE email = email_param AND is_active = true;
  
  -- Check if user exists and password is correct
  IF admin_record.id IS NOT NULL AND verify_password(password_param, admin_record.password_hash) THEN
    -- Generate session token
    token := encode(gen_random_bytes(32), 'base64');
    
    -- Update last login
    UPDATE public.admin_users 
    SET updated_at = now() 
    WHERE id = admin_record.id;
    
    -- Store session in admin_sessions table
    INSERT INTO public.admin_sessions (admin_id, session_token, expires_at)
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
$$;

-- Function to validate admin session
CREATE OR REPLACE FUNCTION public.validate_admin_session(token TEXT)
RETURNS TABLE(
  is_valid BOOLEAN,
  admin_id UUID,
  admin_email TEXT,
  admin_role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record admin_sessions%ROWTYPE;
  admin_record admin_users%ROWTYPE;
BEGIN
  -- Find active session
  SELECT * INTO session_record
  FROM public.admin_sessions
  WHERE session_token = token 
    AND is_active = true 
    AND expires_at > now();
  
  IF session_record.id IS NOT NULL THEN
    -- Get admin user data
    SELECT * INTO admin_record
    FROM public.admin_users
    WHERE id = session_record.admin_id AND is_active = true;
    
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
$$;