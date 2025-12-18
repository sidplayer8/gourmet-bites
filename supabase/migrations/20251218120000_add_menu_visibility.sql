-- Add visibility and availability columns to menu_items
-- Run this in Supabase SQL Editor

ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

-- Update existing items to be public and available
UPDATE menu_items 
SET is_public = true, is_available = true 
WHERE is_public IS NULL OR is_available IS NULL;

-- Add helpful comment
COMMENT ON COLUMN menu_items.is_public IS 'Controls if item appears in customer menu';
COMMENT ON COLUMN menu_items.is_available IS 'Controls stock availability (out of stock if false)';
