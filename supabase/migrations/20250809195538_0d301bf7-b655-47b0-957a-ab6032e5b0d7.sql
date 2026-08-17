-- Insert all pool-related products into the products table

-- First, clear existing products to avoid duplicates
TRUNCATE TABLE public.products RESTART IDENTITY CASCADE;

-- Insert Pool Liners
INSERT INTO public.products (
  name, description, category, subcategory, type_category, price, image_url, 
  material, warranty_years_text, features_json, stock_quantity, is_active
) VALUES
-- Glass Tile Collection
('Paradise', 'Vibrant blue glass tiles with flowing striped patterns for a tropical paradise feel', 'liners', 'glass-tile', 'glass', 12000, '/lovable-uploads/631882e5-0b2d-43a0-9ee8-27e7e984fb3d.png', 'Glass', '25 years', '["Premium Glass", "Tropical Design", "UV Resistant", "Easy Maintenance"]', 50, true),
('Water Lilies', 'Serene blue and white striped glass tiles reminiscent of peaceful water gardens', 'liners', 'glass-tile', 'glass', 12000, '/lovable-uploads/7f1b802e-1c58-4807-b6d6-41aab2eed1ca.png', 'Glass', '25 years', '["Premium Glass", "Peaceful Design", "UV Resistant", "Easy Maintenance"]', 50, true),
('Sail Boat', 'Nautical-inspired mixed blue and brown striped glass tiles for coastal elegance', 'liners', 'glass-tile', 'glass', 12000, '/lovable-uploads/c4b386e8-679d-4ea3-be08-9b8fb9e8d50e.png', 'Glass', '25 years', '["Premium Glass", "Nautical Design", "UV Resistant", "Easy Maintenance"]', 50, true),
('Stormy', 'Dramatic neutral and brown striped glass tiles with stormy weather appeal', 'liners', 'glass-tile', 'glass', 12000, '/lovable-uploads/ee0c59a8-87bb-4b74-b6e9-9eeba3633e9f.png', 'Glass', '25 years', '["Premium Glass", "Dramatic Design", "UV Resistant", "Easy Maintenance"]', 50, true),
('Ballad', 'Mixed blue mosaic glass tiles with artistic patterns and flowing design', 'liners', 'glass-tile', 'glass', 12000, '/lovable-uploads/37536046-70f5-46b8-8422-84097ccdec08.png', 'Glass', '25 years', '["Premium Glass", "Artistic Design", "UV Resistant", "Easy Maintenance"]', 50, true),
('Galant', 'Elegant blue mosaic glass tiles with iridescent effects and sophisticated style', 'liners', 'glass-tile', 'glass', 12000, '/lovable-uploads/723a9c27-b7d5-4139-bda7-4eed2d0b23e8.png', 'Glass', '25 years', '["Premium Glass", "Iridescent Effects", "UV Resistant", "Easy Maintenance"]', 50, true),
('Melody', 'Harmonious iridescent glass tiles with rainbow shimmer and artistic flair', 'liners', 'glass-tile', 'glass', 12000, '/lovable-uploads/c8e3cc34-9fbe-4ece-af71-05b7e4f94332.png', 'Glass', '25 years', '["Premium Glass", "Rainbow Shimmer", "UV Resistant", "Easy Maintenance"]', 50, true),
('Soul', 'Sophisticated gray and white mosaic glass tiles with deep, soulful character', 'liners', 'glass-tile', 'glass', 12000, '/lovable-uploads/7dc956df-af5c-4c6b-b2af-6bc9d6fbf179.png', 'Glass', '25 years', '["Premium Glass", "Sophisticated Design", "UV Resistant", "Easy Maintenance"]', 50, true),
('Glacier', 'Cool glacier-inspired glass tiles with decorative borders and flowing patterns', 'liners', 'glass-tile', 'glass', 12000, '/lovable-uploads/96f46291-85e7-4b48-9465-623400a8e835.png', 'Glass', '25 years', '["Premium Glass", "Glacier Design", "UV Resistant", "Easy Maintenance"]', 50, true),

