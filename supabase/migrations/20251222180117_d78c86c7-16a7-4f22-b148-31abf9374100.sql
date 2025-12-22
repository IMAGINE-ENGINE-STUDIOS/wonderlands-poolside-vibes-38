-- Update existing templates to Wonderlands World branding

-- Update Welcome Email → Quote Tool Welcome Email
UPDATE public.message_templates 
SET 
  name = 'Quote Tool Welcome Email',
  subject = 'Your Pool Quote is Ready, {{first_name}}! - Wonderlands World',
  body = 'Hi {{first_name}},

Thank you for requesting a quote through Wonderlands World! We''re excited to help you create the backyard of your dreams.

We are Florida''s premier end-to-end pool and patio experience company. When you work with us, you get:
✓ Premium fiberglass pools built to last a lifetime
✓ Complete outdoor living design & construction
✓ Expert installation by licensed contractors
✓ Flexible financing - make your dream affordable
✓ Stress-free experience from start to splash!

Our team will review your quote request and reach out shortly to discuss your vision.

Ready to dive in?

Warmly,
The Wonderlands World Team',
  html_content = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<h2 style="color: #0369a1;">Hi {{first_name}},</h2>
<p>Thank you for requesting a quote through <strong>Wonderlands World</strong>! We''re excited to help you create the backyard of your dreams.</p>
<p>We are Florida''s premier end-to-end pool and patio experience company. When you work with us, you get:</p>
<ul style="color: #0369a1;">
<li>✓ Premium fiberglass pools built to last a lifetime</li>
<li>✓ Complete outdoor living design & construction</li>
<li>✓ Expert installation by licensed contractors</li>
<li>✓ Flexible financing - make your dream affordable</li>
<li>✓ Stress-free experience from start to splash!</li>
</ul>
<p>Our team will review your quote request and reach out shortly to discuss your vision.</p>
<p><strong>Ready to dive in?</strong></p>
<p>Warmly,<br>The Wonderlands World Team</p>
</div>',
  updated_at = now()
WHERE name = 'Welcome Email' AND channel = 'email';

-- Update Welcome SMS → Quote Tool Welcome SMS
UPDATE public.message_templates 
SET 
  name = 'Quote Tool Welcome SMS',
  body = 'Hi {{first_name}}! 🌴 Thanks for your quote request at Wonderlands World! We''re Florida''s premier pool & patio experts. Our team will review your request and reach out soon. Your dream backyard awaits! - Wonderlands World',
  updated_at = now()
WHERE name = 'Welcome SMS' AND channel = 'sms';

-- Update Welcome WhatsApp → Quote Tool Welcome WhatsApp
UPDATE public.message_templates 
SET 
  name = 'Quote Tool Welcome WhatsApp',
  body = 'Hi {{first_name}}! 🌊 Thanks for reaching out to Wonderlands World! We received your quote request and are excited to help you create your dream pool & patio. Our team will be in touch soon. Message us anytime with questions! - Wonderlands World Team',
  updated_at = now()
WHERE name = 'Welcome WhatsApp' AND channel = 'whatsapp';

-- Update Follow-up Email with Wonderlands World branding
UPDATE public.message_templates 
SET 
  subject = 'Following Up on Your Pool Dream - Wonderlands World',
  body = 'Hi {{first_name}},

Just checking in! We wanted to make sure you received our previous message about your pool project.

At Wonderlands World, we understand that choosing the right pool company is a big decision. That''s why we''re here to answer any questions and help guide you through the process.

Whether you''re still exploring options or ready to move forward, we''d love to chat. No pressure - just helpful expertise from Florida''s pool & patio specialists.

Reply to this email or give us a call anytime!

Best,
The Wonderlands World Team',
  html_content = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<h2 style="color: #0369a1;">Hi {{first_name}},</h2>
<p>Just checking in! We wanted to make sure you received our previous message about your pool project.</p>
<p>At <strong>Wonderlands World</strong>, we understand that choosing the right pool company is a big decision. That''s why we''re here to answer any questions and help guide you through the process.</p>
<p>Whether you''re still exploring options or ready to move forward, we''d love to chat. No pressure - just helpful expertise from Florida''s pool & patio specialists.</p>
<p>Reply to this email or give us a call anytime!</p>
<p>Best,<br>The Wonderlands World Team</p>
</div>',
  updated_at = now()
