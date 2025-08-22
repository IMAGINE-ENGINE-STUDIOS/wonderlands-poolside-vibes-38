-- Clear and re-populate all product tables with exact front-page data

-- First, clear existing data
DELETE FROM pools WHERE TRUE;
DELETE FROM products WHERE category IN ('spa', 'liner', 'tile', 'tanning_ledge', 'finish') OR subcategory IN ('spa', 'liner', 'tile', 'tanning_ledge', 'finish');

-- Insert exact pool data from front page
INSERT INTO pools (model, category, price, dimensions, depth, image_url, features, warranty_years, installation_time_weeks, heater, salt_system, carbon_fiber, finishes, liners, covers, is_active) VALUES
-- Enchantment Series
('Enchantment 9.17', 'compact', 47900, '9′ 1″ × 17′ 5″', '~4′ 9″', '/lovable-uploads/d7541cc8-f254-4f85-b6ee-f636a8726dcc.png', ARRAY['Salt system included in final price', 'Compact Design', 'Energy Efficient'], 'Lifetime', 4, false, true, true, ARRAY[], ARRAY[], ARRAY[], true),
('Enchantment 9.21', 'compact', 54400, '9′ 1″ × 20′ 7″', '~4′ 9″', '/lovable-uploads/63844c0c-04e6-4628-ad09-1b98c9283cf0.png', ARRAY['Salt system included in final price', 'Compact Design', 'Energy Efficient'], 'Lifetime', 4, false, true, true, ARRAY[], ARRAY[], ARRAY[], true),
('Enchantment 9.24', 'compact', 60800, '9′ 1″ × 23′ 10″', '~4′ 9″', '/lovable-uploads/749a82f6-561b-4f6b-982b-d343dfac9565.png', ARRAY['Salt system included in final price', 'Compact Design', 'Energy Efficient'], 'Lifetime', 4, false, true, true, ARRAY[], ARRAY[], ARRAY[], true),

-- Standard Series  
('Milan', 'standard', 45300, '10′ × 16′', '4′', '/lovable-uploads/121eda70-3d05-4624-afb0-5dba766d8b2f.png', ARRAY['Salt system included in final price', 'Classic Design', 'Perfect for Small Yards'], 'Lifetime', 4, false, true, true, ARRAY[], ARRAY[], ARRAY[], true),
('Jamaica', 'standard', 46100, '10′ × 20′', '3′ 2″ – 5′', '/lovable-uploads/e2d562f0-9a55-4293-8a9f-26d9b09ebf15.png', ARRAY['Salt system included in final price', 'Family Friendly', 'Shallow End'], 'Lifetime', 4, false, true, true, ARRAY[], ARRAY[], ARRAY[], true),
('Aruba', 'standard', 51300, '11′ × 22′', '3′ 6″ – 5′', '/lovable-uploads/ac53cd88-15e9-4f8a-a3c4-2cd4415b0ec5.png', ARRAY['Salt system included in final price', 'Mid-Size Pool', 'Great for Swimming'], 'Lifetime', 4, false, true, true, ARRAY[], ARRAY[], ARRAY[], true),
('Pleasant Cove', 'standard', 51300, '11′ × 22′', '3′ 6″ – 5′ 6″', '/lovable-uploads/997efdd7-a754-4836-98ac-05c5e9abaf0b.png', ARRAY['Salt system included in final price', 'Elegant Design', 'Versatile Depth'], 'Lifetime', 4, false, true, true, ARRAY[], ARRAY[], ARRAY[], true),