-- Porcelain & Stone Collection
('Tikal', 'Marbled blue porcelain with premium durability and 25-year warranty', 'liners', 'porcelain-stone', 'porcelain', 5400, '/lovable-uploads/d5e74c29-95f6-4a9a-9395-a98fe4efdadd.png', 'Porcelain', '25 years', '["Premium Porcelain", "Marbled Design", "Durable", "Stain Resistant"]', 50, true),
('Port Royal', 'Deep ocean blue porcelain with premium durability and 25-year warranty', 'liners', 'porcelain-stone', 'porcelain', 5600, '/lovable-uploads/56fd62de-130b-4b90-98a0-596007f5dadb.png', 'Porcelain', '25 years', '["Premium Porcelain", "Ocean Blue", "Durable", "Stain Resistant"]', 50, true),
('Alexandria', 'Golden marble porcelain with premium durability and 25-year warranty', 'liners', 'porcelain-stone', 'porcelain', 5500, '/lovable-uploads/87fbe0eb-0a2f-4101-b01c-d0a02fe350f7.png', 'Porcelain', '25 years', '["Premium Porcelain", "Golden Marble", "Durable", "Stain Resistant"]', 50, true),
('San Marino', 'Dark granite Italian stone with luxury durability and 30-year warranty', 'liners', 'porcelain-stone', 'italian-stone', 5800, '/lovable-uploads/7f823d88-d9f2-4ecf-bcd1-a9d25d8519a8.png', 'Italian Stone', '30 years', '["Italian Stone", "Dark Granite", "Luxury Durability", "Natural Beauty"]', 50, true),
('Firenze', 'Blue grey marble Italian stone with luxury durability and 30-year warranty', 'liners', 'porcelain-stone', 'italian-stone', 5900, '/lovable-uploads/797bcadb-19bc-4859-8319-ceb12ea23d10.png', 'Italian Stone', '30 years', '["Italian Stone", "Blue Grey Marble", "Luxury Durability", "Natural Beauty"]', 50, true),
('Naples', 'Warm beige stone Italian stone with luxury durability and 30-year warranty', 'liners', 'porcelain-stone', 'italian-stone', 5700, '/lovable-uploads/a378df22-0a67-4626-ac93-c6cf8fe37602.png', 'Italian Stone', '30 years', '["Italian Stone", "Warm Beige", "Luxury Durability", "Natural Beauty"]', 50, true),
('Milan Liner', 'Charcoal stone Italian stone with luxury durability and 30-year warranty', 'liners', 'porcelain-stone', 'italian-stone', 6000, '/lovable-uploads/b871f521-8e15-4ed4-ad20-1a3774f535cd.png', 'Italian Stone', '30 years', '["Italian Stone", "Charcoal Stone", "Luxury Durability", "Natural Beauty"]', 50, true);

