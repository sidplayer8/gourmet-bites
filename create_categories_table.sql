-- Quick script to run the categories migration directly in Supabase SQL Editor
-- Run this if npx supabase db push has issues

-- Create categories table for proper category management
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed with existing categories from menu_items
INSERT INTO categories (name, display_order)
SELECT DISTINCT category, 
  ROW_NUMBER() OVER (ORDER BY category) - 1 AS display_order
FROM menu_items
WHERE category IS NOT NULL AND category != ''
ON CONFLICT (name) DO NOTHING;

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "allow_all_read_categories" ON categories;
    DROP POLICY IF EXISTS "allow_all_insert_categories" ON categories;
    DROP POLICY IF EXISTS "allow_all_update_categories" ON categories;
    DROP POLICY IF EXISTS "allow_all_delete_categories" ON categories;
END $$;

-- Public can read categories (for customer menu filters)
CREATE POLICY "allow_all_read_categories" ON categories
    FOR SELECT
    USING (true);

-- Both authenticated AND anon can manage categories
CREATE POLICY "allow_all_insert_categories" ON categories
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

CREATE POLICY "allow_all_update_categories" ON categories
    FOR UPDATE
    TO authenticated, anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "allow_all_delete_categories" ON categories
    FOR DELETE
    TO authenticated, anon
    USING (true);

-- Verify
SELECT 'Categories table created!' as status;
SELECT id, name, display_order FROM categories ORDER BY display_order;
SELECT policyname FROM pg_policies WHERE tablename = 'categories';
