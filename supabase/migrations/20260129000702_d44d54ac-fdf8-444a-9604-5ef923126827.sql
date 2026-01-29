-- Assign both clients to Jessica Grey (sales rep)
UPDATE public.clients 
SET assigned_sales_rep_id = '5e64621c-83c4-48c8-a3b0-dd317d7e7336', updated_at = now()
WHERE id IN ('288a8358-c91a-4209-ad7e-752f33aa5619', '1ff3c57b-14d6-4070-a558-89e35dc7724f');