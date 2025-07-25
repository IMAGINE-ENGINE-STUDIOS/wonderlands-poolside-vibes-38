-- Function to promote an existing user to main admin
CREATE OR REPLACE FUNCTION promote_user_to_main_admin(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Get the user ID from email
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
    
    -- Update the user's profile to main_admin role
    UPDATE public.profiles 
    SET 
        role = 'main_admin',
        is_active = true,
        updated_at = now()
    WHERE id = target_user_id;
    
    -- If profile doesn't exist, create it
    IF NOT FOUND THEN
        INSERT INTO public.profiles (id, email, role, is_active)
        VALUES (target_user_id, user_email, 'main_admin', true);
    END IF;
    
    RETURN TRUE;
END;
$$;

-- Usage: SELECT promote_user_to_main_admin('existing-user@email.com');