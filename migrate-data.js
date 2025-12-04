require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://xrcfvfnryassnbmbwtgi.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyY2Z2Zm5yeWFzc25ibWJ3dGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMyNzM5MTcsImV4cCI6MjA0ODg0OTkxN30.6mwcVUzWVU6LnrTBqhVCTdkqPbJW1BbfTRfKHqQxM9M'
);

async function migrateData() {
    try {
        console.log('📥 Fetching menu items from Supabase...');
        const { data: menuItems, error } = await supabase
            .from('menu_items')
            .select('*');

        if (error) throw error;

        console.log(`✅ Found ${menuItems.length} menu items`);

        console.log('📤 Importing to Vercel Postgres...');
        for (const item of menuItems) {
            await sql`
        INSERT INTO menu_items (name, description, price, category, image, allergens, options)
        VALUES (
          ${item.name},
          ${item.description},
          ${item.price},
          ${item.category},
          ${item.image},
          ${item.allergens || []},
          ${item.options || []}
        )
      `;
        }

        console.log(`✅ Successfully migrated ${menuItems.length} menu items!`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error migrating data:', error);
        process.exit(1);
    }
}

migrateData();
