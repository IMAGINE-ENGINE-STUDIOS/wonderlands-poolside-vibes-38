import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  quantity?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { items, customerEmail } = await req.json();
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("No items provided");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create line items for Stripe
    const lineItems = items.map((item: CartItem) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
          metadata: {
            category: item.category,
            product_id: item.id,
          },
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity || 1,
    }));

    // Calculate total amount
    const totalAmount = items.reduce((sum: number, item: CartItem) => 
      sum + (item.price * (item.quantity || 1)), 0
    );

    let customerId: string | undefined;
    
    // Check if customer exists if email is provided
    if (customerEmail) {
      const customers = await stripe.customers.list({ 
        email: customerEmail, 
        limit: 1 
      });
      
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail || "guest@example.com",
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/payment-canceled`,
      metadata: {
        total_amount: totalAmount.toString(),
        item_count: items.length.toString(),
        customer_email: customerEmail || "guest@example.com",
      },
      payment_intent_data: {
        metadata: {
          total_amount: totalAmount.toString(),
          item_count: items.length.toString(),
        },
      },
    });

    // Optional: Store order in database using service role
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Store each item as a separate order record
    for (const item of items) {
      await supabaseService.from("product_orders").insert({
        stripe_session_id: session.id,
        product_identifier: item.id,
        product_name: item.name,
        product_category: item.category,
        quantity: item.quantity || 1,
        base_price: item.price,
        total_amount: item.price * (item.quantity || 1),
        customer_email: customerEmail || "guest@example.com",
        payment_status: "pending",
      });
    }

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id,
      totalAmount: totalAmount
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});