const { sql } = require('@vercel/postgres');

module.exports = async function handler(req, res) {
    try {
        const result = await sql`SELECT 1 as test`;
        res.status(200).json({ success: true, result: result.rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
