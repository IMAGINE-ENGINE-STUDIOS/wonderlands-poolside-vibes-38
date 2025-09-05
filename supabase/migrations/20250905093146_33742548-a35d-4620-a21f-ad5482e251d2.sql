-- Create and update user accounts with proper credentials
-- Note: In production, you'd use proper password hashing. For demo purposes, we'll set up working accounts.

DO $$
DECLARE
    admin_user_id UUID;
    supplier_user_id UUID;
    installer_user_id UUID;
    consumer_user_id UUID;
BEGIN
    -- Clean up any existing demo accounts first
    DELETE FROM auth.users WHERE email IN (
        'supplier.demo@wonderlands.app',
        'contractor.demo@wonderlands.app', 
        'admin@wonderland.com',
        'admin@wonderlandspools.com'
    );

    -- 1. Create/Update Main Admin (rikicot@hotmail.com)
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'rikicot@hotmail.com',
        crypt('MainAdmin!2025', gen_salt('bf')),
        now(),
        now(),
        now(),
        '',
        '',
        '',
        ''
    ) ON CONFLICT (email) DO UPDATE SET
        encrypted_password = crypt('MainAdmin!2025', gen_salt('bf')),
        email_confirmed_at = now(),
        updated_at = now()
    RETURNING id INTO admin_user_id;

    -- Get the user ID if it was updated instead of inserted
    IF admin_user_id IS NULL THEN
        SELECT id INTO admin_user_id FROM auth.users WHERE email = 'rikicot@hotmail.com';
    END IF;

    -- Insert/Update profile for main admin
    INSERT INTO public.profiles (id, email, first_name, last_name, role, is_active)
    VALUES (admin_user_id, 'rikicot@hotmail.com', 'Ricardo', 'Talavera', 'main_admin', true)
    ON CONFLICT (id) DO UPDATE SET
        role = 'main_admin',
        is_active = true,
        first_name = 'Ricardo',
        last_name = 'Talavera',
        updated_at = now();

    -- 2. Create Supplier Account
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'supplier@wonderlands.app',
        crypt('Supplier!2025', gen_salt('bf')),
        now(),
        now(),
        now(),
        '',
        '',
        '',
        ''
    ) ON CONFLICT (email) DO UPDATE SET
        encrypted_password = crypt('Supplier!2025', gen_salt('bf')),
        email_confirmed_at = now(),
        updated_at = now()
    RETURNING id INTO supplier_user_id;

    IF supplier_user_id IS NULL THEN
        SELECT id INTO supplier_user_id FROM auth.users WHERE email = 'supplier@wonderlands.app';
    END IF;

    INSERT INTO public.profiles (id, email, first_name, last_name, company_name, role, is_active)
    VALUES (supplier_user_id, 'supplier@wonderlands.app', 'Demo', 'Supplier', 'Wonderlands Supply Co.', 'supplier', true)
    ON CONFLICT (id) DO UPDATE SET
        role = 'supplier',
        is_active = true,
        company_name = 'Wonderlands Supply Co.',
        updated_at = now();

    -- 3. Create Installer Account  
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'installer@wonderlands.app',
        crypt('Installer!2025', gen_salt('bf')),
        now(),
        now(),
        now(),
        '',
        '',
        '',
        ''
    ) ON CONFLICT (email) DO UPDATE SET
        encrypted_password = crypt('Installer!2025', gen_salt('bf')),
        email_confirmed_at = now(),
        updated_at = now()
    RETURNING id INTO installer_user_id;

    IF installer_user_id IS NULL THEN
        SELECT id INTO installer_user_id FROM auth.users WHERE email = 'installer@wonderlands.app';
    END IF;

    INSERT INTO public.profiles (id, email, first_name, last_name, company_name, role, is_active)
    VALUES (installer_user_id, 'installer@wonderlands.app', 'Demo', 'Installer', 'Wonderlands Installation Inc.', 'installer', true)
    ON CONFLICT (id) DO UPDATE SET
        role = 'installer',
        is_active = true,
        company_name = 'Wonderlands Installation Inc.',
        updated_at = now();

    -- 4. Create Consumer Account
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'consumer@wonderlands.app',
        crypt('Consumer!2025', gen_salt('bf')),
        now(),
        now(),
        now(),
        '',
        '',
        '',
        ''
    ) ON CONFLICT (email) DO UPDATE SET
        encrypted_password = crypt('Consumer!2025', gen_salt('bf')),
        email_confirmed_at = now(),
        updated_at = now()
    RETURNING id INTO consumer_user_id;

    IF consumer_user_id IS NULL THEN
        SELECT id INTO consumer_user_id FROM auth.users WHERE email = 'consumer@wonderlands.app';
    END IF;

    INSERT INTO public.profiles (id, email, first_name, last_name, role, is_active)
    VALUES (consumer_user_id, 'consumer@wonderlands.app', 'Demo', 'Consumer', 'consumer', true)
    ON CONFLICT (id) DO UPDATE SET
        role = 'consumer',
        is_active = true,
        updated_at = now();

END
$$;