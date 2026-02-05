import { supabase } from "@/integrations/supabase/client";

/**
 * Upserts a customer into the customer_cache table.
 * Deduplicates by email - if the email exists, updates quote count and value.
 */
export const cacheCustomerFromQuote = async (data: {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  quoteAmount?: number;
  poolModel?: string;
}) => {
  if (!data.name || !data.email) return null;

  const email = data.email.toLowerCase().trim();

  try {
    // Check if customer already exists
    const { data: existing } = await supabase
      .from('customer_cache' as any)
      .select('id, total_quotes, total_quote_value')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      // Update existing customer
      const prev = existing as any;
      await supabase
        .from('customer_cache' as any)
        .update({
          name: data.name,
          phone: data.phone || undefined,
          address: data.address || undefined,
          total_quotes: (prev.total_quotes || 1) + 1,
          total_quote_value: (prev.total_quote_value || 0) + (data.quoteAmount || 0),
          last_quote_date: new Date().toISOString(),
          last_pool_model: data.poolModel || undefined,
        } as any)
        .eq('id', prev.id);
    } else {
      // Insert new customer
      await supabase.from('customer_cache' as any).insert({
        name: data.name,
        email,
        phone: data.phone || null,
        address: data.address || null,
        total_quotes: 1,
        total_quote_value: data.quoteAmount || 0,
        last_quote_date: new Date().toISOString(),
        first_quote_date: new Date().toISOString(),
        last_pool_model: data.poolModel || null,
      } as any);
    }
  } catch (err) {
    console.error('Customer cache upsert failed:', err);
  }
};
