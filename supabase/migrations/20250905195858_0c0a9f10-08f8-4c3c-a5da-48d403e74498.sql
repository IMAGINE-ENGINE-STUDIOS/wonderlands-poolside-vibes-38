-- Add Belgard Products Database to existing products table

-- Concrete Pavers & Slabs
INSERT INTO products (name, category, subcategory, collection_name, description, price, image_url, features_json, brand, is_active) VALUES
('Cambridge Cobble® Pavers', 'pavers', 'concrete_pavers', 'Heritage', 'The versatile Cambridge Cobble offers a tailored, architectural look with gently rounded corners and a domed pillow-top surface. The subtle color combinations and multiple pattern options make it ideal for crafting intricate designs.', 8.50, '/public/lovable-uploads/cambridge-cobble.jpg', '["3-piece system", "Domed pillow-top surface", "Multiple pattern options", "Gently rounded corners"]', 'Belgard', true),

('Antiqued Flat Top Paver', 'pavers', 'concrete_pavers', 'Classic', 'Antiqued Flat Top offers an antiqued cut-stone face combined with modern lines for a stylish look.', 7.25, '/public/lovable-uploads/antiqued-flat-top.jpg', '["Weathered stone face", "Smooth-cut design", "Modern lines", "Stylish appearance"]', 'Belgard', true),

('Appian-Stone® Paver', 'pavers', 'concrete_pavers', 'Heritage', 'Named for Europe''s famous Appian Way, these pavers give your hardscape a natural look and feel that evokes another age.', 9.75, '/public/lovable-uploads/appian-stone.jpg', '["Round-topped design", "Ancient Roman inspired", "Natural stone look", "Historical aesthetic"]', 'Belgard', true),

-- Permeable & Grid Pavers
('Aqua Dublin®', 'pavers', 'permeable_pavers', 'Environmental', 'Classic look of cut stone together with permeable technology in our Environmental Collection of paver systems that reduce water run-off.', 12.50, '/public/lovable-uploads/aqua-dublin.jpg', '["Permeable technology", "Cut stone look", "Reduces water run-off", "Environmental collection"]', 'Belgard', true),

('Aqua-Bric®', 'pavers', 'permeable_pavers', 'Environmental', 'Basic in form, with a clean, modular shape, Aqua-Bric permeable pavers are an attractive, yet practical choice.', 10.25, '/public/lovable-uploads/aqua-bric.jpg', '["Clean modular shape", "Permeable design", "Attractive and practical", "Basic form"]', 'Belgard', true),

('Aqualine™ Series', 'pavers', 'permeable_pavers', 'Environmental', 'Aqualine permeable pavers work equally well for pedestrian and vehicular applications.', 14.75, '/public/lovable-uploads/aqualine.jpg', '["Thin permeable design", "Pedestrian applications", "Vehicular loads", "Versatile use"]', 'Belgard', true),

-- Porcelain Pavers (Tiles)
('Glocal Porcelain Paver', 'pavers', 'porcelain_pavers', 'Porcelain', 'New porcelain stoneware collection in a smooth concrete-like finish.', 22.50, '/public/lovable-uploads/glocal-porcelain.jpg', '["Porcelain stoneware", "Smooth concrete finish", "High-end surface", "Pool deck suitable"]', 'Belgard', true),

('Lagoon Porcelain Paver', 'pavers', 'porcelain_pavers', 'Porcelain', 'Detail and depth of color evoke the expressive power of nature.', 24.75, '/public/lovable-uploads/lagoon-porcelain.jpg', '["Natural color depth", "Expressive design", "Nature-inspired", "Premium porcelain"]', 'Belgard', true),

('Noon Porcelain Paver', 'pavers', 'porcelain_pavers', 'Porcelain', 'Combines the warmth of natural wood with glossy wood elegance and all the technical characteristics of porcelain stoneware.', 26.50, '/public/lovable-uploads/noon-porcelain.jpg', '["Wood-look design", "Glossy finish", "Porcelain stoneware", "Technical characteristics"]', 'Belgard', true),

-- Wall Systems (Retaining Walls)
('AB Europa® Collection', 'retaining_walls', 'heritage_walls', 'AB Collection', 'Offers an infinite number of ways to capture the rich, hand-laid stone effect.', 15.25, '/public/lovable-uploads/ab-europa.jpg', '["Heritage-style block", "Hand-laid stone effect", "Infinite design options", "Rich appearance"]', 'Belgard', true),

('AB Metropolitan™', 'retaining_walls', 'contemporary_walls', 'AB Collection', 'Contemporary, sleek and smooth retaining wall block.', 16.75, '/public/lovable-uploads/ab-metropolitan.jpg', '["Contemporary design", "Sleek and smooth", "Modern aesthetic", "Clean lines"]', 'Belgard', true),

('AB Aztec®', 'retaining_walls', 'textured_walls', 'AB Collection', 'Inspired by the walls in Cusco, Peru which are more than 500 years old.', 17.50, '/public/lovable-uploads/ab-aztec.jpg', '["Chiseled-edge block", "Ancient wall inspired", "500+ year history", "Textured finish"]', 'Belgard', true),

