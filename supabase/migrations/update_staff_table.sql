-- Add phone number and auth_user_id columns to staff table
ALTER TABLE staff 
    ADD COLUMN IF NOT EXISTS phone TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_staff_phone ON staff(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_staff_auth_user ON staff(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role_id);

-- Update existing RLS policies

-- Drop old policies
DROP POLICY IF EXISTS "Staff can view all staff" ON staff;
DROP POLICY IF EXISTS "Admin can manage staff" ON staff;

-- Policy: Users with VIEW_STAFF permission can view staff
CREATE POLICY "Users with VIEW_STAFF can view staff"
    ON staff FOR SELECT
    USING (
        auth.uid() IN (
            SELECT auth_user_id 
            FROM staff 
            WHERE role_id IN (
                SELECT id FROM roles WHERE (permissions & 256) = 256  -- 256 = VIEW_STAFF
            )
        )
    );

-- Policy: Users with CREATE_STAFF permission can insert staff
CREATE POLICY "Users with CREATE_STAFF can insert staff"
    ON staff FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT auth_user_id 
            FROM staff 
            WHERE role_id IN (
                SELECT id FROM roles WHERE (permissions & 512) = 512  -- 512 = CREATE_STAFF
            )
        )
    );

-- Policy: Users with EDIT_STAFF permission can update staff
CREATE POLICY "Users with EDIT_STAFF can update staff"
    ON staff FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT auth_user_id 
            FROM staff 
            WHERE role_id IN (
                SELECT id FROM roles WHERE (permissions & 1024) = 1024  -- 1024 = EDIT_STAFF
            )
        )
    );

-- Policy: Users with DELETE_STAFF permission can delete staff
CREATE POLICY "Users with DELETE_STAFF can delete staff"
    ON staff FOR DELETE
    USING (
        auth.uid() IN (
            SELECT auth_user_id 
            FROM staff 
            WHERE role_id IN (
                SELECT id FROM roles WHERE (permissions & 2048) = 2048  -- 2048 = DELETE_STAFF
            )
        )
    );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_staff_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS staff_updated_at ON staff;
CREATE TRIGGER staff_updated_at
    BEFORE UPDATE ON staff
    FOR EACH ROW
    EXECUTE FUNCTION update_staff_updated_at();

COMMENT ON COLUMN staff.phone IS 'Phone number for SMS authentication (optional, can be linked with email)';
COMMENT ON COLUMN staff.auth_user_id IS 'Reference to Supabase auth.users table for authentication';
