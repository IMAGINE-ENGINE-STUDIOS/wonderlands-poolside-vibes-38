-- Add sales_rep role to the user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'sales_rep';

-- Update the comment to document the new role
COMMENT ON TYPE user_role IS 'User roles: main_admin (full access), supplier (product management), consumer (purchases), sales_rep (client management)';