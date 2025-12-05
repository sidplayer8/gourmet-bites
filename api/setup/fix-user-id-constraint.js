const { sql } = require('@vercel/postgres');

module.exports = async function handler(req, res) {
    // Security: Only allow in development or with special token
    const authToken = req.headers['x-migration-token'];
    if (process.env.NODE_ENV === 'production' && authToken !== process.env.MIGRATION_TOKEN) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        console.log('Fixing user_id constraint to allow NULL for guest orders...');

        // Make user_id nullable in orders table
        await sql`
            ALTER TABLE orders
            ALTER COLUMN user_id DROP NOT NULL
        `;

        console.log('✅ user_id constraint updated - now allows NULL values');

        return res.status(200).json({
            success: true,
            message: 'user_id constraint fixed - guest orders now supported',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Migration error:', error);
        return res.status(500).json({
            error: 'Migration failed',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
