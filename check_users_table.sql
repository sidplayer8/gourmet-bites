-- Quick script to check if users table exists and show data
SELECT 
    table_name,
    column_name,
    data_type
FROM 
    information_schema.columns
WHERE 
    table_name = 'users'
ORDER BY 
    ordinal_position;

-- If table exists, show all users
SELECT * FROM users ORDER BY created_at DESC LIMIT 10;
