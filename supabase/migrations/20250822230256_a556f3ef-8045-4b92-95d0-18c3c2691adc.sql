-- Insert sample job postings with complete data
INSERT INTO job_postings (title, description, category, budget_min, budget_max, deadline, location, status, business_id) VALUES 
('Luxury Pool Installation - Custom Design', 'Looking for experienced pool contractor to install a custom luxury pool with spa integration, waterfall features, and LED lighting system. Must have experience with high-end residential projects and proper licensing. Project timeline is 8-10 weeks with premium materials throughout.', 'pools', 45000, 65000, '2025-04-15', 'Miami, FL', 'open', '00000000-0000-0000-0000-000000000001'),
('Commercial Patio Renovation', 'Restaurant patio needs complete renovation including new concrete work, tile installation, outdoor kitchen setup, and landscaping. Seeking multiple contractors for different phases. Must be able to work nights/weekends to minimize business disruption.', 'patios', 25000, 40000, '2025-03-30', 'Orlando, FL', 'open', '00000000-0000-0000-0000-000000000002'),
('Pool Equipment Modernization', 'Upgrade existing pool systems with energy-efficient equipment including variable speed pumps, salt water system, automated controls, and solar heating. Pool is 20x40 with attached spa. Prefer certified installers with warranty coverage.', 'improvements', 15000, 25000, '2025-05-01', 'Tampa, FL', 'open', '00000000-0000-0000-0000-000000000003'),
('Outdoor Kitchen & Entertainment Area', 'Complete outdoor living space construction including kitchen with built-in grill, bar seating, fire pit area, and pergola. High-end finishes required. Project includes electrical, plumbing, and gas connections. 500 sq ft total area.', 'outdoors', 35000, 55000, '2025-06-15', 'Jacksonville, FL', 'open', '00000000-0000-0000-0000-000000000004'),
('Pool Repair & Resurfacing', 'Existing pool needs complete resurfacing, new tile work around waterline, coping replacement, and equipment repairs. Pool is showing age and needs professional restoration. Looking for specialists in pool renovation work.', 'construction', 18000, 28000, '2025-04-01', 'Fort Lauderdale, FL', 'open', '00000000-0000-0000-0000-000000000005');

-- Insert sample business profiles for the job postings
INSERT INTO profiles (id, email, first_name, last_name, company_name, role, is_active) VALUES 
('00000000-0000-0000-0000-000000000001', 'john@luxuryhomes.com', 'John', 'Smith', 'Luxury Homes Development', 'consumer', true),
('00000000-0000-0000-0000-000000000002', 'maria@oceanview.com', 'Maria', 'Rodriguez', 'Oceanview Restaurant Group', 'consumer', true),
('00000000-0000-0000-0000-000000000003', 'david@modernpool.com', 'David', 'Johnson', 'Modern Pool Solutions', 'consumer', true),
('00000000-0000-0000-0000-000000000004', 'sarah@elite.com', 'Sarah', 'Williams', 'Elite Property Management', 'consumer', true),
('00000000-0000-0000-0000-000000000005', 'mike@resortmgmt.com', 'Mike', 'Brown', 'Resort Management LLC', 'consumer', true);

-- Insert sample job requirements
INSERT INTO job_requirements (job_id, requirement_text, is_mandatory, order_index) 
SELECT jp.id, req.requirement_text, req.is_mandatory, req.order_index
FROM job_postings jp
CROSS JOIN (
    VALUES 
    ('Licensed and insured contractor', true, 0),
    ('Minimum 5 years experience', true, 1),
    ('Portfolio of similar projects', true, 2),
    ('Warranty on workmanship', true, 3),
    ('References from recent clients', false, 4)
) AS req(requirement_text, is_mandatory, order_index)
WHERE jp.title LIKE '%Luxury Pool Installation%';

INSERT INTO job_requirements (job_id, requirement_text, is_mandatory, order_index) 
SELECT jp.id, req.requirement_text, req.is_mandatory, req.order_index
FROM job_postings jp
CROSS JOIN (
    VALUES 
    ('Commercial construction experience', true, 0),
    ('Ability to work evenings/weekends', true, 1),
    ('Food service facility experience', true, 2),
    ('Permits and licensing current', true, 3)
) AS req(requirement_text, is_mandatory, order_index)
WHERE jp.title LIKE '%Commercial Patio%';

-- Insert sample job proposals to show applicant counts
INSERT INTO job_proposals (job_id, supplier_id, proposed_price, estimated_timeline, proposal_text, status) 
SELECT jp.id, '00000000-0000-0000-0000-000000000006', 
       (jp.budget_min + jp.budget_max) / 2,
       '8-10 weeks',
       'Professional proposal with detailed timeline and premium materials. We specialize in luxury pool installations with 15+ years experience.',
       'pending'
FROM job_postings jp WHERE jp.title LIKE '%Luxury Pool Installation%';

INSERT INTO job_proposals (job_id, supplier_id, proposed_price, estimated_timeline, proposal_text, status) 
SELECT jp.id, '00000000-0000-0000-0000-000000000007', 
       jp.budget_min + 5000,
       '6-8 weeks', 
       'Commercial renovation specialist with restaurant experience. We can work nights/weekends to minimize disruption.',
       'pending'
FROM job_postings jp WHERE jp.title LIKE '%Commercial Patio%';

-- Insert supplier profiles for proposals
INSERT INTO profiles (id, email, first_name, last_name, company_name, role, is_active) VALUES 
('00000000-0000-0000-0000-000000000006', 'info@poolexperts.com', 'Tom', 'Anderson', 'Pool Experts Inc', 'supplier', true),
('00000000-0000-0000-0000-000000000007', 'contact@commercialreno.com', 'Lisa', 'Garcia', 'Commercial Renovation Pro', 'supplier', true);