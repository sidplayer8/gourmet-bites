const { sql } = require('@vercel/postgres');

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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-User-ID');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { method, body, query } = req;
        const currentUserId = req.headers['x-user-id'];

        if (method === 'GET') {
            // Get orders with filters
            const { user_id, status, order_type, from_date, to_date, limit = 100 } = query;

            // Build dynamic query
            let queryConditions = [];
            let queryParams = [];

            // Check if user has permission to view all orders
            let canViewAll = false;
            if (currentUserId) {
                const userCheck = await sql`SELECT role, permissions FROM users WHERE id = ${currentUserId}`;
                if (userCheck.rows.length > 0) {
                    const permissions = userCheck.rows[0].permissions || {};
                    canViewAll = permissions.orders?.view === true && ['owner', 'chef', 'waiter'].includes(userCheck.rows[0].role);
                }
            }

            // Apply filters
            if (!canViewAll && user_id) {
                // Regular user can only see their own orders
                queryConditions.push(`user_id = ${user_id}`);
            } else if (!canViewAll) {
                return res.status(403).json({ error: 'Permission denied' });
            }

            if (status) {
                queryConditions.push(`status = '${status}'`);
            }

            if (order_type) {
                queryConditions.push(`order_type = '${order_type}'`);
            }

            if (from_date) {
                queryConditions.push(`created_at >= '${from_date}'`);
            }

            if (to_date) {
                queryConditions.push(`created_at <= '${to_date}'`);
            }

            const whereClause = queryConditions.length > 0 ? `WHERE ${queryConditions.join(' AND ')}` : '';

            const result = await sql.unsafe(`
                SELECT * FROM orders
                ${whereClause}
                ORDER BY created_at DESC
                LIMIT ${parseInt(limit)}
            `);

            // Get statistics
            const stats = await sql.unsafe(`
                SELECT
                    COUNT(*) as total_orders,
                    SUM(total) as total_revenue,
                    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
                    COUNT(CASE WHEN status = 'preparing' THEN 1 END) as preparing_count,
                    COUNT(CASE WHEN status = 'ready' THEN 1 END) as ready_count,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count
                FROM orders
                ${whereClause}
            `);

            return res.status(200).json({
                orders: result.rows,
                statistics: stats.rows[0],
                total: result.rows.length
            });

        } else if (method === 'POST') {
            // Create new order
            const { user_id, user_phone, user_name, items, total, order_type = 'dine-in', table_number, delivery_address, special_instructions } = body;

            if (!items || items.length === 0) {
                return res.status(400).json({ error: 'Items required' });
            }

            const result = await sql`
                INSERT INTO orders (
                    user_id, user_phone, user_name, items, total,
                    status, order_type, table_number, delivery_address, special_instructions
                )
                VALUES (
                    ${user_id || null}, ${user_phone || null}, ${user_name || null},
                    ${JSON.stringify(items)}::jsonb, ${total},
                    'pending', ${order_type}, ${table_number || null},
                    ${delivery_address || null}, ${special_instructions || null}
                )
                RETURNING *
            `;

            const newOrder = result.rows[0];

            if (currentUserId) {
                await logAction(currentUserId, 'customer', 'CREATE_ORDER', 'orders', newOrder.id, { total, items: items.length }, req);
            }

            return res.status(201).json(newOrder);

        } else if (method === 'PUT') {
            // Update order (status, assignments, etc.)
            if (!currentUserId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            // Check permissions
            const userCheck = await sql`SELECT role, permissions FROM users WHERE id = ${currentUserId}`;
            if (userCheck.rows.length === 0) {
                return res.status(401).json({ error: 'User not found' });
            }

            const user = userCheck.rows[0];
            const permissions = user.permissions || {};

            if (!permissions.orders?.edit) {
                return res.status(403).json({ error: 'No permission to edit orders' });
            }

            const { id, status, assigned_chef, assigned_waiter, notes } = body;

            if (!id) {
                return res.status(400).json({ error: 'Order ID required' });
            }

            // Update timestamps based on status
            let timestamps = {};
            if (status === 'confirmed') timestamps.confirmed_at = 'CURRENT_TIMESTAMP';
            if (status === 'preparing') timestamps.preparing_at = 'CURRENT_TIMESTAMP';
            if (status === 'ready') timestamps.ready_at = 'CURRENT_TIMESTAMP';
            if (status === 'completed') timestamps.completed_at = 'CURRENT_TIMESTAMP';

            const timestampUpdates = Object.keys(timestamps).map(key => `${key} = ${timestamps[key]}`).join(', ');
            const additionalUpdates = timestampUpdates ? `, ${timestampUpdates}` : '';

            const result = await sql.unsafe(`
                UPDATE orders
                SET status = COALESCE('${status}', status),
                    assigned_chef = COALESCE(${assigned_chef || null}, assigned_chef),
                    assigned_waiter = COALESCE(${assigned_waiter || null}, assigned_waiter),
                    updated_at = CURRENT_TIMESTAMP
                    ${additionalUpdates}
                WHERE id = ${id}
                RETURNING *
            `);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Order not found' });
            }

            await logAction(currentUserId, user.role, 'UPDATE_ORDER', 'orders', id, { status, assigned_chef, assigned_waiter }, req);

            return res.status(200).json(result.rows[0]);

        } else {
            return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Error with orders:', error);
        return res.status(500).json({ error: 'Database operation failed', details: error.message });
    }
};
