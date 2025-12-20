-- Set up default roles with proper permissions
-- This script UPDATES existing roles with appropriate permission values

-- Owner role - Full permissions (all flags set)
UPDATE roles 
SET permissions = 4294967295  -- 0xFFFFFFFF - all permissions
WHERE name = 'Owner';

-- Manager role - Most permissions except role management
UPDATE roles 
SET permissions = 4294934527  -- 0xFFFF7FFF - All except MANAGE_ROLES (32768)
WHERE name = 'Manager';

-- Staff role - View and basic operations only
UPDATE roles 
SET permissions = 12545  -- VIEW_MENU (1) + VIEW_STAFF (256) + VIEW_ORDERS (4096) + UPDATE_ORDERS (8192)
WHERE name = 'Staff';

-- Chef role - Menu and orders only
UPDATE roles 
SET permissions = 12295  -- VIEW_MENU (1) + CREATE_MENU (2) + EDIT_MENU (4) + VIEW_ORDERS (4096) + UPDATE_ORDERS (8192)
WHERE name = 'Chef';

-- Server role - Orders and menu viewing only
UPDATE roles 
SET permissions = 12289  -- VIEW_MENU (1) + VIEW_ORDERS (4096) + UPDATE_ORDERS (8192)
WHERE name = 'Server';
