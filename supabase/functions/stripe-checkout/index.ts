import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      productId, 
      productName, 
      price, 
      quantity = 1, 
      cartItems = null,
      customerInfo = null 
    } = await req.json();

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user authentication (optional for guest checkout)
    let userId = null;
    let userEmail = null;

    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data } = await supabaseClient.auth.getUser(token);
        if (data.user) {
          userId = data.user.id;
          userEmail = data.user.email;
        }
      } catch (error) {
        console.log('No valid auth token, proceeding as guest');
      }
    }

    let lineItems = [];
    let totalAmount = 0;

    // Handle cart checkout vs single product checkout
    if (cartItems && Array.isArray(cartItems)) {
      // Cart checkout with multiple items
      lineItems = cartItems.map((item: any) => {
        const itemTotal = item.price + (item.extras?.reduce((sum: number, extra: any) => sum + extra.price, 0) || 0);
        totalAmount += itemTotal * item.quantity;
        
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: item.name,
              description: `${item.category} - ${item.extras?.length || 0} add-ons included`,
              images: item.image ? [item.image] : [],
            },
            unit_amount: Math.round(itemTotal * 100),
          },
          quantity: item.quantity,
        };
      });
    } else {
      // Single product checkout
      totalAmount = price * quantity;
      lineItems = [{
        price_data: {
          currency: "usd",
          product_data: {
            name: productName || `Product ${productId}`,
            description: getProductDescription(productId),
            images: [],
          },
          unit_amount: Math.round(price * 100),
        },
        quantity,
      }];
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/payment-canceled`,
      customer_email: userEmail || customerInfo?.email,
      metadata: {
        product_identifier: productId,
        product_name: productName || `Product ${productId}`,
        user_id: userId || 'guest',
        total_amount: totalAmount.toString(),
        is_cart_checkout: cartItems ? 'true' : 'false',
      },
    });

    // Store order in database
    const orderData = {
      user_id: userId,
      product_identifier: productId,
      product_name: productName || `Product ${productId}`,
      product_category: getProductCategory(productId),
      product_type: getProductType(productId),
      base_price: cartItems ? 0 : price, // For cart, base price is 0 as it's calculated from items
      extras_data: cartItems || [],
      total_amount: totalAmount,
      quantity: quantity,
      stripe_session_id: session.id,
      payment_status: 'pending',
      customer_email: userEmail || customerInfo?.email,
      customer_name: customerInfo?.name,
      customer_phone: customerInfo?.phone,
      delivery_address: customerInfo?.address ? JSON.stringify(customerInfo.address) : null,
    };

    const { error: orderError } = await supabaseClient
      .from('product_orders')
      .insert(orderData);

    if (orderError) {
      console.error('Error storing order:', orderError);
      // Don't fail the checkout, just log the error
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

// Helper functions
function getProductDescription(productId: string): string {
  if (productId.startsWith('pool_')) {
    return 'Premium fiberglass pool with custom configuration';
  }
  if (productId.startsWith('spa_')) {
    return 'Luxury spa with premium features';
  }
  if (productId.startsWith('cart_')) {
    return 'Complete pool and accessories package';
  }
  return 'Premium pool product';
}

function getProductCategory(productId: string): string {
  if (productId.startsWith('pool_')) return 'pool';
  if (productId.startsWith('spa_')) return 'spa';
  if (productId.startsWith('cart_')) return 'cart';
  return 'product';
}

function getProductType(productId: string): string {
  if (productId.startsWith('pool_')) return 'pool';
  if (productId.startsWith('spa_')) return 'spa';
  if (productId.startsWith('cart_')) return 'cart';
  return 'other';
}