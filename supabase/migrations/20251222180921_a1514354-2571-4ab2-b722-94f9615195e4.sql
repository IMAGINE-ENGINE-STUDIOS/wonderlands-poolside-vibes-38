-- Update all 9 message templates with Calendly and website CTAs

-- 1. Quote Tool Welcome Email
UPDATE message_templates 
SET body = 'Hi {first_name},

Thank you for using the Wonderlands World Quote Tool! We''re excited to help you create your dream outdoor space.

Based on your selections, we''ve prepared a personalized quote for your project. Our team is ready to discuss your vision and answer any questions.

📅 **Schedule Your Free Consultation:**
https://calendly.com/wonderlandsworlds/30min

🌐 **Explore Our Work:**
https://wonderlandsworld.com

We look forward to bringing your backyard dreams to life!

Best regards,
The Wonderlands World Team',
html_content = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<h2 style="color: #2563eb;">Welcome to Wonderlands World!</h2>
<p>Hi {first_name},</p>
<p>Thank you for using the Wonderlands World Quote Tool! We''re excited to help you create your dream outdoor space.</p>
<p>Based on your selections, we''ve prepared a personalized quote for your project. Our team is ready to discuss your vision and answer any questions.</p>
<div style="margin: 30px 0; text-align: center;">
<a href="https://calendly.com/wonderlandsworlds/30min" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 10px;">📅 Schedule Your Free Consultation</a>
</div>
<div style="margin: 20px 0; text-align: center;">
<a href="https://wonderlandsworld.com" style="background-color: #10b981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">🌐 Explore Our Work</a>
</div>
<p>We look forward to bringing your backyard dreams to life!</p>
<p>Best regards,<br><strong>The Wonderlands World Team</strong></p>
</div>'
WHERE name = 'Quote Tool Welcome Email';

-- 2. Quote Tool Welcome SMS
UPDATE message_templates 
SET body = 'Hi {first_name}! Thanks for using the Wonderlands World Quote Tool. We''re excited to help create your dream outdoor space! 

📅 Schedule a call: calendly.com/wonderlandsworlds/30min
🌐 Visit us: wonderlandsworld.com'
WHERE name = 'Quote Tool Welcome SMS';

-- 3. Quote Tool Welcome WhatsApp
UPDATE message_templates 
SET body = 'Hi {first_name}! 👋

Thanks for using the Wonderlands World Quote Tool! We''re thrilled to help you create your dream outdoor paradise.

Ready to take the next step?

📅 Schedule Your Free Consultation:
https://calendly.com/wonderlandsworlds/30min

🌐 Explore Our Projects:
https://wonderlandsworld.com

Reply to this message or book a call - we''re here to help! ✨'
WHERE name = 'Quote Tool Welcome WhatsApp';

-- 4. Follow-up Email
UPDATE message_templates 
SET body = 'Hi {first_name},

We wanted to follow up on your recent interest in Wonderlands World. Have you had a chance to review your quote?

We''d love to answer any questions and help you take the next step toward your dream outdoor space.

📅 **Book a Call With Us:**
https://calendly.com/wonderlandsworlds/30min

🌐 **See Our Latest Projects:**
https://wonderlandsworld.com

Looking forward to hearing from you!

Best regards,
The Wonderlands World Team',
html_content = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<h2 style="color: #2563eb;">Following Up on Your Quote</h2>
<p>Hi {first_name},</p>
<p>We wanted to follow up on your recent interest in Wonderlands World. Have you had a chance to review your quote?</p>
<p>We''d love to answer any questions and help you take the next step toward your dream outdoor space.</p>
<div style="margin: 30px 0; text-align: center;">
<a href="https://calendly.com/wonderlandsworlds/30min" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 10px;">📅 Book a Call With Us</a>
</div>
<div style="margin: 20px 0; text-align: center;">
<a href="https://wonderlandsworld.com" style="background-color: #10b981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">🌐 See Our Latest Projects</a>
</div>
<p>Looking forward to hearing from you!</p>
<p>Best regards,<br><strong>The Wonderlands World Team</strong></p>
</div>'
WHERE name = 'Follow-up Email';

-- 5. Check-in SMS
UPDATE message_templates 
SET body = 'Hi {first_name}, this is Wonderlands World checking in! Any questions about your outdoor project? We''re here to help.

