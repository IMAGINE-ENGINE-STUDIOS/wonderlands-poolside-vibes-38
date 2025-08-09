-- Update tanning ledge specifications with detailed dimensions, depth, and gallons
UPDATE products 
SET 
  description = 'Premium tanning ledge with 10" depth and approximately 310 gallons capacity',
  features_json = '["10 inch depth", "310 gallon capacity", "Premium construction", "UV resistant", "Non-slip surface"]'::jsonb,
  pricing_options = '{
    "base_price": 4500,
    "finish_options": [
      {"name": "Aquamarine", "price_add": 0, "image": "/src/assets/finishes/aquamarine-g3.jpg"},
      {"name": "Athens Pearl White", "price_add": 150, "image": "/src/assets/finishes/athens-pearl-white-g3.jpg"},
      {"name": "Azure Blue", "price_add": 100, "image": "/src/assets/finishes/azure-blue-g2.jpg"},
      {"name": "Coastal Bronze", "price_add": 200, "image": "/src/assets/finishes/coastal-bronze-g3.jpg"},
      {"name": "Lagoon Blue", "price_add": 100, "image": "/src/assets/finishes/lagoon-blue-g2.jpg"},
      {"name": "Night Sky", "price_add": 250, "image": "/src/assets/finishes/night-sky-g3.jpg"},
      {"name": "Ocean Blue", "price_add": 150, "image": "/src/assets/finishes/ocean-blue-g3.jpg"},
      {"name": "Sapphire Blue", "price_add": 200, "image": "/src/assets/finishes/sapphire-blue-g3.jpg"},
      {"name": "Shale Gray", "price_add": 150, "image": "/src/assets/finishes/shale-gray-g3.jpg"}
    ]
  }'::jsonb
WHERE name = 'Hermosa' AND category = 'Tanning Ledges';

UPDATE products 
SET 
  description = 'Semicircle side tanning ledge with 10" depth and approximately 400 gallons capacity',
  features_json = '["10 inch depth", "400 gallon capacity", "Semicircle design", "Genesis/Synergy compatible", "Premium construction"]'::jsonb,
  pricing_options = '{
    "base_price": 5200,
    "finish_options": [
      {"name": "Aquamarine", "price_add": 0, "image": "/src/assets/finishes/aquamarine-g3.jpg"},
      {"name": "Athens Pearl White", "price_add": 150, "image": "/src/assets/finishes/athens-pearl-white-g3.jpg"},
      {"name": "Azure Blue", "price_add": 100, "image": "/src/assets/finishes/azure-blue-g2.jpg"},
      {"name": "Coastal Bronze", "price_add": 200, "image": "/src/assets/finishes/coastal-bronze-g3.jpg"},
      {"name": "Lagoon Blue", "price_add": 100, "image": "/src/assets/finishes/lagoon-blue-g2.jpg"},
      {"name": "Night Sky", "price_add": 250, "image": "/src/assets/finishes/night-sky-g3.jpg"},
      {"name": "Ocean Blue", "price_add": 150, "image": "/src/assets/finishes/ocean-blue-g3.jpg"},
      {"name": "Sapphire Blue", "price_add": 200, "image": "/src/assets/finishes/sapphire-blue-g3.jpg"},
      {"name": "Shale Gray", "price_add": 150, "image": "/src/assets/finishes/shale-gray-g3.jpg"}
    ]
  }'::jsonb
WHERE name = 'Genesis/Synergy Semicircle Side' AND category = 'Tanning Ledges';