-- Tuscan Series
('Tuscan 11.20', 'deluxe', 56600, '11′ 1″ × 20′ 3″', '3′ 11″ – 5′ 2″', '/lovable-uploads/579d34e1-ef64-4134-bf8b-dff4980bb17a.png', ARRAY['Salt system included in final price', 'Tuscan Design', 'Premium Finish'], 'Lifetime', 5, false, true, true, ARRAY[], ARRAY[], ARRAY[], true),
('Tuscan 13.24', 'deluxe', 69400, '12′ 10″ × 23′ 7″', '3′ 11″ – 5′ 5″', '/lovable-uploads/2677d17d-ba82-407b-896c-b4b3e238b8d5.png', ARRAY['Salt system included in final price', 'Tuscan Design', 'Premium Finish'], 'Lifetime', 5, false, true, true, ARRAY[], ARRAY[], ARRAY[], true),
('Tuscan 14.27', 'deluxe', 80000, '13′ 9″ × 26′ 10″', '3′ 11″ – 5′ 9″', '/lovable-uploads/de3068d3-0f04-4a3c-a2ed-f52141f36b3e.png', ARRAY['Salt system included in final price', 'Tuscan Design', 'Premium Finish'], 'Lifetime', 5, false, true, true, ARRAY[], ARRAY[], ARRAY[], true),
('Tuscan 14.30', 'deluxe', 88200, '13′ 9″ × 30′ 1″', '3′ 11″ – 5′ 11″', '/lovable-uploads/d1c952c1-8786-444d-b405-903533bc20d1.png', ARRAY['Salt system included in final price', 'Tuscan Design', 'Premium Finish'], 'Lifetime', 5, false, true, true, ARRAY[], ARRAY[], ARRAY[], true),
('Tuscan 14.40', 'deluxe', 111000, '13′ 9″ × 39′ 11″', '3′ 7″ – 6′ 2″', '/lovable-uploads/c1225a37-626d-49a2-9ec4-eb0da0f10060.png', ARRAY['Salt system included in final price', 'Tuscan Design', 'Premium Finish'], 'Lifetime', 6, false, true, true, ARRAY[], ARRAY[], ARRAY[], true),

-- Premium/Deluxe Series
('St. Lucia', 'deluxe', 56800, '12′ × 24′', '3′ 6″ – 5′', '/lovable-uploads/03b6750e-bed3-41df-abcb-6657d36cfa62.png', ARRAY['Salt system included in final price', 'Caribbean Inspired', 'Perfect for Families'], 'Lifetime', 5, false, true, true, ARRAY[], ARRAY[], ARRAY[], true),
('Delray', 'deluxe', 59300, '12′ × 25′', '~4′ 6″', '/lovable-uploads/f549e4e8-647d-4b21-8d48-441f83955c73.png', ARRAY['Salt system included in final price', 'Modern Design', 'Consistent Depth'], 'Lifetime', 5, false, true, true, ARRAY[], ARRAY[], ARRAY[], true),
('Java', 'deluxe', 60000, '12′ × 27′', '3′ 6″ – 5′ 6″', '/lovable-uploads/bca99a48-ba6b-42d0-96d0-bf5ecfc2e4fd.png', ARRAY['Salt system included in final price', 'Sleek Design', 'Great for Lap Swimming'], 'Lifetime', 5, false, true, true, ARRAY[], ARRAY[], ARRAY[], true),
('Bermuda', 'deluxe', 61500, '12′ × 26′', '3′ 6″ – 5′ 6″', '/lovable-uploads/311a7002-2a40-4c59-a143-9f0236ece5d4.png', ARRAY['Salt system included in final price', 'Island Style', 'Relaxing Design'], 'Lifetime', 5, false, true, true, ARRAY[], ARRAY[], ARRAY[], true),
('Key West', 'deluxe', 64300, '12′ × 25′ 7″', '3′ 7″ – 6′', '/lovable-uploads/4e43c832-af03-4cf4-9104-0117e5f3321c.png', ARRAY['Salt system included in final price', 'Tropical Design', 'Deep End Swimming'], 'Lifetime', 5, false, true, true, ARRAY[], ARRAY[], ARRAY[], true),
('Valencia', 'deluxe', 65500, '14′ 6″ × 28′', '3′ 7″ – 5′ 10″', '/lovable-uploads/d8c4a7c6-4bbe-481d-8a47-5d7feecb1861.png', ARRAY['Salt system included in final price', 'Spanish Style', 'Large Swimming Area'], 'Lifetime', 5, false, true, true, ARRAY[], ARRAY[], ARRAY[], true),
('Vista Isle', 'premium', 70000, '12′ × 28′ 6″', '3′ 6″ – 5′ 10″', '/lovable-uploads/6a41df5e-d6f6-4e49-aa1a-b457ac1902a0.png', ARRAY['Salt system included in final price', 'Panoramic Design', 'Extended Length'], 'Lifetime', 6, false, true, true, ARRAY[], ARRAY[], ARRAY[], true),

