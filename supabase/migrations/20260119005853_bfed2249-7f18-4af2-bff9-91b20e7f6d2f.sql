UPDATE message_templates 
SET html_content = REPLACE(html_content, '{first_name}', '{{first_name}}')
WHERE name = 'Bermuda Pool + Barrel Sauna Exclusive Offer';