-- Insert Pool Tiles (Premium Upgrades)
INSERT INTO public.products (
  name, description, category, subcategory, type_category, price, image_url, 
  material, warranty_years_text, features_json, stock_quantity, is_active
) VALUES
('Mountain Tile', 'Natural stone-look mosaic border with decorative diamond pattern', 'tiles', 'mosaic-borders', 'stone-look', 15000, '/lovable-uploads/c5cd2f96-d31a-446b-943b-6dd1620f6521.png', 'Ceramic Mosaic', '25 years', '["Diamond Pattern", "Natural Stone Look", "Premium Border", "Decorative"]', 30, true),
('Carnegie Tile', 'Elegant diamond mosaic border with rich blue tones', 'tiles', 'mosaic-borders', 'diamond', 15000, '/lovable-uploads/5a4a4746-8777-4adb-84c6-c153dbdae3ad.png', 'Ceramic Mosaic', '25 years', '["Diamond Mosaic", "Rich Blue Tones", "Premium Border", "Elegant"]', 30, true),
('Panama Tile', 'Geometric stone mosaic border with golden accents', 'tiles', 'mosaic-borders', 'geometric', 15000, '/lovable-uploads/b6d63246-ec6b-4137-9b83-6fe99f232ba3.png', 'Ceramic Mosaic', '25 years', '["Geometric Pattern", "Golden Accents", "Premium Border", "Stone Mosaic"]', 30, true),
('Corolla Tile', 'Contemporary wave pattern border in deep blue', 'tiles', 'mosaic-borders', 'wave', 15000, '/lovable-uploads/4f27a800-295b-476c-924c-1790ab191a5c.png', 'Ceramic Mosaic', '25 years', '["Wave Pattern", "Deep Blue", "Contemporary", "Premium Border"]', 30, true),
('Summerwave Tile', 'Flowing wave mosaic pattern with ocean-inspired design', 'tiles', 'mosaic-borders', 'wave', 15000, '/lovable-uploads/cd46eae1-1354-4459-84fe-890ad56d16d7.png', 'Ceramic Mosaic', '25 years', '["Flowing Wave", "Ocean Inspired", "Premium Border", "Mosaic Pattern"]', 30, true),
('Legends Tile', 'Ornate decorative border with flowing artistic elements', 'tiles', 'mosaic-borders', 'decorative', 15000, '/lovable-uploads/23b627a0-fda7-408d-bb6e-d41308f8ea6a.png', 'Ceramic Mosaic', '25 years', '["Ornate Design", "Artistic Elements", "Premium Border", "Decorative"]', 30, true),
('Z Terrazzo Tile', 'Classic terrazzo-style mosaic with fan pattern detail', 'tiles', 'mosaic-borders', 'terrazzo', 15000, '/lovable-uploads/107aebee-8f2d-4c04-a51f-f2acf731860e.png', 'Terrazzo Mosaic', '25 years', '["Terrazzo Style", "Fan Pattern", "Classic Design", "Premium Border"]', 30, true),
('Tullism Tile', 'Luxury glass tile interior with sophisticated pattern', 'tiles', 'glass-tile', 'luxury', 15000, '/lovable-uploads/eb055418-8b18-40d1-af88-613c4c275b20.png', 'Luxury Glass', '25 years', '["Luxury Glass", "Sophisticated Pattern", "Premium Interior", "High End"]', 30, true),
('Courtstone Gray Tile', 'Contemporary gray stone tile border with modern appeal', 'tiles', 'stone-tile', 'contemporary', 15000, '/lovable-uploads/86d04882-f51e-4b4b-9c89-34031c370138.png', 'Stone Tile', '25 years', '["Contemporary Gray", "Modern Appeal", "Stone Tile", "Premium Border"]', 30, true),
('Courtstone Blue Tile', 'Sophisticated blue stone tile border for elegant pools', 'tiles', 'stone-tile', 'elegant', 15000, '/lovable-uploads/e3edd8ff-9c8e-4b4a-b540-1f735f98548f.png', 'Stone Tile', '25 years', '["Sophisticated Blue", "Elegant Design", "Stone Tile", "Premium Border"]', 30, true),
('Nantuke Tile', 'Elegant wave-pattern mosaic border with flowing blue and white tones', 'tiles', 'mosaic-borders', 'wave', 15000, '/lovable-uploads/0cd49ce9-1874-458c-9a9f-a9828d1879a5.png', 'Ceramic Mosaic', '25 years', '["Wave Pattern", "Blue and White", "Elegant Design", "Premium Border"]', 30, true),
('Esagoni Tile', 'Contemporary hexagonal mosaic tile border in deep ocean blues', 'tiles', 'mosaic-borders', 'hexagonal', 15000, '/lovable-uploads/e7e9e75d-bd96-4d35-b0fa-7b4dd20c67a8.png', 'Ceramic Mosaic', '25 years', '["Hexagonal Pattern", "Ocean Blues", "Contemporary", "Premium Border"]', 30, true),
('Whitehaven Tile', 'Sophisticated diamond pattern border with intricate mosaic detail', 'tiles', 'mosaic-borders', 'diamond', 15000, '/lovable-uploads/805c3cea-4684-4e5b-acae-3405dc854aac.png', 'Ceramic Mosaic', '25 years', '["Diamond Pattern", "Intricate Detail", "Sophisticated", "Premium Border"]', 30, true),
('Island Wave Tile', 'Tropical wave-inspired border with flowing aqua and blue design', 'tiles', 'mosaic-borders', 'wave', 15000, '/lovable-uploads/a985de5c-c9d0-4a3d-8584-b54f877870b9.png', 'Ceramic Mosaic', '25 years', '["Tropical Wave", "Aqua and Blue", "Flowing Design", "Premium Border"]', 30, true),
('Durango Gray Tile', 'Modern gray-toned decorative border with artistic arch pattern', 'tiles', 'mosaic-borders', 'arch', 15000, '/lovable-uploads/58cf10b7-a125-4e4f-be0b-6a0deb095bac.png', 'Ceramic Mosaic', '25 years', '["Gray Toned", "Arch Pattern", "Modern Design", "Decorative Border"]', 30, true),
('Vintage Blue Tile', 'Classic blue mosaic tile border with timeless decorative elements', 'tiles', 'mosaic-borders', 'vintage', 15000, '/lovable-uploads/65b3331a-e988-4fbb-a9b2-d73d1b94ae79.png', 'Ceramic Mosaic', '25 years', '["Vintage Blue", "Timeless Design", "Classic Mosaic", "Decorative Elements"]', 30, true),
('Royal Blue Tile', 'Regal blue and gold decorative border with ornate tile pattern', 'tiles', 'mosaic-borders', 'regal', 15000, '/lovable-uploads/d1c1d059-1d8d-4481-9f17-d2a5e2f89ebd.png', 'Ceramic Mosaic', '25 years', '["Royal Blue", "Gold Accents", "Ornate Pattern", "Regal Design"]', 30, true),
('Gulf Coast Tile', 'Coastal-inspired mosaic border with flowing rope-like pattern', 'tiles', 'mosaic-borders', 'coastal', 15000, '/lovable-uploads/7cfaa1c7-7fe8-472a-bf41-4d1973510a5a.png', 'Ceramic Mosaic', '25 years', '["Coastal Inspired", "Rope Pattern", "Flowing Design", "Mosaic Border"]', 30, true),
('Hamper Tile', 'Elegant paisley-inspired decorative border with sophisticated blue tones', 'tiles', 'mosaic-borders', 'paisley', 15000, '/lovable-uploads/85d596d1-7479-4926-9732-a76fdac75eee.png', 'Ceramic Mosaic', '25 years', '["Paisley Inspired", "Sophisticated Blue", "Elegant Design", "Decorative Border"]', 30, true);

