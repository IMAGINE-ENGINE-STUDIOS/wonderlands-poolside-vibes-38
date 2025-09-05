
-- 1) Ensure the profiles table uses automatic profile creation for each new auth user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END
$$;

-- 2) Enable Row Level Security (idempotent)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3) Add safe RLS policies if missing
DO $$
BEGIN
  -- Users can SELECT their own profile; main admin can select all
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can select own profile'
  ) THEN
    CREATE POLICY "Users can select own profile"
      ON public.profiles
      FOR SELECT
      USING (auth.uid() = id OR public.is_main_admin());
  END IF;

  -- Users can UPDATE their own profile; main admin can update all
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON public.profiles
      FOR UPDATE
      USING (auth.uid() = id OR public.is_main_admin())
      WITH CHECK (auth.uid() = id OR public.is_main_admin());
  END IF;

  -- Admins can INSERT profiles (normally created by trigger)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Admins can insert profiles'
  ) THEN
    CREATE POLICY "Admins can insert profiles"
      ON public.profiles
      FOR INSERT
      WITH CHECK (public.is_main_admin());
  END IF;

  -- Admins can DELETE profiles
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Admins can delete profiles'
  ) THEN
    CREATE POLICY "Admins can delete profiles"
      ON public.profiles
      FOR DELETE
      USING (public.is_main_admin());
  END IF;
END
$$;
