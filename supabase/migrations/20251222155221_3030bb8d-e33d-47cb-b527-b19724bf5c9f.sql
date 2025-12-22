-- Insert default message templates
INSERT INTO public.message_templates (name, channel, subject, body, html_content, template_type, variables, is_active) VALUES
-- Welcome Email
('Welcome Email', 'email', 'Welcome to Gala Pools, {first_name}!', 
'Hi {first_name},

Thank you for your interest in Gala Pools! We are excited to help you create your dream backyard oasis.

Our team will be in touch shortly to discuss your pool project and answer any questions you may have.

Best regards,
The Gala Pools Team',
'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<h1 style="color: #0891b2;">Welcome to Gala Pools!</h1>
<p>Hi {first_name},</p>
<p>Thank you for your interest in Gala Pools! We are excited to help you create your dream backyard oasis.</p>
<p>Our team will be in touch shortly to discuss your pool project and answer any questions you may have.</p>
<p>Best regards,<br>The Gala Pools Team</p>
</div>',
'welcome', '["first_name", "last_name", "email"]'::jsonb, true),

-- Welcome SMS
('Welcome SMS', 'sms', NULL,
'Hi {first_name}! Thanks for contacting Gala Pools. We received your inquiry and will reach out soon. Questions? Reply to this text!',
NULL, 'welcome', '["first_name"]'::jsonb, true),

-- Welcome WhatsApp
('Welcome WhatsApp', 'whatsapp', NULL,
'Hi {first_name}! Welcome to Gala Pools! We are thrilled you are considering us for your pool project. Our team will contact you shortly. Feel free to message us here with any questions!',
NULL, 'welcome', '["first_name"]'::jsonb, true),

-- Follow-up Email (24 hours)
('Follow-up Email', 'email', 'Still thinking about your pool, {first_name}?',
'Hi {first_name},

We hope you are doing well! Just wanted to follow up on your pool inquiry.

Have you had a chance to think about your dream pool? We would love to help answer any questions you might have.

Some quick facts about Gala Pools:
- Over 20 years of experience
- Premium fiberglass pools
- Lifetime warranty options
- Flexible financing available

Let us know if you would like to schedule a free consultation!

Best regards,
The Gala Pools Team',
'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<h2 style="color: #0891b2;">Still thinking about your pool?</h2>
<p>Hi {first_name},</p>
<p>We hope you are doing well! Just wanted to follow up on your pool inquiry.</p>
<p>Have you had a chance to think about your dream pool? We would love to help answer any questions you might have.</p>
<h3>Some quick facts about Gala Pools:</h3>
<ul>
<li>Over 20 years of experience</li>
<li>Premium fiberglass pools</li>
<li>Lifetime warranty options</li>
<li>Flexible financing available</li>
</ul>
<p>Let us know if you would like to schedule a free consultation!</p>
<p>Best regards,<br>The Gala Pools Team</p>
</div>',
'follow_up', '["first_name", "last_name"]'::jsonb, true),

-- Check-in SMS (72 hours)
('Check-in SMS', 'sms', NULL,
'Hi {first_name}, it is Gala Pools! Just checking in - do you have any questions about our pools or the installation process? We are here to help!',
NULL, 'check_in', '["first_name"]'::jsonb, true),

-- Consultation Invite Email (7 days)
('Consultation Invite', 'email', '{first_name}, let us schedule your free consultation!',
'Hi {first_name},

It has been a week since you reached out, and we would love to connect with you!

How about scheduling a free, no-obligation consultation? We can:
- Discuss your pool vision and requirements
- Show you our pool models and customization options
- Provide a detailed quote
- Answer all your questions

Reply to this email with your availability.

Looking forward to hearing from you!

Best regards,
The Gala Pools Team',
'<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<h2 style="color: #0891b2;">Let us Schedule Your Free Consultation!</h2>
<p>Hi {first_name},</p>
<p>It has been a week since you reached out, and we would love to connect with you!</p>
<p>How about scheduling a free, no-obligation consultation? We can:</p>
<ul>
<li>Discuss your pool vision and requirements</li>
<li>Show you our pool models and customization options</li>
<li>Provide a detailed quote</li>
<li>Answer all your questions</li>
</ul>
<p>Reply to this email with your availability.</p>
<p>Looking forward to hearing from you!</p>
<p>Best regards,<br>The Gala Pools Team</p>
</div>',
'consultation', '["first_name"]'::jsonb, true);

-- Create default automation sequence
INSERT INTO public.automation_sequences (name, description, trigger_event, is_active)
VALUES (
  'Welcome Sequence',
  'Automated welcome sequence for new clients - sends welcome messages immediately, then follow-ups over the next 7 days',
  'new_client',
  true
);

-- Insert automation steps (will link to templates after)
DO $$
DECLARE
  seq_id UUID;
  welcome_email_id UUID;
  welcome_sms_id UUID;
  welcome_whatsapp_id UUID;
  followup_email_id UUID;
  checkin_sms_id UUID;
  consultation_email_id UUID;
BEGIN
  -- Get the sequence ID
  SELECT id INTO seq_id FROM public.automation_sequences WHERE name = 'Welcome Sequence' LIMIT 1;
  
  -- Get template IDs
  SELECT id INTO welcome_email_id FROM public.message_templates WHERE name = 'Welcome Email' LIMIT 1;
  SELECT id INTO welcome_sms_id FROM public.message_templates WHERE name = 'Welcome SMS' LIMIT 1;
  SELECT id INTO welcome_whatsapp_id FROM public.message_templates WHERE name = 'Welcome WhatsApp' LIMIT 1;
  SELECT id INTO followup_email_id FROM public.message_templates WHERE name = 'Follow-up Email' LIMIT 1;
  SELECT id INTO checkin_sms_id FROM public.message_templates WHERE name = 'Check-in SMS' LIMIT 1;
  SELECT id INTO consultation_email_id FROM public.message_templates WHERE name = 'Consultation Invite' LIMIT 1;
  
  -- Step 1: Immediate - Email + SMS
  INSERT INTO public.automation_steps (sequence_id, step_order, channels, template_id, delay_hours, is_active)
  VALUES (seq_id, 1, ARRAY['email']::message_channel[], welcome_email_id, 0, true);
  
  -- Step 2: Immediate - SMS
  INSERT INTO public.automation_steps (sequence_id, step_order, channels, template_id, delay_hours, is_active)
  VALUES (seq_id, 2, ARRAY['sms']::message_channel[], welcome_sms_id, 0, true);
  
  -- Step 3: 1 hour later - WhatsApp
  INSERT INTO public.automation_steps (sequence_id, step_order, channels, template_id, delay_hours, is_active)
  VALUES (seq_id, 3, ARRAY['whatsapp']::message_channel[], welcome_whatsapp_id, 1, true);
  
  -- Step 4: 24 hours later - Follow-up Email
  INSERT INTO public.automation_steps (sequence_id, step_order, channels, template_id, delay_hours, is_active)
  VALUES (seq_id, 4, ARRAY['email']::message_channel[], followup_email_id, 24, true);
  
  -- Step 5: 72 hours later - Check-in SMS
  INSERT INTO public.automation_steps (sequence_id, step_order, channels, template_id, delay_hours, is_active)
  VALUES (seq_id, 5, ARRAY['sms']::message_channel[], checkin_sms_id, 72, true);
  
  -- Step 6: 168 hours (7 days) later - Consultation invite
  INSERT INTO public.automation_steps (sequence_id, step_order, channels, template_id, delay_hours, is_active)
  VALUES (seq_id, 6, ARRAY['email']::message_channel[], consultation_email_id, 168, true);
END $$;