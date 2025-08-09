-- First, let's create a proper admin users table with secure password hashing
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for admin users table
CREATE POLICY "Admin users can view their own data" 
ON public.admin_users 
FOR SELECT 
USING (auth.uid()::text = id::text);

-- Create function to hash passwords securely
CREATE OR REPLACE FUNCTION public.hash_password(password TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Use pgcrypto extension for secure password hashing
  RETURN crypt(password, gen_salt('bf', 12));
END;
$$;

-- Create function to verify passwords
CREATE OR REPLACE FUNCTION public.verify_password(password TEXT, hash TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN hash = crypt(password, hash);
END;
$$;

-- Create secure admin login function
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
    SET last_login = now() 
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

-- Create admin sessions table for secure session management
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

-- Create the default admin user with secure password
INSERT INTO public.admin_users (email, password_hash, role)
VALUES (
  'admin@wonderlands.com',
  public.hash_password('WonderlandsAdmin2024!'),
  'main_admin'
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = public.hash_password('WonderlandsAdmin2024!'),
  updated_at = now();

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();