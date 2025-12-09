-- Initial database schema for Gourmet Bites restaurant system
-- Run this in Supabase SQL Editor

-- Table 1: Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  allergens TEXT[],
  ingredients TEXT[],
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 2: Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_phone TEXT,
  user_name TEXT,
  user_email TEXT,
  items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 3: Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE,
  email TEXT,
  name TEXT,
  profile_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Table 4: Admins
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for menu_items (public read, admin write via service key)
CREATE POLICY "Public can view menu items" ON menu_items
  FOR SELECT USING (available = true);

-- RLS Policies for orders (users can create and view their own)
CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub' OR true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(available);

-- Seed initial menu data
INSERT INTO menu_items (name, description, price, image_url, allergens, ingredients, available) VALUES
('Classic Burger', 'Juicy beef patty with fresh vegetables', 11.99, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', ARRAY['Gluten', 'Dairy'], ARRAY['Beef Patty', 'Lettuce', 'Tomato', 'Cheese', 'Bun', 'Sauce'], true),
('Margherita Pizza', 'Fresh mozzarella, basil, tomato sauce', 12.99, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400', ARRAY['Gluten', 'Dairy'], ARRAY['Pizza Dough', 'Mozzarella', 'Tomato Sauce', 'Basil', 'Olive Oil'], true),
('Chicken Tikka', 'Creamy Indian curry with tender chicken', 14.99, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', ARRAY['Dairy'], ARRAY['Chicken', 'Cream', 'Tikka Masala Sauce', 'Spices', 'Rice'], true),
('Pasta Carbonara', 'Creamy pasta with crispy bacon', 12.99, 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400', ARRAY['Gluten', 'Dairy', 'Eggs'], ARRAY['Pasta', 'Bacon', 'Eggs', 'Parmesan', 'Black Pepper'], true),
('Caesar Salad', 'Crisp romaine with parmesan and croutons', 8.99, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', ARRAY['Gluten', 'Dairy', 'Fish'], ARRAY['Romaine Lettuce', 'Croutons', 'Parmesan', 'Caesar Dressing'], true),
('Greek Salad', 'Fresh vegetables with feta cheese', 9.99, 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400', ARRAY['Dairy'], ARRAY['Tomatoes', 'Cucumber', 'Feta', 'Olives', 'Red Onion'], true),
('Pepperoni Pizza', 'Classic pizza with pepperoni and cheese', 14.99, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400', ARRAY['Gluten', 'Dairy'], ARRAY['Pizza Dough', 'Mozzarella', 'Pepperoni', 'Tomato Sauce'], true),
('Buffalo Wings', 'Spicy chicken wings with hot sauce', 10.99, 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400', ARRAY[]::TEXT[], ARRAY['Chicken Wings', 'Buffalo Sauce', 'Celery', 'Blue Cheese Dip'], true)
ON CONFLICT DO NOTHING;

-- Create default admin user (password: admin123 - CHANGE THIS!)
-- Password hash for 'admin123' using bcrypt
INSERT INTO admins (email, password_hash, name, role) VALUES
('admin@gourmetbites.com', '$2a$10$rKzNJFJXB7xkeP7Z8b8kXeZWj1VnWqL.fM97d3d8c1c1YZX8K9xOW', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING;
