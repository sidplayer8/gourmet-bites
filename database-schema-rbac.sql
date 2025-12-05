-- Enhanced RBAC Database Schema for Gourmet Bites
-- This schema supports role-based access control with multiple admin types

-- ============================================================================
-- USERS TABLE (Enhanced)
-- ============================================================================
-- Note: This table may already exist. If so, use ALTER TABLE to add missing columns.

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,

    -- Authentication identifiers
    phone_number VARCHAR(20) UNIQUE,
    google_id VARCHAR(255) UNIQUE,
    google_email VARCHAR(255) UNIQUE,

    -- User profile
    display_name VARCHAR(255),
    avatar_url TEXT,

    -- Role and permissions
    role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('owner', 'chef', 'waiter', 'customer')),
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,

    -- Admin metadata
    assigned_by INTEGER REFERENCES users(id),
    created_by VARCHAR(100),
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(google_email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- ============================================================================
-- ORDERS TABLE (Enhanced)
-- ============================================================================

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,

    -- Customer info
    user_id INTEGER REFERENCES users(id),
    user_phone VARCHAR(20),
    user_name VARCHAR(255),

    -- Order details
    items JSONB NOT NULL,
    total DECIMAL(10, 2) NOT NULL,

    -- Order status
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),

    -- Payment
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_intent_id VARCHAR(255),

    -- Delivery/Pickup
    order_type VARCHAR(50) DEFAULT 'dine-in' CHECK (order_type IN ('dine-in', 'takeout', 'delivery')),
    table_number INTEGER,
    delivery_address TEXT,

    -- Special instructions
    special_instructions TEXT,

    -- Staff assignments
    assigned_chef INTEGER REFERENCES users(id),
    assigned_waiter INTEGER REFERENCES users(id),

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    preparing_at TIMESTAMP,
    ready_at TIMESTAMP,
    completed_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for orders table
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_chef ON orders(assigned_chef);
CREATE INDEX IF NOT EXISTS idx_orders_waiter ON orders(assigned_waiter);

-- ============================================================================
-- AUDIT LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,

    -- Who performed the action
    user_id INTEGER REFERENCES users(id),
    user_role VARCHAR(50),
    user_email VARCHAR(255),

    -- What action was performed
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id INTEGER,

    -- Details
    changes JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,

    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for audit_log
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_log(created_at DESC);

-- ============================================================================
-- PERMISSIONS PRESETS
-- ============================================================================

-- Owner permissions (full access)
-- {
--   "menu": {"view": true, "create": true, "edit": true, "delete": true},
--   "orders": {"view": true, "create": true, "edit": true, "delete": true, "assign": true},
--   "users": {"view": true, "create": true, "edit": true, "delete": true},
--   "analytics": {"view": true},
--   "settings": {"view": true, "edit": true}
-- }

-- Chef permissions
-- {
--   "menu": {"view": true, "edit": false},
--   "orders": {"view": true, "edit": true, "assign": false},
--   "users": {"view": false},
--   "analytics": {"view": false}
-- }

-- Waiter permissions
-- {
--   "menu": {"view": true},
--   "orders": {"view": true, "create": true, "edit": true},
--   "users": {"view": false},
--   "analytics": {"view": false}
-- }

-- Customer permissions
-- {
--   "menu": {"view": true},
--   "orders": {"view": true, "create": true}
-- }

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert owner account (you)
-- This will be done via the API or migration script to avoid hardcoding sensitive data

