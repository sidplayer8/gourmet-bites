const { sql } = require('@vercel/postgres');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Simple secret check for security
    const { secret } = req.body;
    if (secret !== 'migrate-2024') {
        return res.status(403).json({ error: 'Forbidden: Invalid secret' });
    }

    try {
        console.log('Starting database migration...');

        // Read schema file
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split by semicolons and execute each statement
        const statements = schema
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        let successCount = 0;
        const errors = [];

        for (const statement of statements) {
            try {
                await sql.query(statement);
                successCount++;
            } catch (error) {
                // Some errors are okay (like "table already exists")
                if (!error.message.includes('already exists') &&
                    !error.message.includes('duplicate')) {
                    errors.push({
                        statement: statement.substring(0, 100) + '...',
                        error: error.message
                    });
                }
            }
        }

        console.log(`Migration complete: ${successCount} statements executed`);

        if (errors.length > 0) {
            console.warn('Some errors occurred:', errors);
        }

        return res.status(200).json({
            success: true,
            message: 'Database migration completed successfully',
            statementsExecuted: successCount,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Migration failed:', error);
        return res.status(500).json({
            success: false,
            error: 'Migration failed',
            details: error.message
        });
    }
};
