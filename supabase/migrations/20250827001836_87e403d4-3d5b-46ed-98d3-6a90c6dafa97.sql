
-- Promote rikicot@hotmail.com to main_admin role
UPDATE public.profiles 
SET 
    role = 'main_admin',
    is_active = true,
    updated_at = now()
WHERE email = 'rikicot@hotmail.com';

-- If the profile doesn't exist, create it as main_admin
INSERT INTO public.profiles (id, email, role, is_active, first_name, last_name)
SELECT 
    au.id,
    au.email,
    'main_admin'::user_role,
    true,
    'Riki',
    'Cot'
FROM auth.users au
WHERE au.email = 'rikicot@hotmail.com'
AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'rikicot@hotmail.com');
