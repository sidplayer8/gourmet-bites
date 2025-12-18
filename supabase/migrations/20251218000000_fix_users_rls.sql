-- Fix RLS policies for users table to allow user registration
-- Run this in Supabase SQL Editor

-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Enable all for users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Enable RLS (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow anyone to INSERT (for registration)
CREATE POLICY "Allow user registration" ON users
FOR INSERT
WITH CHECK (true);

-- Allow anyone to SELECT (for login lookup)
CREATE POLICY "Allow user lookup" ON users
FOR SELECT
USING (true);

-- Allow anyone to UPDATE (for profile updates)
CREATE POLICY "Allow user updates" ON users
FOR UPDATE
USING (true)
WITH CHECK (true);
