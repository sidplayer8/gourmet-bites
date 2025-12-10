-- The table has a legacy column 'total' which is NOT NULL
-- But our app sends 'total_price'. 
-- We should relax 'total' so it doesn't block inserts.

ALTER TABLE orders ALTER COLUMN total DROP NOT NULL;

-- Also ensure total_price is there (which we did, but good to be safe)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_price numeric;

-- While we are at it, let's sync them? No, trigger is complex.
-- Just unblocking the insert is priority.
