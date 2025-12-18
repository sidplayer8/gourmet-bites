-- Verify users table exists and has correct structure
-- Run this in Supabase SQL Editor to check

SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Check if there are any users already
SELECT id, email, phone, name, created_at 
FROM users 
LIMIT 5;

-- Check RLS policies on users table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users';
