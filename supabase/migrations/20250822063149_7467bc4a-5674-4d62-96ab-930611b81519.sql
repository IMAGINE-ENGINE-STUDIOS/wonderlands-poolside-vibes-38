-- Insert sample products for new categories that don't have existing products

-- Engines/Pool Equipment
INSERT INTO public.products (name, category, subcategory, price, description, image_url, brand, stock_quantity, is_active, features_json) VALUES
('AquaPro Variable Speed Pump', 'engines', 'pumps', 1899, 'Energy-efficient variable speed pool pump with digital controls', '/lovable-uploads/4511f6d7-594e-4c22-bd69-221e519f2f34.png', 'AquaPro', 15, true, '["Variable Speed Control", "Energy Star Certified", "Digital Display", "Self-Priming"]'),
('HydroMax Circulation System', 'engines', 'circulation', 2499, 'Advanced pool circulation system with smart monitoring', '/lovable-uploads/56fd62de-130b-4b90-98a0-596007f5dadb.png', 'HydroMax', 8, true, '["Smart Monitoring", "App Control", "Low Maintenance", "Quiet Operation"]'),
('FlowMaster Pool Filter', 'engines', 'filtration', 899, 'High-performance sand filter for crystal clear water', '/lovable-uploads/75602748-6f43-4f81-9cbe-a3e8c81db8d4.png', 'FlowMaster', 20, true, '["Multi-Port Valve", "Easy Backwash", "Corrosion Resistant", "High Flow Rate"]'),

-- Outdoor Furniture
INSERT INTO public.products (name, category, subcategory, price, description, image_url, brand, stock_quantity, is_active, features_json) VALUES
('Paradise Poolside Lounge Set', 'furniture', 'seating', 2299, 'Premium teak lounge chairs with weather-resistant cushions', '/wonderlands-branding/96a7bfbb-d930-451c-a0cd-1d8297bb7512.png', 'Paradise', 12, true, '["Teak Wood Frame", "Weather Resistant", "Adjustable Backrest", "UV Protected Fabric"]'),
('Sunset Dining Collection', 'furniture', 'dining', 3499, 'Complete outdoor dining set for poolside entertaining', '/lovable-uploads/57670513-84aa-4ae5-86ee-6a95737004b5.png', 'Sunset', 6, true, '["8-Person Capacity", "Aluminum Frame", "Tempered Glass Top", "Matching Umbrella"]'),
('Oasis Bar Cart', 'furniture', 'accessories', 899, 'Mobile bar cart perfect for poolside cocktails', '/wonderlands-branding/2ad9f663-7ae0-4ea4-8ae6-cf232b78f58e.png', 'Oasis', 18, true, '["Stainless Steel", "Locking Wheels", "Ice Bucket", "Bottle Storage"]'),

-- Fire Features
INSERT INTO public.products (name, category, subcategory, price, description, image_url, brand, stock_quantity, is_active, features_json) VALUES
('Eternal Flame Fire Pit', 'fireplace', 'fire-pits', 1599, 'Gas-powered fire pit with stunning flame effects', '/lovable-uploads/ed2e7763-9e47-4400-9fee-f7dff2ccb0ee.png', 'Eternal', 10, true, '["Natural Gas/Propane", "Weather Resistant", "Auto Ignition", "Safety Shutoff"]'),
('Poolside Fire Bowl', 'fireplace', 'fire-bowls', 2199, 'Elegant copper fire bowl for ambiance', '/lovable-uploads/eaf313f5-2a7b-4b5e-a94b-da9d4104de79.png', 'Poolside', 8, true, '["Hand-Hammered Copper", "Wind Guard", "Lava Rock Included", "Remote Control"]'),

-- Outdoor Kitchens
INSERT INTO public.products (name, category, subcategory, price, description, image_url, brand, stock_quantity, is_active, features_json) VALUES
('ChefMaster Outdoor Kitchen Island', 'outdoor-kitchens', 'islands', 8999, 'Complete outdoor kitchen with grill, sink, and storage', '/lovable-uploads/9382c72a-0c7d-4981-8f03-878d568dd1b2.png', 'ChefMaster', 3, true, '["Built-in Grill", "Stainless Steel Sink", "Refrigerator Space", "Granite Countertop"]'),
('Bistro Prep Station', 'outdoor-kitchens', 'prep-stations', 3299, 'Compact outdoor prep station with all essentials', '/lovable-uploads/9acbe973-a637-476f-bd20-bf7493afcc0c.png', 'Bistro', 7, true, '["Cutting Board", "Storage Drawers", "Towel Rack", "Weather Protection"]'),

-- BBQ & Grills
INSERT INTO public.products (name, category, subcategory, price, description, image_url, brand, stock_quantity, is_active, features_json) VALUES
('GrillMaster Pro Series', 'bbq', 'gas-grills', 2799, 'Professional-grade gas grill with smart temperature control', '/lovable-uploads/a1b42616-0c25-4010-96e3-3fbeba18aae8.png', 'GrillMaster', 12, true, '["Smart Temperature Control", "6 Burners", "Rotisserie Kit", "Side Burner"]'),
('Smokehaus Charcoal Smoker', 'bbq', 'smokers', 1899, 'Traditional charcoal smoker for authentic BBQ flavor', '/lovable-uploads/a345878e-c014-4929-9e9b-bcb675d02e66.png', 'Smokehaus', 8, true, '["Heavy-Duty Steel", "Temperature Gauge", "Large Cooking Area", "Ash Pan"]'),

-- Pergolas & Shade
INSERT INTO public.products (name, category, subcategory, price, description, image_url, brand, stock_quantity, is_active, features_json) VALUES
('ShadeMaster Pergola Kit', 'pergolas', 'pergolas', 4599, 'Premium cedar pergola kit with retractable canopy', '/lovable-uploads/a91d91f2-51f8-470c-9894-4a1cf8b1f2c0.png', 'ShadeMaster', 5, true, '["Cedar Construction", "Retractable Canopy", "Easy Assembly", "Weather Resistant"]'),
('Cabana Paradise Gazebo', 'pergolas', 'gazebos', 3299, 'Elegant gazebo with mosquito netting and curtains', '/lovable-uploads/b1abd5c3-af2e-46fa-82be-5db27d20a388.png', 'Cabana', 4, true, '["Mosquito Netting", "Privacy Curtains", "Aluminum Frame", "Wind Resistant"]'),

-- Sound Systems
INSERT INTO public.products (name, category, subcategory, price, description, image_url, brand, stock_quantity, is_active, features_json) VALUES
('AquaSound Wireless Speaker System', 'sound-system', 'wireless', 899, 'Waterproof Bluetooth speakers designed for poolside use', '/lovable-uploads/b5ea8cde-c5d3-437c-ac83-5ab628dd25f3.png', 'AquaSound', 25, true, '["Waterproof IP67", "Bluetooth 5.0", "12-Hour Battery", "360° Sound"]'),
('PoolBeats Subwoofer System', 'sound-system', 'subwoofers', 1599, 'Underground subwoofer system for pool areas', '/lovable-uploads/b6d63246-ec6b-4137-9b83-6fe99f232ba3.png', 'PoolBeats', 15, true, '["Underground Install", "Weather Resistant", "Deep Bass", "App Control"]'),
('Harmony Pool Audio Package', 'sound-system', 'packages', 2499, 'Complete audio system with multiple zones', '/lovable-uploads/b871f521-8e15-4ed4-ad20-1a3774f535cd.png', 'Harmony', 8, true, '["Multi-Zone Control", "In-Wall Speakers", "Amplifier Included", "Remote Control"]');