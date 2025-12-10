-- ROBUST Admin Setup Script
-- Run this AFTER you create the user in Supabase Authentication

DO $$
DECLARE
  target_email TEXT := 'sapsinfocomm22@gmail.com';
  auth_id UUID;
  role_id UUID;
BEGIN
  -- 1. Get the Auth ID (The user MUST be created in Authentication tab first)
  SELECT id INTO auth_id FROM auth.users WHERE email = target_email;
  
  -- 2. Validate
  IF auth_id IS NULL THEN
    RAISE EXCEPTION 'User % not found in Authentication! Go to Supabase > Authentication > Users and click "Add User" first.', target_email;
  END IF;

  -- 3. Ensure the user exists in public.users (Required for Foreign Key)
  -- This fixes the issue where "users" table might be empty
  INSERT INTO public.users (id, email, name)
  VALUES (auth_id, target_email, 'Admin Owner')
  ON CONFLICT (id) DO NOTHING;

  -- 4. Get Owner Role ID
  SELECT id INTO role_id FROM roles WHERE name = 'Owner';
  IF role_id IS NULL THEN
    RAISE EXCEPTION 'Role "Owner" not found. Did you run 20241210_roles_schema.sql?';
  END IF;

  -- 5. Assign Role
  INSERT INTO staff (user_id, role_id, status) 
  VALUES (auth_id, role_id, 'active')
  ON CONFLICT (user_id) DO UPDATE SET role_id = role_id, status = 'active';

  RAISE NOTICE 'SUCCESS! % is now an Owner.', target_email;
END $$;