-- Insert Tanning Ledges
INSERT INTO public.products (
  name, description, category, subcategory, type_category, price, image_url, 
  material, warranty_years_text, features_json, benefits, installation_time, stock_quantity, is_active
) VALUES
('Genesis Tanning Ledge', 'Curved elegance with flowing lines for ultimate relaxation', 'tanning-ledges', 'curved', 'premium', 15000, '/lovable-uploads/2af253b1-b9be-487f-a998-476d396772c4.png', 'Fiberglass', 'Lifetime', '["Curved Design", "Built-in Seating", "Non-slip Surface", "Perfect for Lounging"]', '["Ultimate Relaxation", "Flowing Lines", "Curved Elegance"]', '3-5 days', 20, true),
('Hermosa Tanning Ledge', 'Sophisticated curved ledge with premium comfort features', 'tanning-ledges', 'curved', 'premium', 15000, '/lovable-uploads/8228c334-6fd7-4b29-afae-98628493480d.png', 'Fiberglass', 'Lifetime', '["Ergonomic Curve", "Heat Retention", "Easy Entry", "Stylish Profile"]', '["Premium Comfort", "Sophisticated Design", "Ergonomic Features"]', '3-5 days', 20, true),
('Rectangle Tanning Ledge', 'Clean modern lines with maximum lounging space', 'tanning-ledges', 'rectangular', 'modern', 15000, '/lovable-uploads/c6bebb1e-d2ed-4591-b81d-0af558ed3e52.png', 'Fiberglass', 'Lifetime', '["Modern Design", "Spacious Layout", "Even Depth", "Contemporary Style"]', '["Maximum Space", "Clean Lines", "Modern Appeal"]', '3-5 days', 20, true),
('Semicircle Tanning Ledge', 'Classic half-circle design for intimate relaxation', 'tanning-ledges', 'curved', 'classic', 15000, '/lovable-uploads/b5ea8cde-c5d3-437c-ac83-5ab628dd25f3.png', 'Fiberglass', 'Lifetime', '["Classic Shape", "Intimate Setting", "Smooth Transition", "Timeless Appeal"]', '["Intimate Relaxation", "Classic Design", "Timeless Appeal"]', '3-5 days', 20, true);

