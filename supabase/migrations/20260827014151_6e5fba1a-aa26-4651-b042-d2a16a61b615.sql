CREATE TABLE public.flip_books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID,
  title TEXT NOT NULL DEFAULT 'Untitled edition',
  slug TEXT NOT NULL UNIQUE,
  custom_domain TEXT,
  doc JSONB NOT NULL DEFAULT '{}'::jsonb,
  theme JSONB NOT NULL DEFAULT '{}'::jsonb,
  narrator_enabled BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT false,
  views INTEGER NOT NULL DEFAULT 0,
  share_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX flip_books_owner_idx ON public.flip_books (owner_id);
CREATE INDEX flip_books_domain_idx ON public.flip_books (custom_domain);

GRANT SELECT ON public.flip_books TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.flip_books TO authenticated;
GRANT ALL ON public.flip_books TO service_role;
ALTER TABLE public.flip_books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published books are publicly readable"
  ON public.flip_books FOR SELECT
  USING (published = true);
CREATE POLICY "Owners can read their own books"
  ON public.flip_books FOR SELECT TO authenticated
  USING (owner_id = auth.uid());
CREATE POLICY "Owners can create books"
  ON public.flip_books FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners can update their own books"
  ON public.flip_books FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners can delete their own books"
  ON public.flip_books FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

CREATE TABLE public.flip_narrator_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES public.flip_books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  active BOOLEAN NOT NULL DEFAULT false,
  monthly_fee NUMERIC NOT NULL DEFAULT 20,
  credits_balance NUMERIC NOT NULL DEFAULT 0,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (book_id)
);
GRANT SELECT ON public.flip_narrator_accounts TO authenticated;
GRANT ALL ON public.flip_narrator_accounts TO service_role;
ALTER TABLE public.flip_narrator_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can read their narrator accounts"
  ON public.flip_narrator_accounts FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE TABLE public.flip_credit_ledger (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID NOT NULL REFERENCES public.flip_books(id) ON DELETE CASCADE,
  user_id UUID,
  kind TEXT NOT NULL DEFAULT 'consume',
  amount NUMERIC NOT NULL DEFAULT 0,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX flip_credit_ledger_book_idx ON public.flip_credit_ledger (book_id, created_at DESC);
GRANT SELECT ON public.flip_credit_ledger TO authenticated;
GRANT ALL ON public.flip_credit_ledger TO service_role;
ALTER TABLE public.flip_credit_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can read their ledger"
  ON public.flip_credit_ledger FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.flip_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER flip_books_touch BEFORE UPDATE ON public.flip_books
FOR EACH ROW EXECUTE FUNCTION public.flip_touch_updated_at();
CREATE TRIGGER flip_narrator_accounts_touch BEFORE UPDATE ON public.flip_narrator_accounts
FOR EACH ROW EXECUTE FUNCTION public.flip_touch_updated_at();