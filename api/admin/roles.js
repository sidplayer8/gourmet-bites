const { sql } = require('@vercel/postgres');

module.exports = async (req, res) => {
    const { method, headers } = req;
    const userId = headers['x-user-id'];

    // Authentication check
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Check if user is owner (only owners can manage roles)
        const userResult = await sql`SELECT role FROM users WHERE id = ${userId}`;
        if (userResult.rows.length === 0 || userResult.rows[0].role !== 'owner') {
            return res.status(403).json({ error: 'Forbidden: Only owners can manage roles' });
        }

        // Auto-create custom_roles table if it doesn't exist (one-time migration)
        await ensureRolesTableExists();

        switch (method) {
            case 'GET':
                return await getRoles(req, res);
            case 'POST':
                return await createRole(req, res, userId);
            case 'PUT':
                return await updateRole(req, res, userId);
            case 'DELETE':
                return await deleteRole(req, res);
            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                return res.status(405).json({ error: `Method ${method} not allowed` });
        }
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
};

// Auto-create custom_roles table if it doesn't exist
async function ensureRolesTableExists() {
    try {
        // Directly create table (idempotent with IF NOT EXISTS)
        await sql`
            CREATE TABLE IF NOT EXISTS custom_roles (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                display_name VARCHAR(255) NOT NULL,
                description TEXT,
                color VARCHAR(7) DEFAULT '#6b7280',
                permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
                is_system_role BOOLEAN DEFAULT false,
                created_by INTEGER REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Create indexes (idempotent with IF NOT EXISTS)
        await sql`CREATE INDEX IF NOT EXISTS idx_custom_roles_name ON custom_roles(name)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_custom_roles_system ON custom_roles(is_system_role)`;

        // Insert system roles (idempotent with ON CONFLICT)
        await sql`
            INSERT INTO custom_roles (name, display_name, description, color, permissions, is_system_role)
            VALUES 
                ('owner', 'Owner', 'Full access to all features', '#7c3aed', 
                 '{"dashboard":{"view":true},"analytics":{"view":true},"reports":{"view":true},"menu":{"view":true,"create":true,"edit":true,"delete":true,"prices":true},"orders":{"view":true,"create":true,"edit":true,"cancel":true,"refund":true},"kitchen":{"view":true,"start":true,"ready":true,"assign":true},"staff":{"view":true,"create":true,"edit":true,"delete":true,"permissions":true},"settings":{"view":true,"edit":true,"hours":true,"payments":true}}'::jsonb, 
                 true),
                ('chef', 'Chef', 'Kitchen operations and order management', '#f59e0b', 
                 '{"dashboard":{"view":false},"analytics":{"view":false},"reports":{"view":false},"menu":{"view":true,"create":false,"edit":false,"delete":false,"prices":false},"orders":{"view":true,"create":false,"edit":true,"cancel":false,"refund":false},"kitchen":{"view":true,"start":true,"ready":true,"assign":false},"staff":{"view":false,"create":false,"edit":false,"delete":false,"permissions":false},"settings":{"view":false,"edit":false,"hours":false,"payments":false}}'::jsonb, 
                 true),
                ('waiter', 'Waiter', 'Customer service and order taking', '#3b82f6', 
                 '{"dashboard":{"view":false},"analytics":{"view":false},"reports":{"view":false},"menu":{"view":true,"create":false,"edit":false,"delete":false,"prices":false},"orders":{"view":true,"create":true,"edit":true,"cancel":false,"refund":false},"kitchen":{"view":false,"start":false,"ready":false,"assign":false},"staff":{"view":false,"create":false,"edit":false,"delete":false,"permissions":false},"settings":{"view":false,"edit":false,"hours":false,"payments":false}}'::jsonb, 
                 true)
            ON CONFLICT (name) DO NOTHING
        `;

        console.log('✅ custom_roles table setup complete');
    } catch (error) {
        console.error('Table setup error:', error.message);
        // Don't throw - let the calling function handle it
    }
};

// GET - List all roles (system + custom)
async function getRoles(req, res) {
    try {
        const result = await sql`
            SELECT id, name, display_name, description, color, permissions, is_system_role, created_at
            FROM custom_roles
            ORDER BY is_system_role DESC, name ASC
        `;

        return res.status(200).json({
            success: true,
            roles: result.rows
        });
    } catch (error) {
        throw error;
    }
}

// POST - Create new custom role
async function createRole(req, res, userId) {
    try {
        const { name, display_name, description, color, permissions } = req.body;

        // Validation
        if (!name || !display_name || !permissions) {
            return res.status(400).json({ error: 'Missing required fields: name, display_name, permissions' });
        }

        // Check if role name already exists
        const existingRole = await sql`SELECT id FROM custom_roles WHERE name = ${name}`;
        if (existingRole.rows.length > 0) {
            return res.status(409).json({ error: 'Role name already exists' });
        }

        // Create role
        const result = await sql`
            INSERT INTO custom_roles (name, display_name, description, color, permissions, created_by)
            VALUES (
                ${name},
                ${display_name},
                ${description || null},
                ${color || '#6b7280'},
                ${JSON.stringify(permissions)}::jsonb,
                ${userId}
            )
            RETURNING id, name, display_name, description, color, permissions, is_system_role, created_at
        `;

        return res.status(201).json({
            success: true,
            message: 'Role created successfully',
            role: result.rows[0]
        });
    } catch (error) {
        throw error;
    }
}

// PUT - Update existing role
async function updateRole(req, res, userId) {
    try {
        const { id, name, display_name, description, color, permissions } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Role ID required' });
        }

        // Check if role exists and is not a system role
        const roleCheck = await sql`
            SELECT is_system_role FROM custom_roles WHERE id = ${id}
        `;

        if (roleCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Role not found' });
        }

        if (roleCheck.rows[0].is_system_role) {
            return res.status(403).json({ error: 'Cannot modify system roles' });
        }

        // Update role
        const result = await sql`
            UPDATE custom_roles
            SET 
                name = COALESCE(${name}, name),
                display_name = COALESCE(${display_name}, display_name),
                description = COALESCE(${description}, description),
                color = COALESCE(${color}, color),
                permissions = COALESCE(${permissions ? JSON.stringify(permissions) : null}::jsonb, permissions),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id}
            RETURNING id, name, display_name, description, color, permissions, is_system_role, updated_at
        `;

        return res.status(200).json({
            success: true,
            message: 'Role updated successfully',
            role: result.rows[0]
        });
    } catch (error) {
        throw error;
    }
}

// DELETE - Delete custom role
async function deleteRole(req, res) {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Role ID required' });
        }

        // Check if role exists and is not a system role
        const roleCheck = await sql`
            SELECT is_system_role, name FROM custom_roles WHERE id = ${id}
        `;

        if (roleCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Role not found' });
        }

        if (roleCheck.rows[0].is_system_role) {
            return res.status(403).json({ error: 'Cannot delete system roles' });
        }

        // Check if any users are assigned this role
        const usersWithRole = await sql`
            SELECT COUNT(*) as count FROM users WHERE role = ${roleCheck.rows[0].name}
        `;

        if (parseInt(usersWithRole.rows[0].count) > 0) {
            return res.status(409).json({
                error: 'Cannot delete role with active users',
                message: `${usersWithRole.rows[0].count} user(s) are assigned to this role. Please reassign them first.`
            });
        }

        // Delete role
        await sql`DELETE FROM custom_roles WHERE id = ${id}`;

        return res.status(200).json({
            success: true,
            message: 'Role deleted successfully'
        });
    } catch (error) {
        throw error;
    }
}