WHERE name = 'Follow-up Email' AND channel = 'email';

-- Update Check-in SMS with Wonderlands World branding
UPDATE public.message_templates 
SET 
  body = 'Hi {{first_name}}! 👋 It''s Wonderlands World. Just checking in on your pool project! Have any questions we can help with? We''re here whenever you''re ready. Reply anytime!',
  updated_at = now()
WHERE name = 'Check-in SMS' AND channel = 'sms';

-- Update Consultation Invite with Wonderlands World branding
UPDATE public.message_templates 
SET 
  subject = 'Your FREE Pool Consultation Awaits - Wonderlands World',
  body = 'Hi {{first_name}},

Your dream backyard is just one conversation away!

We''d love to offer you a FREE, no-obligation consultation to discuss your pool and patio vision. During this consultation, we''ll:

🏊 Review your space and discuss design possibilities
💰 Provide transparent pricing with no hidden fees
📅 Create a realistic timeline for your project
💳 Explore flexible financing options

At Wonderlands World, we believe every Florida home deserves an amazing outdoor space. Let us show you what''s possible!

Click below or reply to schedule your free consultation:
[Schedule Now]

Looking forward to creating something beautiful together!

The Wonderlands World Team',
  html_content = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<h2 style="color: #0369a1;">Hi {{first_name}},</h2>
<p><strong>Your dream backyard is just one conversation away!</strong></p>
<p>We''d love to offer you a FREE, no-obligation consultation to discuss your pool and patio vision. During this consultation, we''ll:</p>
<ul>
<li>🏊 Review your space and discuss design possibilities</li>
<li>💰 Provide transparent pricing with no hidden fees</li>
<li>📅 Create a realistic timeline for your project</li>
<li>💳 Explore flexible financing options</li>
</ul>
<p>At <strong>Wonderlands World</strong>, we believe every Florida home deserves an amazing outdoor space. Let us show you what''s possible!</p>
<p style="text-align: center; margin: 20px 0;">
<a href="#" style="background-color: #0369a1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Schedule Your Free Consultation</a>
</p>
<p>Looking forward to creating something beautiful together!</p>
<p>The Wonderlands World Team</p>
</div>',
  updated_at = now()
WHERE name = 'Consultation Invite' AND channel = 'email';

-- Insert NEW Manufacturer Lead Templates
INSERT INTO public.message_templates (name, channel, subject, body, html_content, template_type, is_active) VALUES
(
  'Manufacturer Lead Welcome Email',
  'email',
  'Wonderlands World - Your Pool Dream Starts Here, {{first_name}}!',
  'Hi {{first_name}},

We received your information through one of our trusted fiberglass pool manufacturer partners - and we''re thrilled to connect with you!

We are Wonderlands World, Florida''s premier end-to-end pool and patio experience company. From stunning fiberglass pools to complete outdoor living transformations, we bring your backyard dreams to life.

Why choose Wonderlands World?
✓ Premium fiberglass pools with lifetime structural warranty
✓ Complete patio and outdoor living design
✓ Expert installation by licensed Florida contractors
✓ Flexible financing options to fit your budget
✓ One company, one vision, one beautiful result

Ready to transform your backyard into your own personal paradise? Reply to this email or call us to schedule your FREE consultation!

Your dream pool is closer than you think.

Warmly,
The Wonderlands World Team',
  '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<h2 style="color: #0369a1;">Hi {{first_name}},</h2>
<p>We received your information through one of our trusted fiberglass pool manufacturer partners - and we''re thrilled to connect with you!</p>
<p>We are <strong>Wonderlands World</strong>, Florida''s premier end-to-end pool and patio experience company. From stunning fiberglass pools to complete outdoor living transformations, we bring your backyard dreams to life.</p>
<h3 style="color: #0369a1;">Why choose Wonderlands World?</h3>
<ul style="color: #0369a1;">
<li>✓ Premium fiberglass pools with lifetime structural warranty</li>
<li>✓ Complete patio and outdoor living design</li>
<li>✓ Expert installation by licensed Florida contractors</li>
<li>✓ Flexible financing options to fit your budget</li>
<li>✓ One company, one vision, one beautiful result</li>
</ul>
<p><strong>Ready to transform your backyard into your own personal paradise?</strong> Reply to this email or call us to schedule your FREE consultation!</p>
<p style="font-size: 18px; color: #0369a1;"><em>Your dream pool is closer than you think.</em></p>
<p>Warmly,<br>The Wonderlands World Team</p>
</div>',
  'welcome',
  true
),
(
  'Manufacturer Lead Welcome SMS',
  'sms',
  NULL,
  'Hi {{first_name}}! This is Wonderlands World 🌴 Your info came to us through our manufacturer partner. We specialize in creating stunning pool & patio experiences in Florida. Let''s bring your dream backyard to life! Reply or call us for a FREE consultation!',
  NULL,
  'welcome',
  true
),
(
  'Manufacturer Lead Welcome WhatsApp',
  'whatsapp',
  NULL,
  'Hi {{first_name}}! 🌊 Welcome from Wonderlands World! We received your information through our trusted pool manufacturer partner. As Florida''s end-to-end pool & patio experts, we''re excited to help you create your dream outdoor space. Message us with any questions - we''re here to help! 🏊‍♂️',
  NULL,
  'welcome',
  true
);

