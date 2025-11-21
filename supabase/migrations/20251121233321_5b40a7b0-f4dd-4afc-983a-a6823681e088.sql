-- Update invoice number generation to start at 125
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  next_number INTEGER;
  year_prefix TEXT;
BEGIN
  year_prefix := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '\d+$') AS INTEGER)), 124) + 1
  INTO next_number
  FROM public.invoices
  WHERE invoice_number LIKE 'INV-' || year_prefix || '-%';
  
  RETURN 'INV-' || year_prefix || '-' || LPAD(next_number::TEXT, 5, '0');
END;
$function$;