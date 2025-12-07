-- Role Management System - Database Schema
-- Creates custom_roles table for dynamic role management

CREATE TABLE IF NOT EXISTS custom_roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(20) DEFAULT '#6b7280',
    permissions JSONB NOT NULL DEFAULT '{}',
    is_system_role BOOLEAN DEFAULT FALSE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert system roles with default permissions
INSERT INTO custom_roles (name, display_name, color, permissions, is_system_role) 
VALUES 
('owner', 'Owner', '#7c3aed', '{"dashboard":{"view":true},"analytics":{"view":true},"menu":{"view":true,"create":true,"edit":true,"delete":true},"orders":{"view":true,"create":true,"edit":true,"cancel":true},"kitchen":{"view":true,"start":true,"ready":true},"staff":{"view":true,"create":true,"edit":true,"delete":true},"settings":{"view":true,"edit":true}}'::jsonb, true),
('chef', 'Chef', '#f59e0b', '{"menu":{"view":true},"orders":{"view":true,"edit":true},"kitchen":{"view":true,"start":true,"ready":true}}'::jsonb, true),
('waiter', 'Waiter', '#3b82f6', '{"menu":{"view":true},"orders":{"view":true,"create":true,"edit":true}}'::jsonb, true)
ON CONFLICT (name) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_custom_roles_name ON custom_roles(name);
CREATE INDEX IF NOT EXISTS idx_custom_roles_is_system ON custom_roles(is_system_role);
