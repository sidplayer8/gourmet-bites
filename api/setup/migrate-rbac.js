const { sql } = require('@vercel/postgres');

module.exports = async function handler(req, res) {
    // Security: Only allow in development or with special token
    const authToken = req.headers['x-migration-token'];
    if (process.env.NODE_ENV === 'production' && authToken !== process.env.MIGRATION_TOKEN) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        console.log('Starting RBAC migration...');

        // 1. Add new columns to users table if they don't exist
        await sql`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
            ADD COLUMN IF NOT EXISTS assigned_by INTEGER,
            ADD COLUMN IF NOT EXISTS created_by VARCHAR(100),
            ADD COLUMN IF NOT EXISTS notes TEXT,
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `;
        console.log('✅ Updated users table structure');

        // 2. Update existing orders table
        await sql`
            ALTER TABLE orders
            ADD COLUMN IF NOT EXISTS user_name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending',
            ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255),
            ADD COLUMN IF NOT EXISTS order_type VARCHAR(50) DEFAULT 'dine-in',
            ADD COLUMN IF NOT EXISTS table_number INTEGER,
            ADD COLUMN IF NOT EXISTS delivery_address TEXT,
            ADD COLUMN IF NOT EXISTS special_instructions TEXT,
            ADD COLUMN IF NOT EXISTS assigned_chef INTEGER,
            ADD COLUMN IF NOT EXISTS assigned_waiter INTEGER,
            ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP,
            ADD COLUMN IF NOT EXISTS preparing_at TIMESTAMP,
            ADD COLUMN IF NOT EXISTS ready_at TIMESTAMP,
            ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP,
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `;
        console.log('✅ Updated orders table structure');

        // 3. Create audit_log table
        await sql`
            CREATE TABLE IF NOT EXISTS audit_log (
                id SERIAL PRIMARY KEY,
                user_id INTEGER,
                user_role VARCHAR(50),
                user_email VARCHAR(255),
                action VARCHAR(100) NOT NULL,
                resource_type VARCHAR(50) NOT NULL,
                resource_id INTEGER,
                changes JSONB,
                ip_address VARCHAR(45),
                user_agent TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        console.log('✅ Created audit_log table');

        // 4. Create indexes for performance
        await sql`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_orders_chef ON orders(assigned_chef)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_orders_waiter ON orders(assigned_waiter)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_log(user_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_log(created_at DESC)`;
        console.log('✅ Created indexes');

        // 5. Update existing users to have default permissions based on role
        const ownerPermissions = {
            menu: { view: true, create: true, edit: true, delete: true },
            orders: { view: true, create: true, edit: true, delete: true, assign: true },
            users: { view: true, create: true, edit: true, delete: true },
            analytics: { view: true },
            settings: { view: true, edit: true }
        };

        const chefPermissions = {
            menu: { view: true },
            orders: { view: true, edit: true },
            users: { view: false },
            analytics: { view: false }
        };

        const waiterPermissions = {
            menu: { view: true },
            orders: { view: true, create: true, edit: true },
            users: { view: false },
            analytics: { view: false }
        };

        const customerPermissions = {
            menu: { view: true },
            orders: { view: true, create: true }
        };

        await sql`
            UPDATE users
            SET permissions = CASE
                WHEN role = 'owner' THEN ${JSON.stringify(ownerPermissions)}::jsonb
                WHEN role = 'chef' THEN ${JSON.stringify(chefPermissions)}::jsonb
                WHEN role = 'waiter' THEN ${JSON.stringify(waiterPermissions)}::jsonb
                ELSE ${JSON.stringify(customerPermissions)}::jsonb
            END
            WHERE permissions IS NULL OR permissions = '{}'::jsonb
        `;
        console.log('✅ Updated user permissions');

        return res.status(200).json({
            success: true,
            message: 'RBAC migration completed successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Migration error:', error);
        return res.status(500).json({
            error: 'Migration failed',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
