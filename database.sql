-- ============================================================
-- Mini QR Ordering System — PostgreSQL Schema (Supabase)
-- ============================================================

-- ── Products ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(120)   NOT NULL,
  description  TEXT,
  price        NUMERIC(10,2)  NOT NULL,
  category     VARCHAR(60)    NOT NULL DEFAULT 'Main Course',
  image_url    VARCHAR(255),
  is_available BOOLEAN        NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ    DEFAULT NOW(),
  updated_at   TIMESTAMPTZ    DEFAULT NOW()
);

-- ── Orders ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name  VARCHAR(100)   NOT NULL,
  table_number   VARCHAR(20),
  total_amount   NUMERIC(10,2)  NOT NULL DEFAULT 0,
  notes          TEXT,
  status         VARCHAR(20)    NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','preparing','ready','completed','cancelled')),
  payment_status VARCHAR(20)    NOT NULL DEFAULT 'unpaid'
                   CHECK (payment_status IN ('unpaid','paid','failed')),
  payment_method VARCHAR(50),
  created_at     TIMESTAMPTZ    DEFAULT NOW(),
  updated_at     TIMESTAMPTZ    DEFAULT NOW()
);

-- ── Order Items ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id          SERIAL         PRIMARY KEY,
  order_id    UUID           NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  INTEGER        NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity    INTEGER        NOT NULL DEFAULT 1,
  unit_price  NUMERIC(10,2)  NOT NULL,
  subtotal    NUMERIC(10,2)  NOT NULL
);

-- ── Seed: Products ────────────────────────────────────────────
INSERT INTO products (name, description, price, category, image_url) VALUES
('Crispy Spring Rolls',  'Golden fried spring rolls with sweet chili dip',           75.00,  'Starters',    'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400'),
('Garlic Bread',         'Toasted baguette with herb butter and garlic',             60.00,  'Starters',    'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=400'),
('Caesar Salad',         'Romaine lettuce, parmesan, croutons, caesar dressing',     120.00, 'Starters',    'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400'),
('Chicken Adobo',        'Classic Filipino braised chicken in soy and vinegar',      180.00, 'Main Course', 'https://images.unsplash.com/photo-1625938144755-652e08e359b7?w=400'),
('Beef Sinigang',        'Tamarind-based sour soup with tender beef and veggies',   220.00, 'Main Course', 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400'),
('Pork BBQ (3 pcs)',     'Skewered pork marinated in sweet-savory sauce, grilled',  150.00, 'Main Course', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400'),
('Grilled Tilapia',      'Whole grilled fish with soy-calamansi dipping sauce',     190.00, 'Main Course', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400'),
('Pancit Canton',        'Stir-fried egg noodles with vegetables and pork slices',  130.00, 'Main Course', 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400'),
('Steamed Rice',         'Plain steamed white rice',                                 30.00,  'Rice & Sides','https://images.unsplash.com/photo-1536304993881-ff86e0c9b4e8?w=400'),
('Garlic Fried Rice',    'Fragrant fried rice tossed with garlic and egg',           55.00,  'Rice & Sides','https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400'),
('Iced Calamansi Juice', 'Fresh calamansi squeezed over crushed ice, sweetened',    60.00,  'Drinks',      'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400'),
('Bottled Water',        'Chilled 500ml mineral water',                              30.00,  'Drinks',      'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400'),
('Sago at Gulaman',      'Sweet iced drink with tapioca pearls and gelatin cubes',  65.00,  'Drinks',      'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400'),
('Mango Shake',          'Creamy blended fresh mango with crushed ice',              90.00,  'Drinks',      'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400'),
('Halo-Halo',            'Crushed ice, mixed sweets, leche flan, ube, milk',        110.00, 'Desserts',    'https://images.unsplash.com/photo-1620230874645-0d85522b40f2?w=400'),
('Leche Flan',           'Classic Filipino caramel custard, silky smooth',           80.00,  'Desserts',    'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400');
