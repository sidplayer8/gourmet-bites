-- Migration: Roles, Staff, and Restaurant Tables

-- 1. Create Roles Table (for Custom Permissions)
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL, -- e.g., 'Owner', 'Chef', 'Waiter', 'Senior Waiter'
  permissions JSONB DEFAULT '{}'::jsonb, -- e.g., {"can_edit_menu": true, "can_view_orders": true}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Staff Table (Linking Users to Roles)
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id), -- Link to existing users table
  role_id UUID REFERENCES roles(id),
  status TEXT DEFAULT 'active', -- 'active', 'inactive'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Restaurant Tables (for Dine-In/Waiter View)
CREATE TABLE IF NOT EXISTS restaurant_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number INT UNIQUE NOT NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'taken', 'reserved')),
  current_order_id UUID, -- Link to active order if taken
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Update Orders Table (to support Dine-In details)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'takeaway' CHECK (type IN ('dine_in', 'takeaway'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS table_id UUID REFERENCES restaurant_tables(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS custom_notes TEXT; -- Global notes for the order

-- 5. Seed Default Roles
INSERT INTO roles (name, permissions) VALUES 
('Owner', '{"all": true}'),
('Chef', '{"can_view_orders": true, "can_update_status": true, "can_view_details": true}'),
('Waiter', '{"can_view_tables": true, "can_update_tables": true, "can_receive_calls": true}')
ON CONFLICT (name) DO NOTHING;

-- 6. Setup RLS (Security)
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users (simplified for now)
DROP POLICY IF EXISTS "Public read roles" ON roles;
CREATE POLICY "Public read roles" ON roles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read tables" ON restaurant_tables;
CREATE POLICY "Public read tables" ON restaurant_tables FOR SELECT USING (true);
