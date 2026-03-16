-- Update all SMS welcome templates
UPDATE public.message_templates 
SET body = 'Hello 👋

Thank you for contacting Wonderlands. We have received your information about your dream pool and outdoor project, and we would love to help you create an incredible backyard experience. 🌴💧

To get started, please click the link below to chat directly with one of our sales specialists:

👉 wa.me/12392570637

To make things even easier, you can set up your free design consultation right now:
📅 Schedule Your 30-Minute Appointment: https://calendly.com/wonderlandsworlds/30min

When you message us or schedule your consultation, it would help if you could share:
• Your city in Florida
• What type of project you are interested in (new pool, renovation, patio, outdoor living area, etc.)
• Your approximate timeline for the project
• Any photos of your backyard or inspiration images

Our team will review your information and guide you through the next steps to design your custom Wonderlands outdoor space.

We look forward to helping you build your dream backyard. ✨',
updated_at = now()
WHERE id IN ('0e746abf-75dc-407a-b2bd-524072ae57f2', '6abe8649-570b-4d09-91ab-18d68392c9ab');

-- Update all email welcome templates
UPDATE public.message_templates 
SET body = 'Hello 👋

Thank you for contacting Wonderlands. We have received your information about your dream pool and outdoor project, and we would love to help you create an incredible backyard experience. 🌴💧

To get started, please click the link below to chat directly with one of our sales specialists:

👉 wa.me/12392570637

To make things even easier, you can set up your free design consultation right now:
📅 Schedule Your 30-Minute Appointment: https://calendly.com/wonderlandsworlds/30min

When you message us or schedule your consultation, it would help if you could share:
• Your city in Florida
• What type of project you are interested in (new pool, renovation, patio, outdoor living area, etc.)
• Your approximate timeline for the project
• Any photos of your backyard or inspiration images

Our team will review your information and guide you through the next steps to design your custom Wonderlands outdoor space.

We look forward to helping you build your dream backyard. ✨',
updated_at = now()
WHERE id IN ('e8f7848f-bcf4-4d37-8d37-3b300c18e3e0', '8a8ec329-873c-4ad1-8a05-ba86f5538843');