-- Function to automatically promote the first user to main_admin role
CREATE OR REPLACE FUNCTION public.auto_promote_first_user()
RETURNS TRIGGER AS $$
DECLARE
    profile_count INTEGER;
BEGIN
    -- Count existing profiles
    SELECT COUNT(*) INTO profile_count FROM public.profiles;
    
    -- If this is the first profile, make them main_admin
    IF profile_count = 0 THEN
        NEW.role = 'main_admin';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-promote first user
DROP TRIGGER IF EXISTS auto_promote_first_user_trigger ON public.profiles;
CREATE TRIGGER auto_promote_first_user_trigger
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_promote_first_user();