const { sql } = require('@vercel/postgres');

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        // Find user by username
        const result = await sql`
            SELECT id, username, password, display_name, role, permissions, is_active
            FROM users
            WHERE username = ${username}
            AND is_active = true
        `;

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const user = result.rows[0];

        // Simple password comparison (in production, use bcrypt)
        if (user.password !== password) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Update last login
        await sql`
            UPDATE users
            SET last_login = CURRENT_TIMESTAMP
            WHERE id = ${user.id}
        `;

        // Return user data (excluding password)
        return res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                display_name: user.display_name,
                role: user.role,
                permissions: user.permissions
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            error: 'Login failed',
            details: error.message
        });
    }
};
