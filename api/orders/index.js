const { sql } = require('@vercel/postgres');

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            // Get orders (with optional user filter)
            const { user_id, is_admin, setup } = req.query;

            if (setup === 'true') {
                console.log('Running RBAC Migration...');
                await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer'`;
                await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'`;
                await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_by TEXT`;
                await sql`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`;
                return res.status(200).json({ message: 'Migration complete' });
            }

            let result;
            if (is_admin === 'true') {
                // Admin sees all orders
                result = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
            } else if (user_id) {
                // User sees only their orders
                result = await sql`SELECT * FROM orders WHERE user_id = ${user_id} ORDER BY created_at DESC`;
            } else {
                return res.status(400).json({ error: 'user_id or is_admin required' });
            }

            return res.status(200).json(result.rows);

        } else if (req.method === 'POST') {
            // Create new order
            const { user_id, user_phone, items, total, status } = req.body;

            const result = await sql`
        INSERT INTO orders (user_id, user_phone, items, total, status)
        VALUES (${user_id}, ${user_phone || null}, ${JSON.stringify(items)}, ${total}, ${status || 'pending'})
        RETURNING *
      `;

            return res.status(201).json(result.rows[0]);

        } else {
            return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Error with orders:', error);
        return res.status(500).json({ error: 'Database operation failed' });
    }
};
