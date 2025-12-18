-- Fix RLS policies for menu_items table
-- Allow authenticated users (admins) to manage menu items

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access" ON menu_items;
DROP POLICY IF EXISTS "Allow admin insert" ON menu_items;
DROP POLICY IF EXISTS "Allow admin update" ON menu_items;
DROP POLICY IF EXISTS "Allow admin delete" ON menu_items;

-- Enable RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Public can read all menu items (for customer menu)
CREATE POLICY "Allow public read access" ON menu_items
    FOR SELECT
    USING (true);

-- Authenticated users can insert (admin check happens in app)
-- Since we're using the allowlist, we trust authenticated users
CREATE POLICY "Allow authenticated insert" ON menu_items
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Authenticated users can update
CREATE POLICY "Allow authenticated update" ON menu_items
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Authenticated users can delete
CREATE POLICY "Allow authenticated delete" ON menu_items
    FOR DELETE
    TO authenticated
    USING (true);

-- Also allow anon role to read (for public menu)
CREATE POLICY "Allow anon read" ON menu_items
    FOR SELECT
    TO anon
    USING (true);
