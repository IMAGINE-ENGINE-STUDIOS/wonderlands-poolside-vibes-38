-- Insert Voice Call Templates
INSERT INTO message_templates (name, channel, template_type, subject, body, is_active)
VALUES 
(
  'Quote Tool Welcome Call Script',
  'voice',
  'automation',
  NULL,
  'Hello {first_name}, this is Wonderlands World calling! We noticed you recently used our quote tool to explore outdoor living solutions. We would love to help bring your dream backyard to life with our premium pools, pavers, and pergolas. Please visit wonderlandsworld.com to see our full collection, or schedule a free consultation at calendly.com/wonderlandsworlds. Thank you and have a wonderful day!',
  true
),
(
  'Manufacturer Lead Welcome Call Script',
  'voice',
  'automation',
  NULL,
  'Hello {first_name}, this is Wonderlands World calling! Thank you for your interest in our manufacturer direct products. We offer premium pools, pavers, and pergolas with exclusive factory pricing. Please visit wonderlandsworld.com to explore our collections, or schedule a consultation at calendly.com/wonderlandsworlds. We look forward to helping you create your perfect outdoor space. Have a wonderful day!',
  true
);

-- Add Voice Step to Quote Tool Welcome Sequence (step 7, 96 hours delay)
INSERT INTO automation_steps (sequence_id, step_order, channels, delay_hours, template_id, is_active)
SELECT 
  seq.id,
  7,
  ARRAY['voice']::message_channel[],
  96,
  tmpl.id,
  true
FROM automation_sequences seq
CROSS JOIN message_templates tmpl
WHERE seq.name = 'Quote Tool Welcome Sequence'
  AND tmpl.name = 'Quote Tool Welcome Call Script';

-- Add Voice Step to Manufacturer Lead Sequence (step 7, 96 hours delay)
INSERT INTO automation_steps (sequence_id, step_order, channels, delay_hours, template_id, is_active)
SELECT 
  seq.id,
  7,
  ARRAY['voice']::message_channel[],
  96,
  tmpl.id,
  true
FROM automation_sequences seq
CROSS JOIN message_templates tmpl
WHERE seq.name = 'Manufacturer Lead Sequence'
  AND tmpl.name = 'Manufacturer Lead Welcome Call Script';