-- Insert Spas
INSERT INTO public.products (
  name, description, category, subcategory, type_category, price, image_url, 
  material, warranty_years_text, features_json, benefits, installation_time, stock_quantity, is_active
) VALUES
('Mystic Spa', 'Premium luxury spa with spillover feature option and LED lighting', 'spas', 'premium', 'luxury', 28500, '/lovable-uploads/3bdd9802-26f9-47ab-8498-e0e66344685c.png', 'Fiberglass', 'Lifetime', '["Spillover Option", "LED Lighting", "Premium Jets", "Heater Ready"]', '["Ultimate Luxury", "Therapeutic Benefits", "Premium Experience"]', '3 weeks', 10, true),
('Regal Spa', 'Deluxe spa with therapeutic jets and energy efficient operation', 'spas', 'deluxe', 'therapeutic', 22800, '/lovable-uploads/31da0c59-77d4-4fa1-838b-cb525acd404b.png', 'Fiberglass', 'Lifetime', '["Spillover Option", "Therapeutic Jets", "Easy Controls", "Energy Efficient"]', '["Therapeutic Relief", "Energy Savings", "Easy Operation"]', '3 weeks', 10, true),
('Royal Spa', 'Standard spa with modern design and durable construction', 'spas', 'standard', 'modern', 19500, '/lovable-uploads/62676335-6a09-4389-9a8a-cba74d583c53.png', 'Fiberglass', '10 years', '["Spillover Option", "Modern Design", "Durable Construction", "Low Maintenance"]', '["Modern Appeal", "Durability", "Low Maintenance"]', '2 weeks', 10, true),
('Shafta Spa', 'Compact circular spa with easy entry and unique design', 'spas', 'standard', 'compact', 18200, '/lovable-uploads/1a143a47-5e78-46a8-8172-426b7644bea8.png', 'Fiberglass', '10 years', '["Spillover Option", "Circular Design", "Compact Footprint", "Easy Entry"]', '["Space Efficient", "Unique Design", "Easy Access"]', '2 weeks', 10, true);

-- Insert Automatic Pool Covers
INSERT INTO public.products (
  name, description, category, subcategory, type_category, price, image_url, 
  material, motor_type, warranty_years_text, features_json, benefits, installation_time, stock_quantity, is_active
) VALUES
('Eclipse Pool Cover', 'Advanced safety cover with dual track system and emergency features', 'covers', 'automatic', 'safety', 16000, '/lovable-uploads/1fd97401-223a-4a79-bf65-e7734138513e.png', 'High-grade PVC', 'DC Motor', '10 years', '["Dual track system", "Emergency manual override", "Auto-close sensors", "LED status indicators"]', '["Advanced safety features", "Quiet operation", "Weather resistant"]', '2-3 days', 15, true),
('CS3000 Pool Cover', 'Commercial grade hybrid cover with smart automation', 'covers', 'automatic', 'hybrid', 24000, '/lovable-uploads/5d870105-61a5-4d79-a200-33c70c5ac38f.png', 'Multi-layer vinyl', 'AC Motor', '15 years', '["Smart automation", "Variable speed control", "Weather sensors", "Remote monitoring"]', '["Commercial grade reliability", "Energy efficient", "Low maintenance"]', '3-4 days', 15, true),
('Infinity 4000 Pool Cover', 'Ultimate performance cover with AI-powered automation', 'covers', 'automatic', 'hybrid', 32000, '/lovable-uploads/695627f9-9391-4b1c-babd-a352309fd232.png', 'Premium composite', 'Smart Motor', '20 years', '["AI-powered automation", "Solar integration", "App control", "Predictive maintenance"]', '["Ultimate performance", "Maximum energy savings", "Smart home integration"]', '4-5 days', 15, true),
('Atom Pool Cover', 'Compact thermal cover with quick deployment and temperature control', 'covers', 'automatic', 'thermal', 19000, '/lovable-uploads/91acd1a8-9997-4d59-8c6d-a8635810989b.png', 'Insulated fabric', 'DC Motor', '12 years', '["Compact design", "Quick deployment", "Temperature sensors", "Timer controls"]', '["Space efficient", "Fast operation", "Thermal retention"]', '2-3 days', 15, true);

