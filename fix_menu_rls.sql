-- UPDATED FIX: Allow both authenticated AND anon users
-- This allows the admin dashboard to work even without Supabase auth session
-- Security is handled by the app-level allowlist

-- Drop existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "public_read_menu" ON menu_items;
    DROP POLICY IF EXISTS "auth_insert_menu" ON menu_items;
    DROP POLICY IF EXISTS "auth_update_menu" ON menu_items;
    DROP POLICY IF EXISTS "auth_delete_menu" ON menu_items;
END $$;

-- Enable RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- 1. Anyone can read menu items
CREATE POLICY "allow_all_read" ON menu_items
    FOR SELECT
    USING (true);

-- 2. Both authenticated AND anon can insert
-- (Admin dashboard uses anon connection with app-level security)
CREATE POLICY "allow_all_insert" ON menu_items
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

-- 3. Both authenticated AND anon can update
CREATE POLICY "allow_all_update" ON menu_items
    FOR UPDATE
    TO authenticated, anon
    USING (true)
    WITH CHECK (true);

-- 4. Both authenticated AND anon can delete
CREATE POLICY "allow_all_delete" ON menu_items
    FOR DELETE
    TO authenticated, anon
    USING (true);

-- Verify
SELECT schemaname, tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE tablename = 'menu_items';
