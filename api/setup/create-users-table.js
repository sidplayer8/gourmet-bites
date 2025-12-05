import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('Creating users table...');

        // Create table
        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                phone_number TEXT UNIQUE,
                google_email TEXT UNIQUE,
                google_id TEXT UNIQUE,
                display_name TEXT NOT NULL,
                avatar_url TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                last_login TIMESTAMP DEFAULT NOW()
            )
        `;

        // Create indexes
        await sql`CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(google_email)`;

        // Verify table exists
        const check = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name = 'users'
        `;

        res.status(200).json({
            success: true,
            message: 'Users table created successfully',
            tableExists: check.rows.length > 0
        });

    } catch (error) {
        console.error('Error creating table:', error);
        res.status(500).json({
            error: error.message,
            code: error.code
        });
    }
}