-- Insert Swimming Pools
INSERT INTO public.products (
  name, description, category, subcategory, type_category, price, image_url, 
  material, warranty_years_text, features_json, benefits, installation_time, stock_quantity, is_active
) VALUES
-- Enchantment Series (Compact)
('Enchantment 9.17', 'Compact fiberglass pool with salt system included and energy efficient design', 'pools', 'compact', 'enchantment', 47900, '/src/assets/pools/latham/enchantment-917.jpg', 'Fiberglass', 'Lifetime', '["Salt system included", "Compact Design", "Energy Efficient", "Carbon Fiber Reinforced"]', '["Perfect for small yards", "Low maintenance", "Energy savings"]', '4 weeks', 5, true),
('Enchantment 9.21', 'Mid-size compact pool with advanced salt water system', 'pools', 'compact', 'enchantment', 54400, '/src/assets/pools/latham/enchantment-921.jpg', 'Fiberglass', 'Lifetime', '["Salt system included", "Compact Design", "Energy Efficient", "Carbon Fiber Reinforced"]', '["Ideal for families", "Low maintenance", "Energy savings"]', '4 weeks', 5, true),
('Enchantment 9.24', 'Largest compact pool with premium features and salt system', 'pools', 'compact', 'enchantment', 60800, '/src/assets/pools/latham/enchantment-924.jpg', 'Fiberglass', 'Lifetime', '["Salt system included", "Compact Design", "Energy Efficient", "Carbon Fiber Reinforced"]', '["Maximum compact space", "Low maintenance", "Energy savings"]', '4 weeks', 5, true),

-- Standard Series
('Milan Pool', 'Classic standard pool perfect for small yards with lifetime warranty', 'pools', 'standard', 'classic', 45300, '/src/assets/pools/latham/genesis.jpg', 'Fiberglass', 'Lifetime', '["Salt system included", "Classic Design", "Perfect for Small Yards", "Carbon Fiber Reinforced"]', '["Timeless design", "Small yard friendly", "Low maintenance"]', '4 weeks', 5, true),
('Jamaica Pool', 'Popular standard size pool with excellent value and durability', 'pools', 'standard', 'popular', 52700, '/src/assets/pools/latham/jamaica.jpg', 'Fiberglass', 'Lifetime', '["Salt system included", "Popular Size", "Great Value", "Carbon Fiber Reinforced"]', '["Excellent value", "Popular dimensions", "Proven design"]', '4 weeks', 5, true),
('Fiji Pool', 'Spacious standard pool ideal for family entertainment', 'pools', 'standard', 'family', 59900, '/src/assets/pools/latham/fiji.jpg', 'Fiberglass', 'Lifetime', '["Salt system included", "Family Size", "Entertainment Ready", "Carbon Fiber Reinforced"]', '["Family entertainment", "Spacious design", "Versatile use"]', '4 weeks', 5, true),
('Cape Cod Pool', 'Traditional design standard pool with timeless appeal', 'pools', 'standard', 'traditional', 59900, '/src/assets/pools/latham/cape-cod.jpg', 'Fiberglass', 'Lifetime', '["Salt system included", "Traditional Design", "Timeless Appeal", "Carbon Fiber Reinforced"]', '["Classic styling", "Timeless design", "Broad appeal"]', '4 weeks', 5, true),

-- Deluxe Series
('Tuscan 11.20', 'Deluxe pool with elegant design and superior construction', 'pools', 'deluxe', 'tuscan', 71800, '/src/assets/pools/latham/tuscan-1120.jpg', 'Fiberglass', 'Lifetime', '["Salt system included", "Elegant Design", "Superior Construction", "Carbon Fiber Reinforced"]', '["Elegant aesthetics", "Premium quality", "Enhanced durability"]', '4-6 weeks', 3, true),
('Tuscan 13.24', 'Mid-size deluxe pool with premium features and styling', 'pools', 'deluxe', 'tuscan', 84200, '/src/assets/pools/latham/tuscan-1324.jpg', 'Fiberglass', 'Lifetime', '["Salt system included", "Premium Features", "Stylish Design", "Carbon Fiber Reinforced"]', '["Premium experience", "Stylish appeal", "Enhanced features"]', '4-6 weeks', 3, true),
('Tuscan 14.27', 'Large deluxe pool offering luxury and spacious design', 'pools', 'deluxe', 'tuscan', 96500, '/src/assets/pools/latham/tuscan-1427.jpg', 'Fiberglass', 'Lifetime', '["Salt system included", "Luxury Features", "Spacious Design", "Carbon Fiber Reinforced"]', '["Luxury experience", "Maximum space", "Premium features"]', '4-6 weeks', 3, true),
('St. Lucia Pool', 'Resort-style deluxe pool with tropical appeal', 'pools', 'deluxe', 'resort', 80600, '/src/assets/pools/latham/st-lucia.jpg', 'Fiberglass', 'Lifetime', '["Salt system included", "Resort Style", "Tropical Appeal", "Carbon Fiber Reinforced"]', '["Resort experience", "Tropical styling", "Vacation feel"]', '4-6 weeks', 3, true),
('Bermuda Pool', 'Sophisticated deluxe pool with refined elegance', 'pools', 'deluxe', 'sophisticated', 83400, '/src/assets/pools/latham/bermuda.jpg', 'Fiberglass', 'Lifetime', '["Salt system included", "Sophisticated Design", "Refined Elegance", "Carbon Fiber Reinforced"]', '["Sophisticated appeal", "Refined styling", "Elegant presence"]', '4-6 weeks', 3, true),
('Valencia Pool', 'Grand deluxe pool with impressive size and luxury features', 'pools', 'deluxe', 'grand', 89900, '/src/assets/pools/latham/valencia.jpg', 'Fiberglass', 'Lifetime', '["Salt system included", "Grand Size", "Luxury Features", "Carbon Fiber Reinforced"]', '["Impressive presence", "Luxury experience", "Grand scale"]', '4-6 weeks', 3, true),

