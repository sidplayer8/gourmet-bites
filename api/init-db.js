const { sql } = require('@vercel/postgres');

module.exports = async function handler(req, res) {
    try {
        console.log('Initializing Database...');

        // Create users table if not exists
        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                phone_number TEXT UNIQUE,
                google_email TEXT UNIQUE,
                google_id TEXT UNIQUE,
                display_name TEXT NOT NULL,
                avatar_url TEXT,
                role TEXT DEFAULT 'customer',
                permissions JSONB DEFAULT '{}',
                assigned_by TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                last_login TIMESTAMP DEFAULT NOW()
            )
        `;

        // Create indexes
        await sql`CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(google_email)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`;

        // Ensure columns exist (idempotent)
        try { await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer'`; } catch (e) { }
        try { await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'`; } catch (e) { }
        try { await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_by TEXT`; } catch (e) { }

        res.status(200).json({ success: true, message: 'Database initialized successfully' });
    } catch (error) {
        console.error('Init DB Error:', error);
        res.status(500).json({ error: error.message });
    }
};