('Belair Wall®', 'retaining_walls', 'versatile_walls', 'Belair Collection', 'Belair Wall offers the sophisticated appearance of chiseled stone and is ideal for a variety of landscaping uses, as well as constructing outdoor living rooms, fire features and kitchens.', 18.25, '/public/lovable-uploads/belair-wall.jpg', '["Chiseled stone appearance", "Multiple uses", "Outdoor living rooms", "Fire features compatible"]', 'Belgard', true),

-- Caps & Edgers
('Anchor™ Seat Wall Caps', 'accessories', 'caps_edgers', 'Anchor Collection', 'Create stylish seat walls by capping retaining wall block with the Anchor Seat Wall Cap, which features integrated color throughout each unit and the natural look and texture of chiseled stone.', 25.50, '/public/lovable-uploads/anchor-caps.jpg', '["Seat wall caps", "Integrated color", "Chiseled stone texture", "Natural appearance"]', 'Belgard', true),

('Anglia Edger®', 'accessories', 'caps_edgers', 'Anglia Collection', 'A natural chiseled finish and tapered ends accentuate the natural texture and flexibility of the Anglia Edger, complements driveways, patios, walking paths and small planting areas.', 12.75, '/public/lovable-uploads/anglia-edger.jpg', '["Natural chiseled finish", "Tapered ends", "Flexible design", "Multiple applications"]', 'Belgard', true),

('Esplanade Coping & Wall Cap', 'accessories', 'caps_edgers', 'Esplanade Collection', 'Esplanade Coping & Wall Cap is the perfect accessory for finishing walls and steps, with a natural stone appearance.', 22.50, '/public/lovable-uploads/esplanade-coping.jpg', '["Wall finishing", "Step compatible", "Natural stone look", "Perfect accessory"]', 'Belgard', true),

-- Outdoor Kitchens & Fireplaces
('Bordeaux™ Outdoor Fireplace', 'outdoor_kitchen', 'fireplaces', 'Bordeaux Series', 'Create stylish outdoor living spaces with the Bordeaux™ Series, which features a timeless stacked stone design with smooth cast stone accents. Outfit your outdoor living room with this striking stacked stone outdoor fireplace.', 2850.00, '/public/lovable-uploads/bordeaux-fireplace.jpg', '["Stacked stone design", "Cast stone accents", "Modular kit", "Outdoor living"]', 'Belgard', true),

('Bordeaux™ Outdoor Kitchen', 'outdoor_kitchen', 'kitchens', 'Bordeaux Series', 'Create a beautiful outdoor stacked stone kitchen with the Bordeaux™ Series modular components featuring timeless stacked stone design with smooth cast stone accents.', 4250.00, '/public/lovable-uploads/bordeaux-kitchen.jpg', '["Modular components", "Stacked stone", "Cast stone accents", "Complete kitchen"]', 'Belgard', true),

('Melville™ Outdoor Fireplace', 'outdoor_kitchen', 'fireplaces', 'Melville Series', 'Melville™ Series offers smooth face and clean lines for a contemporary look that complements any architectural style.', 3150.00, '/public/lovable-uploads/melville-fireplace.jpg', '["Contemporary design", "Smooth face", "Clean lines", "Architectural style"]', 'Belgard', true),

('Melville™ Outdoor Kitchen', 'outdoor_kitchen', 'kitchens', 'Melville Series', 'Contemporary modular outdoor kitchen with smooth face and clean lines for a modern look that complements any architectural style.', 4650.00, '/public/lovable-uploads/melville-kitchen.jpg', '["Contemporary modular", "Smooth face", "Clean lines", "Modern style"]', 'Belgard', true),

-- Fire Pit Kits
('Melville™ Fire Pit Kit', 'fire_place', 'fire_pits', 'Melville Series', 'Pre-packaged fire pit kit with wedge-shaped blocks to perfectly complement our Melville Series of walls and outdoor features.', 850.00, '/public/lovable-uploads/melville-fire-pit.jpg', '["Pre-packaged kit", "Wedge-shaped blocks", "Melville compatible", "Easy assembly"]', 'Belgard', true),

('Weston Stone™ Fire Pit Kit', 'fire_place', 'fire_pits', 'Weston Collection', 'The Weston Stone™ Fire Pit offers the look of tumbled stone and is a more contemporary alternative to our rustic or textured-stone fire pits.', 925.00, '/public/lovable-uploads/weston-fire-pit.jpg', '["Tumbled stone look", "Contemporary design", "Textured finish", "Modern alternative"]', 'Belgard', true),

('Artisan® Cast Stone Fire Pit Kit', 'fire_place', 'fire_pits', 'Artisan Collection', 'Cast-stone look round fire pit with sophisticated appearance and easy assembly.', 1050.00, '/public/lovable-uploads/artisan-fire-pit.jpg', '["Cast stone look", "Round design", "Sophisticated appearance", "Easy assembly"]', 'Belgard', true),