-- Premium Series
('Freeform Beach Entry', 'Premium freeform pool with natural beach entry design', 'pools', 'premium', 'freeform', 125000, '/src/assets/pools/shapes/freeform-beach-entry.jpg', 'Fiberglass', 'Lifetime', '["Salt system included", "Beach Entry", "Freeform Design", "Premium Features", "Carbon Fiber Reinforced"]', '["Natural entry", "Freeform beauty", "Premium experience"]', '6-8 weeks', 2, true),
('L-Shaped Elegant', 'Premium L-shaped pool design for maximum versatility', 'pools', 'premium', 'l-shaped', 135000, '/src/assets/pools/shapes/l-shaped-elegant.jpg', 'Fiberglass', 'Lifetime', '["Salt system included", "L-Shaped Design", "Maximum Versatility", "Premium Features", "Carbon Fiber Reinforced"]', '["Versatile layout", "Elegant design", "Multi-zone use"]', '6-8 weeks', 2, true),
('Geometric Luxury', 'Premium geometric pool with modern luxury design', 'pools', 'premium', 'geometric', 140000, '/src/assets/pools/shapes/geometric-luxury.jpg', 'Fiberglass', 'Lifetime', '["Salt system included", "Geometric Design", "Modern Luxury", "Premium Features", "Carbon Fiber Reinforced"]', '["Modern aesthetics", "Luxury appeal", "Geometric precision"]', '6-8 weeks', 2, true),
('Kidney Spa Modern', 'Premium kidney-shaped pool with integrated spa features', 'pools', 'premium', 'kidney', 118000, '/src/assets/pools/shapes/kidney-spa-modern.jpg', 'Fiberglass', 'Lifetime', '["Salt system included", "Kidney Shape", "Spa Integration", "Modern Design", "Carbon Fiber Reinforced"]', '["Classic kidney shape", "Spa integration", "Modern styling"]', '6-8 weeks', 2, true),
('Synergy Pool', 'Ultimate premium pool with cutting-edge design and features', 'pools', 'premium', 'ultimate', 145000, '/src/assets/pools/latham/synergy.jpg', 'Fiberglass', 'Lifetime', '["Salt system included", "Cutting-edge Design", "Ultimate Features", "Premium Construction", "Carbon Fiber Reinforced"]', '["Ultimate luxury", "Cutting-edge design", "Premium experience"]', '6-8 weeks', 2, true);

-- Update the product count and last sync timestamp
UPDATE public.api_configurations 
SET products_count = (SELECT COUNT(*) FROM public.products WHERE is_active = true),
    last_sync = now(),
    status = 'connected'
WHERE service_name = 'wonderlands_products' OR id = (SELECT id FROM public.api_configurations LIMIT 1);

-- If no api_configurations exist, create one
INSERT INTO public.api_configurations (service_name, service_type, status, products_count, last_sync, is_enabled)
SELECT 'wonderlands_products', 'internal', 'connected', (SELECT COUNT(*) FROM public.products WHERE is_active = true), now(), true
WHERE NOT EXISTS (SELECT 1 FROM public.api_configurations);