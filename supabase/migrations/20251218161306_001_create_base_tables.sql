/*
  # Create Categories, Products, and Algorithm Configuration Tables

  1. New Tables
    - `categories` - Product category hierarchy
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `parent_id` (uuid, nullable for root categories)
      - `icon` (text)
      - `created_at` (timestamp)
      
    - `products` - Product inventory
      - `id` (text, primary key)
      - `name` (text)
      - `price` (numeric)
      - `actual_price` (numeric)
      - `discount_percentage` (numeric)
      - `category_id` (uuid, FK to categories)
      - `description` (text)
      - `image` (text)
      - `keywords` (text array)
      - `relevance` (numeric)
      - `take_rate` (numeric)
      - `ad_rate` (numeric)
      - `is_sponsored` (boolean)
      - `rating` (numeric)
      - `reviews` (integer)
      - `icon` (text)
      - `expected_revenue` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      
    - `algorithm_configs` - Saved parameter configurations
      - `id` (uuid, primary key)
      - `name` (text)
      - `lambda` (numeric)
      - `slots` (integer)
      - `score_weight` (numeric)
      - `selected_query` (text)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      
    - `algorithm_results` - Saved optimization results
      - `id` (uuid, primary key)
      - `config_id` (uuid, FK)
      - `result_data` (jsonb)
      - `total_revenue` (numeric)
      - `total_relevance` (numeric)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Public read access for products and categories
    - Authenticated write access for product management
    - Create default algorithm config
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  parent_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  icon text DEFAULT '📦',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  name text NOT NULL,
  price numeric NOT NULL,
  actual_price numeric NOT NULL,
  discount_percentage numeric DEFAULT 0,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  description text DEFAULT '',
  image text DEFAULT '',
  keywords text[] DEFAULT '{}',
  relevance numeric DEFAULT 0,
  take_rate numeric DEFAULT 0.15,
  ad_rate numeric DEFAULT 0.05,
  is_sponsored boolean DEFAULT false,
  rating numeric DEFAULT 0,
  reviews integer DEFAULT 0,
  icon text DEFAULT '📦',
  expected_revenue numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS algorithm_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  lambda numeric DEFAULT 0.90,
  slots integer DEFAULT 10,
  score_weight numeric DEFAULT 1.0,
  selected_query text DEFAULT 'cable',
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS algorithm_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id uuid REFERENCES algorithm_configs(id) ON DELETE CASCADE,
  result_data jsonb NOT NULL,
  total_revenue numeric NOT NULL,
  total_relevance numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE algorithm_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE algorithm_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Configs are viewable by everyone" ON algorithm_configs FOR SELECT USING (true);
CREATE POLICY "Results are viewable by everyone" ON algorithm_results FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create products" ON products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update products" ON products FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete products" ON products FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can create configs" ON algorithm_configs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update configs" ON algorithm_configs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete configs" ON algorithm_configs FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can create categories" ON categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update categories" ON categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete categories" ON categories FOR DELETE TO authenticated USING (true);

CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_sponsored ON products(is_sponsored);
CREATE INDEX idx_products_keywords ON products USING GIN(keywords);
CREATE INDEX idx_algorithm_configs_is_active ON algorithm_configs(is_active);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