-- Create Manufacturer Lead Sequence
INSERT INTO public.automation_sequences (name, description, trigger_event, is_active) VALUES
(
  'Manufacturer Lead Sequence',
  'Automated welcome and follow-up sequence for leads received from manufacturer partners. Triggered when clients are added manually.',
  'manual_trigger',
  true
);

-- Get the IDs we need for creating steps
DO $$
DECLARE
  mfr_sequence_id UUID;
  mfr_email_id UUID;
  mfr_sms_id UUID;
  mfr_whatsapp_id UUID;
  followup_email_id UUID;
  checkin_sms_id UUID;
  consultation_id UUID;
BEGIN
  -- Get the manufacturer sequence ID
  SELECT id INTO mfr_sequence_id FROM public.automation_sequences WHERE name = 'Manufacturer Lead Sequence';
  
  -- Get template IDs
  SELECT id INTO mfr_email_id FROM public.message_templates WHERE name = 'Manufacturer Lead Welcome Email';
  SELECT id INTO mfr_sms_id FROM public.message_templates WHERE name = 'Manufacturer Lead Welcome SMS';
  SELECT id INTO mfr_whatsapp_id FROM public.message_templates WHERE name = 'Manufacturer Lead Welcome WhatsApp';
  SELECT id INTO followup_email_id FROM public.message_templates WHERE name = 'Follow-up Email';
  SELECT id INTO checkin_sms_id FROM public.message_templates WHERE name = 'Check-in SMS';
  SELECT id INTO consultation_id FROM public.message_templates WHERE name = 'Consultation Invite';
  
  -- Create automation steps for Manufacturer Lead Sequence
  INSERT INTO public.automation_steps (sequence_id, step_order, channels, template_id, delay_hours, is_active) VALUES
  (mfr_sequence_id, 1, ARRAY['email']::message_channel[], mfr_email_id, 0, true),
  (mfr_sequence_id, 2, ARRAY['sms']::message_channel[], mfr_sms_id, 0, true),
  (mfr_sequence_id, 3, ARRAY['whatsapp']::message_channel[], mfr_whatsapp_id, 1, true),
  (mfr_sequence_id, 4, ARRAY['email']::message_channel[], followup_email_id, 24, true),
  (mfr_sequence_id, 5, ARRAY['sms']::message_channel[], checkin_sms_id, 72, true),
  (mfr_sequence_id, 6, ARRAY['email']::message_channel[], consultation_id, 168, true);
END $$;

-- Update Welcome Sequence name for clarity
UPDATE public.automation_sequences 
SET 
  name = 'Quote Tool Welcome Sequence',
  description = 'Automated welcome and follow-up sequence for clients who submit quotes through the website quote tool.',
  updated_at = now()
WHERE name = 'Welcome Sequence';