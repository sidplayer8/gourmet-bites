-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  image VARCHAR(500),
  allergens TEXT[],
  options TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table  
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  user_phone VARCHAR(50),
  items JSONB NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
