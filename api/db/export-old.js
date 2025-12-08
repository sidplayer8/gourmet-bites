const { neon } = require('@neondatabase/serverless');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { secret } = req.body;
    if (secret !== 'export-old-2024') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    try {
        // Connect to OLD database
        const oldDbUrl = 'postgresql://neondb_owner:npg_CXgNY4i1emqR@ep-shiny-hall-a1nocftd-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
        const sql = neon(oldDbUrl);

        console.log('Connecting to old database...');

        // Export all data
        const menuItems = await sql`SELECT * FROM menu_items ORDER BY id`;
        const users = await sql`SELECT * FROM users ORDER BY id`;
        const orders = await sql`SELECT * FROM orders ORDER BY created_at DESC LIMIT 200`;

        // Try to get roles if table exists
        let roles = [];
        try {
            roles = await sql`SELECT * FROM custom_roles`;
        } catch (e) {
            console.log('No custom_roles table in old DB');
        }

        console.log(`Exported ${menuItems.length} menu items, ${users.length} users, ${orders.length} orders`);

        return res.status(200).json({
            success: true,
            data: {
                menu_items: menuItems,
                users: users,
                orders: orders,
                custom_roles: roles
            },
            counts: {
                menu_items: menuItems.length,
                users: users.length,
                orders: orders.length,
                roles: roles.length
            }
        });

    } catch (error) {
        console.error('Export error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to export from old database',
            details: error.message
        });
    }
};
