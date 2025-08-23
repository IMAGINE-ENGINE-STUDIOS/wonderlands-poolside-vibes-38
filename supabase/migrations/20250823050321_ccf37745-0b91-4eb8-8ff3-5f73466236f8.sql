-- Fix database structure for proper product and order storage
-- Create a proper orders table with string-based product identifiers

-- First, let's check if we need to modify the existing orders table
-- The current orders table has UUID fields but we're getting string-based product IDs

-- Create a product_orders table that can handle string-based IDs properly
CREATE TABLE IF NOT EXISTS public.product_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Product information (can handle both UUID and string IDs)
    product_identifier TEXT NOT NULL, -- This can store "pool_Jamaica", "cart_checkout", etc.
    product_name TEXT NOT NULL,
    product_category TEXT,
    product_type TEXT, -- 'pool', 'spa', 'cart', etc.
    
    -- Order details
    base_price NUMERIC NOT NULL DEFAULT 0,
    extras_data JSONB DEFAULT '[]'::jsonb, -- Store cart extras as JSON
    total_amount NUMERIC NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 1,
    
    -- Payment information
    stripe_session_id TEXT,
    payment_status TEXT DEFAULT 'pending'::text,
    
    -- Customer information for guest orders
    customer_email TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    delivery_address JSONB,
    
    -- Metadata
    order_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on the new table
ALTER TABLE public.product_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own orders" ON public.product_orders
    FOR SELECT USING (
        user_id = auth.uid() OR 
        (user_id IS NULL AND customer_email = auth.email())
    );

CREATE POLICY "Users can create orders" ON public.product_orders
    FOR INSERT WITH CHECK (
        user_id = auth.uid() OR user_id IS NULL
    );

CREATE POLICY "System can update orders" ON public.product_orders
    FOR UPDATE USING (true);

CREATE POLICY "Admins can manage all orders" ON public.product_orders
    FOR ALL USING (is_main_admin());

-- Create indexes for better performance
CREATE INDEX idx_product_orders_user_id ON public.product_orders(user_id);
CREATE INDEX idx_product_orders_product_identifier ON public.product_orders(product_identifier);
CREATE INDEX idx_product_orders_stripe_session_id ON public.product_orders(stripe_session_id);
CREATE INDEX idx_product_orders_created_at ON public.product_orders(created_at);
CREATE INDEX idx_product_orders_payment_status ON public.product_orders(payment_status);

-- Add trigger for updated_at
CREATE TRIGGER update_product_orders_updated_at
    BEFORE UPDATE ON public.product_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create a user_preferences table to store user cart and preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Cart data (for persistent cart across sessions)
    cart_data JSONB DEFAULT '[]'::jsonb,
    
    -- User preferences
    preferred_payment_method TEXT,
    delivery_preferences JSONB DEFAULT '{}'::jsonb,
    notification_preferences JSONB DEFAULT '{}'::jsonb,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own preferences" ON public.user_preferences
    FOR ALL USING (user_id = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);