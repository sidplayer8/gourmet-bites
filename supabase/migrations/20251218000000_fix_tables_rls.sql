-- Fix RLS Policy for restaurant_tables to allow INSERT
-- This allows the admin to create tables through the UI

-- Drop existing policies
DROP POLICY IF EXISTS "Public read tables" ON restaurant_tables;
DROP POLICY IF EXISTS "Enable insert for all" ON restaurant_tables;
DROP POLICY IF EXISTS "Enable update for all" ON restaurant_tables;

-- Enable RLS
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;

-- Allow all operations (simpler approach for admin dashboard)
CREATE POLICY "Enable all for restaurant_tables" ON restaurant_tables
FOR ALL
USING (true)
WITH CHECK (true);
