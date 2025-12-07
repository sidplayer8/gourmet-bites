const { sql } = require('@vercel/postgres');

async function migrateRolesTable() {
    console.log('🔄 Starting roles table migration...');

    try {
        // Create custom_roles table
        await sql`
            CREATE TABLE IF NOT EXISTS custom_roles (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) UNIQUE NOT NULL,
                display_name VARCHAR(100) NOT NULL,
                description TEXT,
                color VARCHAR(20) DEFAULT '#6b7280',
                permissions JSONB NOT NULL DEFAULT '{}',
                is_system_role BOOLEAN DEFAULT FALSE,
                created_by INTEGER REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        console.log('✅ Created custom_roles table');

        // Insert system roles with default permissions
        await sql`
            INSERT INTO custom_roles (name, display_name, color, permissions, is_system_role) 
            VALUES 
            ('owner', 'Owner', '#7c3aed', '{"dashboard":{"view":true},"analytics":{"view":true},"reports":{"view":true},"menu":{"view":true,"create":true,"edit":true,"delete":true,"prices":true},"orders":{"view":true,"create":true,"edit":true,"cancel":true,"refund":true},"kitchen":{"view":true,"start":true,"ready":true,"assign":true},"staff":{"view":true,"create":true,"edit":true,"delete":true,"permissions":true},"settings":{"view":true,"edit":true,"hours":true,"payments":true}}'::jsonb, true),
            ('chef', 'Chef', '#f59e0b', '{"dashboard":{"view":false},"analytics":{"view":false},"reports":{"view":false},"menu":{"view":true,"create":false,"edit":false,"delete":false,"prices":false},"orders":{"view":true,"create":false,"edit":true,"cancel":false,"refund":false},"kitchen":{"view":true,"start":true,"ready":true,"assign":false},"staff":{"view":false,"create":false,"edit":false,"delete":false,"permissions":false},"settings":{"view":false,"edit":false,"hours":false,"payments":false}}'::jsonb, true),
            ('waiter', 'Waiter', '#3b82f6', '{"dashboard":{"view":false},"analytics":{"view":false},"reports":{"view":false},"menu":{"view":true,"create":false,"edit":false,"delete":false,"prices":false},"orders":{"view":true,"create":true,"edit":true,"cancel":false,"refund":false},"kitchen":{"view":false,"start":false,"ready":false,"assign":false},"staff":{"view":false,"create":false,"edit":false,"delete":false,"permissions":false},"settings":{"view":false,"edit":false,"hours":false,"payments":false}}'::jsonb, true)
            ON CONFLICT (name) DO NOTHING
        `;
        console.log('✅ Inserted system roles (owner, chef, waiter)');

        // Create indexes for faster lookups
        await sql`CREATE INDEX IF NOT EXISTS idx_custom_roles_name ON custom_roles(name)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_custom_roles_is_system ON custom_roles(is_system_role)`;
        console.log('✅ Created indexes');

        console.log('✨ Migration completed successfully!');
        console.log('\nNext steps:');
        console.log('1. Deploy to Vercel');
        console.log('2. Navigate to Dashboard → Roles tab');
        console.log('3. Create your first custom role!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

// Run migration
migrateRolesTable()
    .then(() => {
        console.log('\n✅ Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Migration error:', error);
        process.exit(1);
    });
