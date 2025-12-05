# Gourmet Bites - RBAC System Implementation

## Overview
Complete Role-Based Access Control system with multi-admin support, order management, and audit logging.

## Roles & Permissions

### Owner (You)
- **Full Access** to everything
- Create/edit/delete users
- Manage all orders
- View analytics
- Configure settings
- Assign staff to orders

### Chef
- View menu
- View and update orders (change status to preparing/ready)
- See assigned orders
- Cannot manage users

### Waiter
- View menu
- Create and manage orders
- Take customer orders
- See order status
- Cannot manage users

### Customer
- View menu
- Place orders
- View own order history

## Database Schema

### Users Table
```sql
- id (PRIMARY KEY)
- phone_number (UNIQUE)
- google_id, google_email (UNIQUE)
- display_name, avatar_url
- role (owner/chef/waiter/customer)
- permissions (JSONB)
- is_active (BOOLEAN)
- assigned_by, created_by, notes
- created_at, last_login, updated_at
```

### Orders Table (Enhanced)
```sql
- id (PRIMARY KEY)
- user_id, user_phone, user_name
- items (JSONB)
- total (DECIMAL)
- status (pending/confirmed/preparing/ready/completed/cancelled)
- payment_status (pending/paid/failed/refunded)
- payment_intent_id
- order_type (dine-in/takeout/delivery)
- table_number, delivery_address
- special_instructions
- assigned_chef, assigned_waiter (FK to users)
- Timestamps: created_at, confirmed_at, preparing_at, ready_at, completed_at
```

### Audit Log Table
```sql
- id (PRIMARY KEY)
- user_id, user_role, user_email
- action (CREATE_USER, UPDATE_ORDER, etc.)
- resource_type, resource_id
- changes (JSONB)
- ip_address, user_agent
- created_at
```

## API Endpoints

### User Management (`/api/admin/users`)
**Requires**: Owner permissions

- `GET` - List all users (filterable by role)
- `POST` - Create new staff account
- `PUT` - Update user role/permissions
- `DELETE` - Deactivate user account

**Headers**:
```
X-User-ID: <your_user_id>
Content-Type: application/json
```

**Example: Create Chef Account**
```javascript
fetch('/api/admin/users', {
  method: 'POST',
  headers: {
    'X-User-ID': '1', // Your owner account ID
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    display_name: 'Chef Gordon',
    email: 'chef@gourmet-bites.com',
    phone: '+1234567890',
    role: 'chef',
    notes: 'Head chef'
  })
});
```

### Orders Management (`/api/orders`)
**Requires**: Based on role

- `GET` - View orders (all orders for staff, own orders for customers)
  - Query params: `status`, `order_type`, `from_date`, `to_date`, `limit`
  - Returns orders + statistics

- `POST` - Create new order
- `PUT` - Update order status/assignments (staff only)

**Example: Get All Orders (Owner)**
```javascript
fetch('/api/orders?limit=50', {
  headers: {
    'X-User-ID': '1' // Owner ID
  }
});
```

**Example: Update Order Status (Chef)**
```javascript
fetch('/api/orders', {
  method: 'PUT',
  headers: {
    'X-User-ID': '5', // Chef ID
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    id: 123,
    status: 'preparing',
    assigned_chef: 5
  })
});
```

### Migration (`/api/setup/migrate-rbac`)
**One-time use**: Adds RBAC tables to existing database
**Security**: Requires `X-Migration-Token` header in production

## Next Steps

### Pending Implementation

1. **Fix SMS Verification** ✗
   - Debug Twilio integration
   - Fix verification code flow

2. **UI Updates** ✗
   - Make Google button smaller
   - Update login page styling

3. **Auth Integration** ✗
   - Update `/api/auth/save-user.js` to handle staff roles
   - Link Google/Phone login to staff accounts

4. **Owner Dashboard** ✗
   - User management UI
   - Create/edit staff accounts
   - View audit logs
   - Order analytics

5. **Chef View** ✗
   - Kitchen display system
   - See pending/preparing orders
   - Update order status
   - Mark orders ready

6. **Waiter View** ✗
   - Table management
   - Take orders
   - Check order status
   - Delivery tracking

## Security Notes

- All admin operations are logged in `audit_log`
- Soft delete for users (is_active = false)
- Cannot delete own account
- Cannot demote own role
- Permission checks on all endpoints
- IP address and user agent tracking

## Testing

1. **Run Migration** ✅
   ```bash
   curl -X POST https://gourmet-bites.vercel.app/api/setup/migrate-rbac
   ```

2. **Create Owner Account** (Your account)
   - Use existing login or create via API

3. **Test User Creation**
   ```bash
   curl -X POST https://gourmet-bites.vercel.app/api/admin/users \
     -H "X-User-ID: 1" \
     -H "Content-Type: application/json" \
     -d '{"display_name":"Test Chef","role":"chef","email":"test@test.com"}'
   ```

4. **Test Order Viewing**
   ```bash
   curl https://gourmet-bites.vercel.app/api/orders?limit=10 \
     -H "X-User-ID: 1"
   ```

## Files Created

- `/database-schema-rbac.sql` - Complete schema
- `/api/setup/migrate-rbac.js` - Migration script
- `/api/admin/users.js` - User management (enhanced)
- `/api/orders/index.js` - Order management (enhanced)
- `/RBAC-IMPLEMENTATION.md` - This file

---

**Status**: Backend Complete ✅ | Frontend Pending ✗
**Migration**: Completed Successfully ✅
**Next**: Build UI components for each role
