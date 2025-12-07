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