UPDATE products 
SET 
  description = 'Rectangle tanning ledge with 10" depth and approximately 400 gallons capacity',
  features_json = '["10 inch depth", "400 gallon capacity", "Rectangle design", "Versatile placement", "Premium construction"]'::jsonb,
  pricing_options = '{
    "base_price": 5000,
    "finish_options": [
      {"name": "Aquamarine", "price_add": 0, "image": "/src/assets/finishes/aquamarine-g3.jpg"},
      {"name": "Athens Pearl White", "price_add": 150, "image": "/src/assets/finishes/athens-pearl-white-g3.jpg"},
      {"name": "Azure Blue", "price_add": 100, "image": "/src/assets/finishes/azure-blue-g2.jpg"},
      {"name": "Coastal Bronze", "price_add": 200, "image": "/src/assets/finishes/coastal-bronze-g3.jpg"},
      {"name": "Lagoon Blue", "price_add": 100, "image": "/src/assets/finishes/lagoon-blue-g2.jpg"},
      {"name": "Night Sky", "price_add": 250, "image": "/src/assets/finishes/night-sky-g3.jpg"},
      {"name": "Ocean Blue", "price_add": 150, "image": "/src/assets/finishes/ocean-blue-g3.jpg"},
      {"name": "Sapphire Blue", "price_add": 200, "image": "/src/assets/finishes/sapphire-blue-g3.jpg"},
      {"name": "Shale Gray", "price_add": 150, "image": "/src/assets/finishes/shale-gray-g3.jpg"}
    ]
  }'::jsonb
WHERE name = 'Rectangle' AND category = 'Tanning Ledges';

UPDATE products 
SET 
  description = 'Semicircle tanning ledge with 10" depth and approximately 250 gallons capacity',
  features_json = '["10 inch depth", "250 gallon capacity", "Semicircle design", "Compact footprint", "Premium construction"]'::jsonb,
  pricing_options = '{
    "base_price": 4200,
    "finish_options": [
      {"name": "Aquamarine", "price_add": 0, "image": "/src/assets/finishes/aquamarine-g3.jpg"},
      {"name": "Athens Pearl White", "price_add": 150, "image": "/src/assets/finishes/athens-pearl-white-g3.jpg"},
      {"name": "Azure Blue", "price_add": 100, "image": "/src/assets/finishes/azure-blue-g2.jpg"},
      {"name": "Coastal Bronze", "price_add": 200, "image": "/src/assets/finishes/coastal-bronze-g3.jpg"},
      {"name": "Lagoon Blue", "price_add": 100, "image": "/src/assets/finishes/lagoon-blue-g2.jpg"},
      {"name": "Night Sky", "price_add": 250, "image": "/src/assets/finishes/night-sky-g3.jpg"},
      {"name": "Ocean Blue", "price_add": 150, "image": "/src/assets/finishes/ocean-blue-g3.jpg"},
      {"name": "Sapphire Blue", "price_add": 200, "image": "/src/assets/finishes/sapphire-blue-g3.jpg"},
      {"name": "Shale Gray", "price_add": 150, "image": "/src/assets/finishes/shale-gray-g3.jpg"}
    ]
  }'::jsonb
WHERE name = 'Semicircle' AND category = 'Tanning Ledges';

-- Update all spa products to include finish options
UPDATE products 
SET pricing_options = jsonb_set(
  COALESCE(pricing_options, '{}'::jsonb),
  '{finish_options}',
  '[
    {"name": "Aquamarine", "price_add": 0, "image": "/src/assets/finishes/aquamarine-g3.jpg"},
    {"name": "Athens Pearl White", "price_add": 150, "image": "/src/assets/finishes/athens-pearl-white-g3.jpg"},
    {"name": "Azure Blue", "price_add": 100, "image": "/src/assets/finishes/azure-blue-g2.jpg"},
    {"name": "Coastal Bronze", "price_add": 200, "image": "/src/assets/finishes/coastal-bronze-g3.jpg"},
    {"name": "Lagoon Blue", "price_add": 100, "image": "/src/assets/finishes/lagoon-blue-g2.jpg"},
    {"name": "Night Sky", "price_add": 250, "image": "/src/assets/finishes/night-sky-g3.jpg"},
    {"name": "Ocean Blue", "price_add": 150, "image": "/src/assets/finishes/ocean-blue-g3.jpg"},
    {"name": "Sapphire Blue", "price_add": 200, "image": "/src/assets/finishes/sapphire-blue-g3.jpg"},
    {"name": "Shale Gray", "price_add": 150, "image": "/src/assets/finishes/shale-gray-g3.jpg"}
  ]'::jsonb
)
WHERE category = 'Spas';