📅 Schedule a call: calendly.com/wonderlandsworlds/30min
🌐 Visit: wonderlandsworld.com'
WHERE name = 'Check-in SMS';

-- 6. Consultation Invite
UPDATE message_templates 
SET body = 'Hi {first_name},

Thank you for your interest in Wonderlands World! We''d love to schedule a consultation to discuss your project in detail.

During our call, we''ll:
• Review your vision and requirements
• Discuss design options and materials
• Provide accurate pricing and timeline
• Answer all your questions

📅 **Schedule Your Free 30-Minute Consultation:**
https://calendly.com/wonderlandsworlds/30min

🌐 **Learn More About Us:**
https://wonderlandsworld.com

We look forward to speaking with you!

Best regards,
The Wonderlands World Team',
html_content = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<h2 style="color: #2563eb;">Let''s Schedule Your Consultation!</h2>
<p>Hi {first_name},</p>
<p>Thank you for your interest in Wonderlands World! We''d love to schedule a consultation to discuss your project in detail.</p>
<p><strong>During our call, we''ll:</strong></p>
<ul>
<li>Review your vision and requirements</li>
<li>Discuss design options and materials</li>
<li>Provide accurate pricing and timeline</li>
<li>Answer all your questions</li>
</ul>
<div style="margin: 30px 0; text-align: center;">
<a href="https://calendly.com/wonderlandsworlds/30min" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 10px;">📅 Schedule Your Free Consultation</a>
</div>
<div style="margin: 20px 0; text-align: center;">
<a href="https://wonderlandsworld.com" style="background-color: #10b981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">🌐 Learn More About Us</a>
</div>
<p>We look forward to speaking with you!</p>
<p>Best regards,<br><strong>The Wonderlands World Team</strong></p>
</div>'
WHERE name = 'Consultation Invite';

-- 7. Manufacturer Lead Welcome Email
UPDATE message_templates 
SET body = 'Hi {first_name},

Thank you for your interest in becoming a Wonderlands World partner! We''re excited to explore how we can work together.

As a leading outdoor living solutions provider, we''re always looking for quality manufacturers and suppliers to join our network.

📅 **Schedule a Partnership Discussion:**
https://calendly.com/wonderlandsworlds/30min

🌐 **Learn About Our Company:**
https://wonderlandsworld.com

We look forward to discussing partnership opportunities with you!

Best regards,
The Wonderlands World Team',
html_content = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
<h2 style="color: #2563eb;">Welcome to Wonderlands World!</h2>
<p>Hi {first_name},</p>
<p>Thank you for your interest in becoming a Wonderlands World partner! We''re excited to explore how we can work together.</p>
<p>As a leading outdoor living solutions provider, we''re always looking for quality manufacturers and suppliers to join our network.</p>
<div style="margin: 30px 0; text-align: center;">
<a href="https://calendly.com/wonderlandsworlds/30min" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 10px;">📅 Schedule a Partnership Discussion</a>
</div>
<div style="margin: 20px 0; text-align: center;">
<a href="https://wonderlandsworld.com" style="background-color: #10b981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">🌐 Learn About Our Company</a>
</div>
<p>We look forward to discussing partnership opportunities with you!</p>
<p>Best regards,<br><strong>The Wonderlands World Team</strong></p>
</div>'
WHERE name = 'Manufacturer Lead Welcome Email';

-- 8. Manufacturer Lead Welcome SMS
UPDATE message_templates 
SET body = 'Hi {first_name}! Thanks for your interest in partnering with Wonderlands World. We''d love to discuss collaboration opportunities!

📅 Schedule a call: calendly.com/wonderlandsworlds/30min
🌐 Visit: wonderlandsworld.com'
WHERE name = 'Manufacturer Lead Welcome SMS';

-- 9. Manufacturer Lead Welcome WhatsApp
UPDATE message_templates 
SET body = 'Hi {first_name}! 👋

Thanks for reaching out to Wonderlands World! We''re excited about potential partnership opportunities.

Let''s connect and discuss how we can work together!

📅 Schedule a Call:
https://calendly.com/wonderlandsworlds/30min

🌐 Learn More About Us:
https://wonderlandsworld.com

Looking forward to connecting! 🤝'
WHERE name = 'Manufacturer Lead Welcome WhatsApp';