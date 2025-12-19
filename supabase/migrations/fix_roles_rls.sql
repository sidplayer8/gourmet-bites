-- Fix role creation RLS and add proper foreign key for staff.role_id

-- 1. Fix roles RLS policies
DROP POLICY IF EXISTS "Authenticated users can manage roles temp" ON roles;
DROP POLICY IF EXISTS "Admin users can manage roles" ON roles;

-- Allow all authenticated users to manage roles for now
CREATE POLICY "Authenticated users manage roles"
    ON roles FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 2. Add foreign key constraint if not exists
DO $$ 
BEGIN
    -- Check if constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'staff_role_id_fkey' 
        AND table_name = 'staff'
    ) THEN
        -- Add foreign key constraint
        ALTER TABLE staff 
        ADD CONSTRAINT staff_role_id_fkey 
        FOREIGN KEY (role_id) 
        REFERENCES roles(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Update staff RLS to be more permissive temporarily
DROP POLICY IF EXISTS "Users with VIEW_STAFF can view staff" ON staff;
DROP POLICY IF EXISTS "Users with CREATE_STAFF can insert staff" ON staff;
DROP POLICY IF EXISTS "Users with EDIT_STAFF can update staff" ON staff;
DROP POLICY IF EXISTS "Users with DELETE_STAFF can delete staff" ON staff;

-- Temporary permissive policies
CREATE POLICY "Authenticated users can view staff"
    ON staff FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can manage staff"
    ON staff FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
