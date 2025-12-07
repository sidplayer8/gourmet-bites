const { sql } = require('@vercel/postgres');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { secret } = req.body;
    if (secret !== 'init-2024') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    try {
        // Check if owner already exists
        const existing = await sql`SELECT id FROM users WHERE username = 'owner'`;

        if (existing.rows.length > 0) {
            return res.status(200).json({
                success: true,
                message: 'Owner account already exists',
                userId: existing.rows[0].id
            });
        }

        // Create owner account
        // Note: In production, use bcrypt to hash passwords!
        const result = await sql`
            INSERT INTO users (display_name, username, password_hash, role, is_active, permissions)
            VALUES (
                'Restaurant Owner',
                'owner',
                'test',
                'owner',
                true,
                '{}'::jsonb
            )
            RETURNING id, username, display_name, role
        `;

        return res.status(200).json({
            success: true,
            message: 'Owner account created successfully',
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Init error:', error);
        return res.status(500).json({
            error: 'Failed to initialize user',
            details: error.message
        });
    }
};