-- Corinthian Series
('Corinthian 12', 'premium', 75400, '12′ × 25′', '3′ 6″ – 5′ 5″', '/lovable-uploads/221a9844-ee7c-4fe3-b421-a9fe99bccabf.png', ARRAY['Salt system included in final price', 'Classical Design', 'Premium Materials'], 'Lifetime', 6, false, true, true, ARRAY[], ARRAY[], ARRAY[], true),
('Corinthian 12 BME', 'premium', 79400, '12′ × 25′', '3′ 6″ – 5′ 5″', '/lovable-uploads/86678699-3f2c-4863-8a81-d8c63721e03c.png', ARRAY['Salt system included in final price', 'Beach Modified Entry', 'Classical Design'], 'Lifetime', 6, false, true, true, ARRAY[], ARRAY[], ARRAY[], true),
('Corinthian 14', 'premium', 94500, '14′ × 30′', '3′ 6″ – 6′', '/lovable-uploads/3ae37221-0f97-48df-addd-632c423868e2.png', ARRAY['Salt system included in final price', 'Classical Design', 'Premium Materials'], 'Lifetime', 6, false, true, true, ARRAY[], ARRAY[], ARRAY[], true),
('Corinthian 14 BME', 'premium', 98500, '14′ × 30′', '3′ 6″ – 6′', '/lovable-uploads/a345878e-c014-4929-9e9b-bcb675d02e66.png', ARRAY['Salt system included in final price', 'Beach Modified Entry', 'Classical Design'], 'Lifetime', 6, false, true, true, ARRAY[], ARRAY[], ARRAY[], true),

-- Olympia Series
('Olympia 12', 'premium', 76300, '12′ × 26′', '3′ 6″ – 5′ 6″', '/lovable-uploads/0aa90de6-b1eb-43a4-91ec-10c05388c900.png', ARRAY['Salt system included in final price', 'Olympic Inspired', 'Performance Design'], 'Lifetime', 6, false, true, true, ARRAY[], ARRAY[], ARRAY[], true),
('Olympia 14', 'premium', 96400, '14′ × 30′', '3′ 6″ – 6′', '/lovable-uploads/d707c6e1-8471-404f-9312-bd6773152617.png', ARRAY['Salt system included in final price', 'Olympic Inspired', 'Performance Design'], 'Lifetime', 6, false, true, true, ARRAY[], ARRAY[], ARRAY[], true),

-- Large Premium Series
('Bay Isle', 'premium', 80400, '14′ 6″ × 30′', '3′ – 6′ 6″', '/lovable-uploads/a91d91f2-51f8-470c-9894-4a1cf8b1f2c0.png', ARRAY['Salt system included in final price', 'Beach Entry', 'Large Swimming Area'], 'Lifetime', 6, false, true, true, ARRAY[], ARRAY[], ARRAY[], true),
('Laguna', 'premium', 82600, '14′ × 30′', '3′ 6″ – 6′', '/lovable-uploads/ee464b25-683d-4367-a208-2159c2bd13f3.png', ARRAY['Salt system included in final price', 'Lagoon Style', 'Natural Design'], 'Lifetime', 6, false, true, true, ARRAY[], ARRAY[], ARRAY[], true),
('Claremont', 'premium', 83400, '14′ × 33′', '3′ 6″ – 5′ 4″', '/lovable-uploads/6b7b34a3-03f7-4179-b34a-3458dc881efd.png', ARRAY['Salt system included in final price', 'L-Shaped Design', 'Extended Length'], 'Lifetime', 6, false, true, true, ARRAY[], ARRAY[], ARRAY[], true),
('Axiom 14', 'premium', 87500, '14′ × 30′', '4′ 6″ – 6′', '/lovable-uploads/d5b2276b-16a9-47bc-99e3-92567972fe5a.png', ARRAY['Salt system included in final price', 'Geometric Design', 'Deep Swimming'], 'Lifetime', 6, false, true, true, ARRAY[], ARRAY[], ARRAY[], true);