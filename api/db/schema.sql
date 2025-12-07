-- ============================================
-- Complete Database Schema for Gourmet Bites
-- Shared between Customer Site & Admin Portal
-- ============================================

-- Users Table (staff, customers, owners)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    display_name VARCHAR(255) NOT NULL,
    google_email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(20) UNIQUE,
    username VARCHAR(100) UNIQUE,
    password_hash TEXT,
    role VARCHAR(50) DEFAULT 'customer',
    permissions JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    image_url TEXT,
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    user_name VARCHAR(255),
    user_phone VARCHAR(20),
    user_email VARCHAR(255),
    items JSONB NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    order_type VARCHAR(50) DEFAULT 'dine-in',
    table_number INTEGER,
    special_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Custom Roles Table (for role management system)
CREATE TABLE IF NOT EXISTS custom_roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6b7280',
    permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_system_role BOOLEAN DEFAULT false,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Indexes for Performance
-- ============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_google_email ON users(google_email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- Menu items indexes
CREATE INDEX IF NOT EXISTS idx_menu_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_available ON menu_items(available);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);

-- Custom roles indexes
CREATE INDEX IF NOT EXISTS idx_custom_roles_name ON custom_roles(name);
CREATE INDEX IF NOT EXISTS idx_custom_roles_system ON custom_roles(is_system_role);

-- ============================================
-- Default Data Inserts
-- ============================================

-- Insert system roles (Owner, Chef, Waiter)
INSERT INTO custom_roles (name, display_name, description, color, permissions, is_system_role)
VALUES 
    ('owner', 'Owner', 'Full access to all features', '#7c3aed', 
     '{"dashboard":{"view":true},"analytics":{"view":true},"reports":{"view":true},"menu":{"view":true,"create":true,"edit":true,"delete":true,"prices":true},"orders":{"view":true,"create":true,"edit":true,"cancel":true,"refund":true},"kitchen":{"view":true,"start":true,"ready":true,"assign":true},"staff":{"view":true,"create":true,"edit":true,"delete":true,"permissions":true},"settings":{"view":true,"edit":true,"hours":true,"payments":true}}'::jsonb, 
     true),
    ('chef', 'Chef', 'Kitchen operations and order management', '#f59e0b', 
     '{"dashboard":{"view":false},"analytics":{"view":false},"reports":{"view":false},"menu":{"view":true,"create":false,"edit":false,"delete":false,"prices":false},"orders":{"view":true,"create":false,"edit":true,"cancel":false,"refund":false},"kitchen":{"view":true,"start":true,"ready":true,"assign":false},"staff":{"view":false,"create":false,"edit":false,"delete":false,"permissions":false},"settings":{"view":false,"edit":false,"hours":false,"payments":false}}'::jsonb, 
     true),
    ('waiter', 'Waiter', 'Customer service and order taking', '#3b82f6', 
     '{"dashboard":{"view":false},"analytics":{"view":false},"reports":{"view":false},"menu":{"view":true,"create":false,"edit":false,"delete":false,"prices":false},"orders":{"view":true,"create":true,"edit":true,"cancel":false,"refund":false},"kitchen":{"view":false,"start":false,"ready":false,"assign":false},"staff":{"view":false,"create":false,"edit":false,"delete":false,"permissions":false},"settings":{"view":false,"edit":false,"hours":false,"payments":false}}'::jsonb, 
     true)
ON CONFLICT (name) DO NOTHING;
