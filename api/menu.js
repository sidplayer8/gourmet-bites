const { sql } = require('@vercel/postgres');

module.exports = async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('x-version', 'debug-timestamp-' + Date.now());

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { method, body } = req;

        // GET - Fetch all menu items
        if (method === 'GET') {
            const result = await sql`SELECT * FROM menu_items ORDER BY category, name`;
            return res.status(200).json(result.rows);
        }

        // POST - Create new menu item
        if (method === 'POST') {
            const { name, description, price, category, image_url, available = true } = body;
            const result = await sql`
                INSERT INTO menu_items (name, description, price, category, image_url, available)
                VALUES (${name}, ${description}, ${price}, ${category}, ${image_url || null}, ${available})
                RETURNING *
            `;
            return res.status(201).json(result.rows[0]);
        }

        // PUT - Update menu item
        if (method === 'PUT') {
            const { id, name, description, price, category, image_url, available } = body;
            const result = await sql`
                UPDATE menu_items
                SET name = ${name}, 
                    description = ${description}, 
                    price = ${price},
                    category = ${category}, 
                    image_url = ${image_url || null}, 
                    available = ${available !== undefined ? available : true},
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ${id}
                RETURNING *
            `;
            return res.status(200).json(result.rows[0]);
        }

        // DELETE - Remove menu item
        if (method === 'DELETE') {
            const { id } = body;
            await sql`DELETE FROM menu_items WHERE id = ${id}`;
            return res.status(200).json({ success: true, message: 'Item deleted successfully' });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Menu API error:', error);
        return res.status(500).json({ error: 'Database operation failed', details: error.message });
    }
};
