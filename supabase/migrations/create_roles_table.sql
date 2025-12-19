-- Drop existing roles table if needed (be careful with this in production!)
DROP TABLE IF EXISTS roles CASCADE;

-- Create roles table with bitwise permissions
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    permissions BIGINT NOT NULL DEFAULT 0, -- Bitwise permission flags
    color TEXT DEFAULT '#99AAB5', -- Role color for UI (hex code)
    position INTEGER DEFAULT 0, -- Role hierarchy (higher = more powerful)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default roles with calculated permissions
-- Owner: All permissions (all bits set)
-- Manager: Most permissions except ADMINISTRATOR
-- Staff: Basic view permissions only

INSERT INTO roles (name, permissions, color, position) VALUES
    ('Owner', 9223372036854775807, '#FF0000', 100),  -- Max bigint value (all permissions)
    ('Manager', 1073217535, '#FFA500', 50),          -- All except ADMINISTRATOR bit
    ('Staff', 66833, '#00FF00', 10);                 -- VIEW_MENU, VIEW_CATEGORIES, VIEW_ORDERS, VIEW_TABLES, VIEW_ANALYTICS

-- Enable Row Level Security
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Policy: Only users with MANAGE_ROLES permission can manage roles
CREATE POLICY "Users with permission can manage roles"
    ON roles FOR ALL
    USING (
        auth.uid() IN (
            SELECT auth_user_id 
            FROM staff 
            WHERE role_id IN (
                SELECT id FROM roles WHERE (permissions & 32768) = 32768  -- 32768 = MANAGE_ROLES bit
            )
        )
    );

-- Policy: All authenticated users can view roles
CREATE POLICY "Authenticated users can view roles"
    ON roles FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Create index for better performance
CREATE INDEX idx_roles_position ON roles(position DESC);

COMMENT ON TABLE roles IS 'Staff roles with Discord-style bitwise permissions';
COMMENT ON COLUMN roles.permissions IS 'Bitwise flags: 1=VIEW_MENU, 2=CREATE_MENU, 4=EDIT_MENU, 8=DELETE_MENU, 16=VIEW_CATEGORIES, 32=CREATE_CATEGORIES, 64=EDIT_CATEGORIES, 128=DELETE_CATEGORIES, 256=VIEW_STAFF, 512=CREATE_STAFF, 1024=EDIT_STAFF, 2048=DELETE_STAFF, 4096=VIEW_ORDERS, 8192=UPDATE_ORDERS, 16384=DELETE_ORDERS, 32768=MANAGE_ROLES, 65536=VIEW_TABLES, 131072=MANAGE_TABLES, 262144=VIEW_ANALYTICS, 1073741824=ADMINISTRATOR';
