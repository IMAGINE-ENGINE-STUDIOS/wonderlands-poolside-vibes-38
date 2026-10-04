DROP POLICY IF EXISTS "Invoices viewable by admins owners or public by id" ON public.invoices;
CREATE POLICY "Invoices viewable by admins and owners" ON public.invoices FOR SELECT
USING (is_main_admin() OR auth.uid() = user_id OR auth.uid() = created_by);

CREATE OR REPLACE FUNCTION public.get_invoice_by_id(_id uuid)
RETURNS SETOF public.invoices LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT * FROM public.invoices i
  WHERE i.id = _id AND (
    i.user_id IS NULL AND i.company_id = public.platform_company_id()
    OR is_main_admin() OR i.user_id = auth.uid() OR i.created_by = auth.uid()
    OR (auth.uid() IS NOT NULL AND public.is_company_member(i.company_id)));
$$;
GRANT EXECUTE ON FUNCTION public.get_invoice_by_id(uuid) TO anon, authenticated;