-- Pergolas & Panels
('Pergola 8×8 Aluminum', 'pergolas', 'pergola_systems', 'Modern Collection', 'The 8×8 aluminum Pergola is a modern twist on traditional wood pergolas offering both form and function. Easy to assemble and install, the Pergola features a durable premium matte black powder coat. Customize by adding any of our Decorative Screen Panels.', 1850.00, '/public/lovable-uploads/pergola-8x8.jpg', '["8x8 aluminum construction", "Matte black powder coat", "Easy assembly", "Customizable panels"]', 'Belgard', true),

('Decorative Screen Panels - Optic', 'pergolas', 'privacy_panels', 'Screen Collection', 'Aluminum privacy and decorative screen panels with modern Optic pattern design.', 285.00, '/public/lovable-uploads/screen-optic.jpg', '["Aluminum construction", "Privacy screen", "Optic pattern", "Decorative design"]', 'Belgard', true),

('Decorative Screen Panels - Freesia', 'pergolas', 'privacy_panels', 'Screen Collection', 'Aluminum privacy and decorative screen panels with elegant Freesia pattern design.', 295.00, '/public/lovable-uploads/screen-freesia.jpg', '["Aluminum construction", "Privacy screen", "Freesia pattern", "Elegant design"]', 'Belgard', true),

-- BBQ & Outdoor Kitchen Components
('Outdoor Kitchen Island Base', 'BBQ', 'kitchen_components', 'Elements Collection', 'Modular outdoor kitchen island base compatible with various grill inserts and countertop options.', 1250.00, '/public/lovable-uploads/kitchen-island-base.jpg', '["Modular design", "Grill compatible", "Multiple countertop options", "Durable construction"]', 'Belgard', true),

('Built-in Grill Surround', 'BBQ', 'grill_components', 'Elements Collection', 'Professional built-in grill surround with heat-resistant materials and contemporary design.', 850.00, '/public/lovable-uploads/grill-surround.jpg', '["Heat-resistant materials", "Professional grade", "Contemporary design", "Built-in compatible"]', 'Belgard', true),

-- Outdoor Furniture
('Concrete Outdoor Bench', 'Outdoor Furniture', 'seating', 'Garden Collection', 'Durable concrete outdoor bench with natural stone texture and weather-resistant finish.', 425.00, '/public/lovable-uploads/concrete-bench.jpg', '["Concrete construction", "Natural stone texture", "Weather-resistant", "Durable finish"]', 'Belgard', true),

('Modular Outdoor Seating System', 'Outdoor Furniture', 'seating', 'Modern Collection', 'Contemporary modular seating system with concrete base and optional cushions.', 685.00, '/public/lovable-uploads/modular-seating.jpg', '["Modular system", "Concrete base", "Optional cushions", "Contemporary style"]', 'Belgard', true),

-- Landscaping
('Decorative Stone Planters', 'landscaping', 'planters', 'Garden Collection', 'Large decorative stone planters perfect for creating focal points in outdoor spaces.', 185.00, '/public/lovable-uploads/stone-planters.jpg', '["Decorative stone", "Large capacity", "Focal point design", "Outdoor spaces"]', 'Belgard', true),

('Landscape Edging System', 'landscaping', 'edging', 'Border Collection', 'Professional landscape edging system for clean garden borders and pathway definition.', 8.50, '/public/lovable-uploads/landscape-edging.jpg', '["Professional system", "Clean borders", "Pathway definition", "Easy installation"]', 'Belgard', true),

-- Garden
('Raised Garden Bed Kit', 'garden', 'garden_beds', 'Garden Collection', 'Complete raised garden bed kit with modular concrete blocks for easy assembly.', 165.00, '/public/lovable-uploads/garden-bed-kit.jpg', '["Complete kit", "Modular blocks", "Easy assembly", "Concrete construction"]', 'Belgard', true),

('Garden Wall System', 'garden', 'garden_walls', 'Garden Collection', 'Low garden wall system perfect for defining planting areas and creating terraced gardens.', 12.75, '/public/lovable-uploads/garden-wall.jpg', '["Low wall system", "Planting area definition", "Terraced design", "Garden compatible"]', 'Belgard', true),

-- Decor
('Decorative Concrete Spheres', 'decor', 'sculptures', 'Art Collection', 'Modern decorative concrete spheres in various sizes for landscape accent pieces.', 125.00, '/public/lovable-uploads/concrete-spheres.jpg', '["Various sizes", "Landscape accent", "Modern design", "Concrete construction"]', 'Belgard', true),

('Outdoor Water Feature Base', 'decor', 'water_features', 'Elements Collection', 'Elegant concrete base designed specifically for outdoor water features and fountains.', 385.00, '/public/lovable-uploads/water-feature-base.jpg', '["Water feature base", "Fountain compatible", "Elegant design", "Outdoor rated"]', 'Belgard', true);