
-- MEGA FIX: Consolidated Schema, Roles, and RLS
-- Combines: Roles Schema, Admin Seed, Orders Fix, and RLS Permissions

-- ==========================================
-- 1. ROLES & STAFF SCHEMA (from roles_schema.sql)
-- ==========================================
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  permissions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id), -- Changed to reference auth.users for safety, or public.users if syncing
  role_id UUID REFERENCES roles(id),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure staff has contact info columns
ALTER TABLE staff ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE staff ALTER COLUMN user_id DROP NOT NULL;

-- ==========================================
-- 2. RESTAURANT TABLES (New Feature Prep)
-- ==========================================
CREATE TABLE IF NOT EXISTS restaurant_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number INT UNIQUE NOT NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'taken', 'reserved')),
  current_order_id UUID,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. ORDERS SCHEMA FIXES
-- ==========================================
ALTER TABLE orders ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'takeaway';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS table_id UUID REFERENCES restaurant_tables(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS custom_notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_price numeric;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS items jsonb;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status text default 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS table_number text;

-- Ensure total is nullable (Legacy fix)
ALTER TABLE orders ALTER COLUMN total DROP NOT NULL;

-- ==========================================
-- 4. SEED DATA (Roles & Admin)
-- ==========================================
INSERT INTO roles (name, permissions) VALUES 
('Owner', '{"all": true}'),
('Chef', '{"can_view_orders": true, "can_update_status": true}'),
('Waiter', '{"can_view_tables": true}')
ON CONFLICT (name) DO NOTHING;

/* 
DO $$
DECLARE
  u_id UUID := '5ed4e30e-3ac3-4ca1-857a-e3b7cc711aed'; -- The Admin User ID
  r_id UUID;
BEGIN
  -- Attempt to sync to public.users if it exists
  -- INSERT INTO public.users (id, email, name) VALUES (u_id, 'sapsinfocomm22@gmail.com', 'Admin Owner') ON CONFLICT (id) DO NOTHING;
  
  SELECT id INTO r_id FROM roles WHERE name = 'Owner';
  IF r_id IS NOT NULL THEN
      INSERT INTO staff (user_id, role_id, email) VALUES (u_id, r_id, 'sapsinfocomm22@gmail.com')
      ON CONFLICT DO NOTHING; -- staff doesn't have unique constraint on user_id by default in first schema, but usually good practice
  END IF;
END $$;
*/

-- ==========================================
-- 5. RLS POLICIES (The Critical Fix)
-- ==========================================
-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Reset Orders Policies
DROP POLICY IF EXISTS "Allow public insert orders" ON orders;
DROP POLICY IF EXISTS "Allow public update orders" ON orders;
DROP POLICY IF EXISTS "Enable all for all" ON orders;

-- Create Permissive Policy for Orders (Fixes "Done" Button)
CREATE POLICY "Enable all for all" ON orders 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Simple Read Policies for other tables
DROP POLICY IF EXISTS "Public read roles" ON roles;
CREATE POLICY "Public read roles" ON roles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read tables" ON restaurant_tables;
CREATE POLICY "Public read tables" ON restaurant_tables FOR SELECT USING (true);
