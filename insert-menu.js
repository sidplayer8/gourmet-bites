require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');
const fs = require('fs');

async function insertMenuData() {
    try {
        console.log('📤 Inserting menu items...');

        const insertSQL = fs.readFileSync('./insert_menu.sql', 'utf8');
        await sql.query(insertSQL);

        console.log('✅ Successfully inserted 17 menu items!');

        // Verify
        const result = await sql`SELECT COUNT(*) as count FROM menu_items`;
        console.log(`✅ Total menu items in database: ${result.rows[0].count}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

insertMenuData();
