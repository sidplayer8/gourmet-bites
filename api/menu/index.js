const { sql } = require('@vercel/postgres');

module.exports = async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('x-version', 'debug-timestamp-' + Date.now());

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const result = await sql`SELECT * FROM menu_items ORDER BY category, name`;
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching menu:', error);
        return res.status(500).json({ error: 'Failed to fetch menu items' });
    }
};
