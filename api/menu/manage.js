const { sql } = require('@vercel/postgres');

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { method, body } = req;

    try {
        if (method === 'POST') {
            // Add new item
            const { name, description, price, category, image, allergens } = body;
            const result = await sql`
        INSERT INTO menu_items (name, description, price, category, image, allergens, options)
        VALUES (${name}, ${description}, ${price}, ${category}, ${image}, ${allergens || []}, ARRAY[]::TEXT[])
        RETURNING *
      `;
            return res.status(201).json(result.rows[0]);

        } else if (method === 'PUT') {
            // Update item
            const { id, name, description, price, category, image, allergens } = body;
            const result = await sql`
        UPDATE menu_items 
        SET name = ${name}, description = ${description}, price = ${price}, 
            category = ${category}, image = ${image}, allergens = ${allergens || []}
        WHERE id = ${id}
        RETURNING *
      `;
            return res.status(200).json(result.rows[0]);

        } else if (method === 'DELETE') {
            // Delete item
            const { id } = body;
            await sql`DELETE FROM menu_items WHERE id = ${id}`;
            return res.status(200).json({ message: 'Item deleted successfully' });

        } else {
            return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Error managing menu items:', error);
        return res.status(500).json({ error: 'Database operation failed' });
    }
};
