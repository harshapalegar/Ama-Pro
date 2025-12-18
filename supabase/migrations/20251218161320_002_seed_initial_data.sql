/*
  # Seed Initial Categories and Products

  This migration inserts the default categories and initial product dataset to get started.
*/

INSERT INTO categories (name, slug, icon) VALUES
('Electronics', 'electronics', '📱'),
('Computers & Accessories', 'computers-accessories', '💻'),
('Cables & Accessories', 'cables-accessories', '🔌'),
('Wearable Technology', 'wearable-technology', '⌚'),
('Home Theater & TV', 'home-theater-tv', '📺'),
('Fashion', 'fashion', '👕'),
('Appliances', 'appliances', '🍳');

INSERT INTO algorithm_configs (name, lambda, slots, score_weight, selected_query, is_active) VALUES
('Default Configuration', 0.90, 10, 1.0, 'cable', true),
('High Relevance Focus', 0.95, 12, 0.5, 'cable', false),
('Revenue Maximized', 0.80, 15, 2.0, 'iphone', false);
