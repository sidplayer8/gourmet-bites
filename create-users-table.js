const { sql } = require('@vercel/postgres');
const fs = require('fs');

async function createUsersTable() {
    try {
        console.log('📦 Creating users table...');

        // Read and execute schema
        const schema = fs.readFileSync('schema_users.sql', 'utf8');

        // Split by semicolon and execute each statement
        const statements = schema.split(';').filter(s => s.trim());

        for (const statement of statements) {
            if (statement.trim()) {
                await sql.query(statement);
                console.log('✅ Executed:', statement.substring(0, 50) + '...');
            }
        }

        console.log('✅ Users table created successfully!');

        // Verify it exists
        const result = await sql`SELECT table_name FROM information_schema.tables WHERE table_name = 'users'`;
        console.log('Verification:', result.rows);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createUsersTable();
