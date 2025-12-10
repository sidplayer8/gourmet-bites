-- Seed Admin Owner Role
-- Generated automatically from User ID: 5ed4e30e-3ac3-4ca1-857a-e3b7cc711aed

DO $$
DECLARE
  u_id UUID := '5ed4e30e-3ac3-4ca1-857a-e3b7cc711aed';
  r_id UUID;
BEGIN
  SELECT id INTO r_id FROM roles WHERE name = 'Owner';
  
  -- Sync to public.users (Required for FK)
  INSERT INTO public.users (id, email, name)
  VALUES (u_id, 'sapsinfocomm22@gmail.com', 'Admin Owner')
  ON CONFLICT (id) DO NOTHING;

  -- Assign Role
  INSERT INTO staff (user_id, role_id) VALUES (u_id, r_id)
  ON CONFLICT (user_id) DO UPDATE SET role_id = r_id;

  RAISE NOTICE 'Admin Owner Assigned Successfully';
END $$;
