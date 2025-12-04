-- Insert menu items directly
INSERT INTO menu_items (name, description, price, category, image, allergens, options) VALUES
('Margherita Pizza', 'Classic Italian pizza with fresh mozzarella, basil, and tomato sauce', 12.99, 'Pizzas', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800', ARRAY['Dairy', 'Gluten'], ARRAY[]::TEXT[]),
('Pepperoni Pizza', 'Traditional pizza topped with pepperoni and mozzarella cheese', 14.99, 'Pizzas', 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800', ARRAY['Dairy', 'Gluten'], ARRAY[]::TEXT[]),
('Classic Burger', 'Juicy beef patty with lettuce, tomato, and special sauce', 11.99, 'Burgers', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', ARRAY['Gluten', 'Dairy'], ARRAY[]::TEXT[]),
('Bacon Cheeseburger', 'Burger with crispy bacon and melted cheddar cheese', 13.99, 'Burgers', 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800', ARRAY['Gluten', 'Dairy'], ARRAY[]::TEXT[]),
('California Roll', 'Fresh sushi roll with crab, avocado, and cucumber', 9.99, 'Sushi', 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800', ARRAY['Shellfish'], ARRAY[]::TEXT[]),
('Spicy Tuna Roll', 'Tuna roll with spicy mayo and sesame seeds', 11.99, 'Sushi', 'https://images.unsplash.com/photo-1617196035183-421ef54db3e3?w=800', ARRAY['Fish'], ARRAY[]::TEXT[]),
('Caesar Salad', 'Crisp romaine lettuce with parmesan and croutons', 8.99, 'Salads', 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800', ARRAY['Dairy', 'Gluten'], ARRAY[]::TEXT[]),
('Greek Salad', 'Fresh vegetables with feta cheese and olives', 9.99, 'Salads', 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800', ARRAY['Dairy'], ARRAY[]::TEXT[]),
('Grilled Ribeye Steak', 'Premium ribeye steak cooked to perfection', 24.99, 'Steaks', 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800', ARRAY[]::TEXT[], ARRAY[]::TEXT[]),
('Filet Mignon', 'Tender filet mignon with herb butter', 28.99, 'Steaks', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800', ARRAY[]::TEXT[], ARRAY[]::TEXT[]),
('Pad Thai', 'Thai stir-fried noodles with peanuts and lime', 13.99, 'Asian', 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800', ARRAY['Peanuts', 'Shellfish'], ARRAY[]::TEXT[]),
('Chicken Tikka Masala', 'Creamy Indian curry with tender chicken', 14.99, 'Asian', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800', ARRAY['Dairy'], ARRAY[]::TEXT[]),
('Pasta Carbonara', 'Creamy pasta with bacon and parmesan', 12.99, 'Pasta', 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800', ARRAY['Dairy', 'Gluten'], ARRAY[]::TEXT[]),
('Penne Arrabbiata', 'Spicy tomato sauce with garlic and chili', 11.99, 'Pasta', 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800', ARRAY['Gluten'], ARRAY[]::TEXT[]),
('Buffalo Wings', 'Crispy chicken wings with hot sauce', 10.99, 'Appetizers', 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=800', ARRAY['Dairy'], ARRAY[]::TEXT[]),
('Mozzarella Sticks', 'Fried mozzarella with marinara sauce', 7.99, 'Appetizers', 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=800', ARRAY['Dairy', 'Gluten'], ARRAY[]::TEXT[]),
('Classic Tiramisu', 'Italian dessert with coffee and mascarpone', 7.99, 'Desserts', 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800', ARRAY['Dairy', 'Gluten'], ARRAY[]::TEXT[]);
