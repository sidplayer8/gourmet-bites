require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');
const fs = require('fs');

async function setupDatabase() {
    try {
        console.log('Creating database schema...');

        const schema = fs.readFileSync('./schema.sql', 'utf8');
        await sql.query(schema);

        console.log('✅ Database schema created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating schema:', error);
        process.exit(1);
    }
}

setupDatabase();
