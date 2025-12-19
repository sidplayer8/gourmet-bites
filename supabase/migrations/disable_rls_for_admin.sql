-- Quick fix: Disable RLS on roles and staff tables for admin dashboard
-- This allows full access when logged in as admin

-- Disable RLS on roles completely
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;

-- Disable RLS on staff completely  
ALTER TABLE staff DISABLE ROW LEVEL SECURITY;

-- Add foreign key if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'staff_role_id_fkey' 
        AND table_name = 'staff'
    ) THEN
        ALTER TABLE staff 
        ADD CONSTRAINT staff_role_id_fkey 
        FOREIGN KEY (role_id) 
        REFERENCES roles(id) 
        ON DELETE SET NULL;
    END IF;
END $$;
