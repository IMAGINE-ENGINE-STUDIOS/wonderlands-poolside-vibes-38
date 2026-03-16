-- Add WhatsApp live chat link to all email templates
UPDATE public.message_templates 
SET body = body || E'\n\n💬 Connect with a live representative now:\nChat Now: wa.me/12392570637',
    updated_at = now()
WHERE channel = 'email' 
  AND is_active = true
  AND body NOT LIKE '%wa.me/12392570637%';

-- Add WhatsApp live chat link to all SMS templates
UPDATE public.message_templates 
SET body = body || E'\n\n💬 Chat live: wa.me/12392570637',
    updated_at = now()
WHERE channel = 'sms' 
  AND is_active = true
  AND body NOT LIKE '%wa.me/12392570637%';
