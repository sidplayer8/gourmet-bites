const { sql } = require('@vercel/postgres');

// Permission presets for different roles
const ROLE_PERMISSIONS = {
    owner: {
        menu: { view: true, create: true, edit: true, delete: true },
        orders: { view: true, create: true, edit: true, delete: true, assign: true },
        users: { view: true, create: true, edit: true, delete: true },
        analytics: { view: true },
        settings: { view: true, edit: true }
    },
    chef: {
        menu: { view: true },
        orders: { view: true, edit: true },
        users: { view: false },
        analytics: { view: false }
    },
    waiter: {
        menu: { view: true },
        orders: { view: true, create: true, edit: true },
        users: { view: false },
        analytics: { view: false }
    },
    customer: {
        menu: { view: true },
        orders: { view: true, create: true }
    }
};

// Audit logging helper
async function logAction(userId, userRole, action, resourceType, resourceId, changes, req) {
    try {
        const ipAddress = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';

        await sql`
            INSERT INTO audit_log (user_id, user_role, action, resource_type, resource_id, changes, ip_address, user_agent)
            VALUES (${userId}, ${userRole}, ${action}, ${resourceType}, ${resourceId}, ${JSON.stringify(changes)}::jsonb, ${ipAddress}, ${userAgent})
        `;
    } catch (error) {
        console.error('Audit log error:', error);
    }
}

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-User-ID');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { method, body, query } = req;

        // Get current user from header
        const currentUserId = req.headers['x-user-id'];

        if (!currentUserId) {
            return res.status(401).json({ error: 'Unauthorized: User ID required in X-User-ID header' });
        }

        // Verify current user has permission
        const currentUser = await sql`SELECT * FROM users WHERE id = ${currentUserId} AND is_active = true`;
        if (currentUser.rows.length === 0) {
            return res.status(401).json({ error: 'Unauthorized: User not found or inactive' });
        }

        const user = currentUser.rows[0];
        const permissions = user.permissions || {};

        if (method === 'GET') {
            // List users (requires users.view permission)
            if (!permissions.users?.view) {
                return res.status(403).json({ error: 'Forbidden: No permission to view users' });
            }

            const { role } = query;
            let result;

            if (role) {
                result = await sql`
                    SELECT id, phone_number, google_email, display_name, avatar_url, role, permissions, is_active, created_at, last_login
                    FROM users
                    WHERE role = ${role}
                    ORDER BY display_name
                `;
            } else {
                result = await sql`
                    SELECT id, phone_number, google_email, display_name, avatar_url, role, permissions, is_active, created_at, last_login
                    FROM users
                    ORDER BY role, display_name
                `;
            }

            await logAction(currentUserId, user.role, 'LIST_USERS', 'users', null, { role }, req);

            return res.status(200).json({
                users: result.rows,
                total: result.rows.length
            });

        } else if (method === 'POST') {
            // Create new user (requires users.create permission)
            if (!permissions.users?.create) {
                return res.status(403).json({ error: 'Forbidden: No permission to create users' });
            }

            const { display_name, email, phone, google_id, username, password, role, notes, customPermissions } = body;

            // Validate
            if (!display_name || !role) {
                return res.status(400).json({ error: 'Display name and role required' });
            }

            if (!['owner', 'chef', 'waiter', 'customer'].includes(role)) {
                return res.status(400).json({ error: 'Invalid role' });
            }

            // For staff roles, require username and password
            if (['owner', 'chef', 'waiter'].includes(role) && (!username || !password)) {
                return res.status(400).json({ error: 'Username and password required for staff accounts' });
            }

            // Get permissions
            const userPermissions = customPermissions || ROLE_PERMISSIONS[role];

            const result = await sql`
                INSERT INTO users (phone_number, google_email, google_id, username, password, display_name, role, permissions, assigned_by, created_by, notes, is_active)
                VALUES (${phone || null}, ${email || null}, ${google_id || null}, ${username || null}, ${password || null}, ${display_name}, ${role}, ${JSON.stringify(userPermissions)}::jsonb, ${currentUserId}, ${user.display_name || user.google_email}, ${notes || null}, true)
                RETURNING id, username, phone_number, google_email, display_name, role, permissions, is_active, created_at
            `;

            const newUser = result.rows[0];

            await logAction(currentUserId, user.role, 'CREATE_USER', 'users', newUser.id, { role, display_name }, req);

            return res.status(201).json(newUser);

        } else if (method === 'PUT') {
            // Update user (requires users.edit permission)
            if (!permissions.users?.edit) {
                return res.status(403).json({ error: 'Forbidden: No permission to edit users' });
            }

            const { id, display_name, username, password, role, permissions: newPermissions, is_active, notes } = body;

            if (!id) {
                return res.status(400).json({ error: 'User ID required' });
            }

            // Prevent owner from demoting themselves
            if (parseInt(id) === parseInt(currentUserId) && role && role !== 'owner') {
                return res.status(400).json({ error: 'Cannot change your own role' });
            }

            // Get updated permissions
            let finalPermissions = newPermissions;
            if (role && !newPermissions) {
                finalPermissions = ROLE_PERMISSIONS[role];
            }

            const result = await sql`
                UPDATE users
                SET display_name = COALESCE(${display_name}, display_name),
                    username = COALESCE(${username}, username),
                    password = COALESCE(${password}, password),
                    role = COALESCE(${role}, role),
                    permissions = COALESCE(${finalPermissions ? JSON.stringify(finalPermissions) : null}::jsonb, permissions),
                    is_active = COALESCE(${is_active}, is_active),
                    notes = COALESCE(${notes}, notes),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ${id}
                RETURNING id, username, phone_number, google_email, display_name, role, permissions, is_active, updated_at
            `;

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            await logAction(currentUserId, user.role, 'UPDATE_USER', 'users', id, { display_name, role, is_active }, req);

            return res.status(200).json(result.rows[0]);

        } else if (method === 'DELETE') {
            // Delete/deactivate user (requires users.delete permission)
            if (!permissions.users?.delete) {
                return res.status(403).json({ error: 'Forbidden: No permission to delete users' });
            }

            const { id } = body;

            if (!id) {
                return res.status(400).json({ error: 'User ID required' });
            }

            // Prevent deleting self
            if (parseInt(id) === parseInt(currentUserId)) {
                return res.status(400).json({ error: 'Cannot delete your own account' });
            }

            // Soft delete
            const result = await sql`
                UPDATE users
                SET is_active = false, updated_at = CURRENT_TIMESTAMP
                WHERE id = ${id}
                RETURNING id, display_name
            `;

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            await logAction(currentUserId, user.role, 'DELETE_USER', 'users', id, {}, req);

            return res.status(200).json({
                message: 'User deactivated successfully',
                user: result.rows[0]
            });

        } else {
            return res.status(405).json({ error: 'Method not allowed' });
        }

    } catch (error) {
        console.error('User management error:', error);
        return res.status(500).json({
            error: 'Operation failed',
            details: error.message
        });
    }
};
