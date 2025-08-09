-- Create new super admin user with specified credentials
INSERT INTO public.admin_users (
  email,
  password_hash,
  role,
  is_active
) VALUES (
  'info@startupfactoryhub.com',
  '$2b$10$K8BOwvQX8PQJ6tFYZGOiU.5r1L0Z8Y9BwV3xY4fNjXqL8E6vKQl5u',
  'super_admin',
  true
) ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = now();