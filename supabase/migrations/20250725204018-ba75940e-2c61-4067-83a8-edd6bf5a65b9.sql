-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('main_admin', 'supplier', 'consumer');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  company_logo_url TEXT,
  role user_role NOT NULL DEFAULT 'consumer',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create supplier_banking_config table
CREATE TABLE public.supplier_banking_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_account_id TEXT,
  bank_account_details JSONB,
  commission_rate DECIMAL(5,2) DEFAULT 10.00, -- Wonderland's commission percentage
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(supplier_id)
);

-- Create consumer_preferences table
CREATE TABLE public.consumer_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  preferred_payment_methods JSONB DEFAULT '[]'::jsonb,
  delivery_address JSONB,
  business_address JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(consumer_id)
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  stripe_session_id TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2),
  supplier_amount DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'pending',
  tracking_number TEXT,
  delivery_address JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add supplier_id to products table if not exists
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Enable RLS on all new tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_banking_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consumer_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create security definer functions for role checking
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION public.is_main_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'main_admin' AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_supplier()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'supplier' AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_consumer()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'consumer' AND is_active = true
  );
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Main admins can view all profiles" ON public.profiles
  FOR SELECT USING (is_main_admin());

CREATE POLICY "Main admins can manage all profiles" ON public.profiles
  FOR ALL USING (is_main_admin());

CREATE POLICY "Public can view supplier profiles for products" ON public.profiles
  FOR SELECT USING (role = 'supplier' AND is_active = true);

-- RLS Policies for supplier_banking_config
CREATE POLICY "Suppliers can manage their own banking config" ON public.supplier_banking_config
  FOR ALL USING (supplier_id = auth.uid());

CREATE POLICY "Main admins can manage all banking configs" ON public.supplier_banking_config
  FOR ALL USING (is_main_admin());

-- RLS Policies for consumer_preferences
CREATE POLICY "Consumers can manage their own preferences" ON public.consumer_preferences
  FOR ALL USING (consumer_id = auth.uid());

CREATE POLICY "Main admins can view all consumer preferences" ON public.consumer_preferences
  FOR SELECT USING (is_main_admin());

-- RLS Policies for orders
CREATE POLICY "Consumers can view their own orders" ON public.orders
  FOR SELECT USING (consumer_id = auth.uid());

CREATE POLICY "Suppliers can view orders for their products" ON public.orders
  FOR SELECT USING (supplier_id = auth.uid());

CREATE POLICY "Main admins can manage all orders" ON public.orders
  FOR ALL USING (is_main_admin());

CREATE POLICY "System can insert orders" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update orders" ON public.orders
  FOR UPDATE USING (true);

-- Update products table RLS to include supplier access
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Public can view active products" ON public.products;

CREATE POLICY "Main admins can manage all products" ON public.products
  FOR ALL USING (is_main_admin());

CREATE POLICY "Suppliers can manage their own products" ON public.products
  FOR ALL USING (supplier_id = auth.uid());

CREATE POLICY "Public can view active products" ON public.products
  FOR SELECT USING (is_active = true AND stock_quantity > 0);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'consumer')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_supplier_banking_config_updated_at
  BEFORE UPDATE ON public.supplier_banking_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consumer_preferences_updated_at
  BEFORE UPDATE ON public.consumer_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();