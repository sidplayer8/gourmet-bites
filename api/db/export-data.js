const { sql } = require('@vercel/postgres');

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Export all data from current database
        const users = await sql`SELECT * FROM users`;
        const menuItems = await sql`SELECT * FROM menu_items`;
        const orders = await sql`SELECT * FROM orders ORDER BY created_at DESC LIMIT 100`;
        const roles = await sql`SELECT * FROM custom_roles`;

        return res.status(200).json({
            success: true,
            data: {
                users: users.rows,
                menu_items: menuItems.rows,
                orders: orders.rows,
                custom_roles: roles.rows
            },
            counts: {
                users: users.rows.length,
                menu_items: menuItems.rows.length,
                orders: orders.rows.length,
                roles: roles.rows.length
            }
        });
    } catch (error) {
        console.error('Export error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to export data',
            details: error.message
        });
    }
};
