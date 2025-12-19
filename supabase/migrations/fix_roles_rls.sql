-- Fix RLS policies to allow role management for authenticated users temporarily
-- This assumes you're logged in to the admin dashboard

-- Drop the restrictive temp policy
DROP POLICY IF EXISTS "Authenticated users can manage roles temp" ON roles;

-- Create a more permissive policy for now (we'll restrict later based on permissions)
CREATE POLICY "Admin users can manage roles"
    ON roles FOR ALL
    USING (
        -- Allow if user is authenticated (for now)
        -- TODO: Restrict to users with MANAGE_ROLES permission once staff auth is set up
        auth.uid() IS NOT NULL
    )
    WITH CHECK (
        auth.uid() IS NOT NULL
    );
