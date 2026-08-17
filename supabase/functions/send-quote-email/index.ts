import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface QuoteEmailRequest {
  customerEmail: string;
  customerName: string;
  poolModel: string;
  totalAmount: number;
  selectedOptions: any[];
  extras: any;
  poolImage?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      customerEmail, 
      customerName, 
      poolModel, 
      totalAmount,
      selectedOptions,
      extras,
      poolImage 
    }: QuoteEmailRequest = await req.json();

    const optionsHtml = selectedOptions && selectedOptions.length > 0 
      ? selectedOptions.map(opt => `
          <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-family: 'Segoe UI', Arial, sans-serif; color: #374151;">
              ${opt.name}
            </td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-family: 'Segoe UI', Arial, sans-serif; color: #059669; font-weight: 600; text-align: right;">
              $${opt.price?.toLocaleString() || '0'}
            </td>
          </tr>
        `).join('')
      : '';

    // Product images - using absolute URLs for email compatibility
    const bermudaPoolImage = "https://wonderlands-poolside-vibes-38.lovable.app/lovable-uploads/311a7002-2a40-4c59-a143-9f0236ece5d4.png";
    // Barrel sauna exterior (preferred)
    const barrelSaunaImage = "https://wonderlands-poolside-vibes-38.lovable.app/lovable-uploads/barrel-sauna.webp";
    // Use the main Wonderlands logo
    const logoUrl = "https://wonderlands-poolside-vibes-38.lovable.app/wonderlands-branding/02222bf9-70e0-46ee-9772-cacbabb3e9c2.png";
    
    // Barrel sauna price
    const barrelSaunaPrice = 18000;
    
    // Default package price (Bermuda Pool + Barrel Sauna + Inclusions)
    const defaultPackagePrice = 72863;
    const finalTotal = totalAmount || defaultPackagePrice;

    const emailResponse = await resend.emails.send({
      from: "Wonderlands World <sales@wonderlandsworld.com>",
      to: [customerEmail],
      subject: `🌴 Exclusive Offer - Bermuda Pool + Barrel Sauna | Wonderlands World`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Exclusive Pool & Sauna Offer</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f3f4f6;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px 10px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header with Logo -->
                    <tr>
                      <td style="background: #ffffff; padding: 30px 30px 20px; text-align: center; border-bottom: 1px solid #e5e7eb;">
                        <img src="${logoUrl}" alt="Wonderlands World" style="height: 80px; margin-bottom: 10px;">
                        <p style="color: #6b7280; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; margin: 0;">
                          Premium Pool & Outdoor Living Solutions
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Greeting -->
                    <tr>
                      <td style="padding: 30px 30px 20px;">
                        <p style="color: #374151; font-family: 'Segoe UI', Arial, sans-serif; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                          Hello ${customerName},
                        </p>
                        <p style="color: #374151; font-family: 'Segoe UI', Arial, sans-serif; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                          <strong>What if your backyard felt like a luxury resort</strong>—designed around your lifestyle, built to last, and delivered without stress?
                        </p>
                        <p style="color: #374151; font-family: 'Segoe UI', Arial, sans-serif; font-size: 16px; line-height: 1.7; margin: 0 0 20px;">
                          At Wonderlands World, we design and build custom pools, patios, and outdoor living experiences across Florida—combining premium craftsmanship, smart layouts, and resort-level finishes.
                        </p>
                        
                        <!-- Features List -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                          <tr>
                            <td style="padding: 8px 0; font-family: 'Segoe UI', Arial, sans-serif; font-size: 15px; color: #374151;">
                              ✔️ Fiberglass & concrete pools
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; font-family: 'Segoe UI', Arial, sans-serif; font-size: 15px; color: #374151;">
                              ✔️ Outdoor kitchens, pergolas, and decks
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; font-family: 'Segoe UI', Arial, sans-serif; font-size: 15px; color: #374151;">
                              ✔️ Full design-to-build management
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; font-family: 'Segoe UI', Arial, sans-serif; font-size: 15px; color: #374151;">
                              ✔️ Transparent pricing and timelines
                            </td>
                          </tr>
                        </table>
                        
                        <p style="color: #1f2937; font-family: 'Georgia', serif; font-size: 18px; font-style: italic; line-height: 1.6; margin: 25px 0; text-align: center;">
                          We don't sell pools.<br>
                          <strong>We build experiences.</strong>
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Exclusive Offer Banner -->
                    <tr>
                      <td style="padding: 0 30px;">
                        <div style="background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%); border-radius: 12px; padding: 20px; text-align: center;">
                          <p style="color: #ffffff; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px;">
                            ⭐ Limited Time Exclusive Offer ⭐
                          </p>
                          <h2 style="color: #ffffff; font-family: 'Segoe UI', Arial, sans-serif; font-size: 22px; font-weight: 700; margin: 0;">
                            Bermuda Pool + 4-Person Barrel Sauna
                          </h2>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Bermuda Pool Section -->
                    <tr>
                      <td style="padding: 25px 30px 15px;">
                        <h3 style="color: #0d9488; font-family: 'Segoe UI', Arial, sans-serif; font-size: 18px; margin: 0 0 15px;">
                          🏊 Bermuda Fiberglass Pool
                        </h3>
                        <img src="${bermudaPoolImage}" alt="Bermuda Pool" style="width: 100%; height: 220px; object-fit: cover; border-radius: 12px; display: block;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 15px;">
                          <tr>
                            <td style="padding: 6px 0; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; color: #6b7280;">
                              <strong style="color: #374151;">Dimensions:</strong> 12′ × 24′
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 6px 0; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; color: #6b7280;">
                              <strong style="color: #374151;">Depth:</strong> 3′ 6″ – 5′ 6″
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 6px 0; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; color: #6b7280;">
                              <strong style="color: #374151;">Warranty:</strong> Lifetime Structural
                            </td>
                          </tr>
                        </table>
                        <div style="background: #ecfdf5; border-radius: 8px; padding: 15px; margin-top: 15px; border: 1px solid #a7f3d0;">
                          <p style="color: #065f46; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; font-weight: 600; margin: 0 0 10px;">
                            ✅ This Offer Includes:
                          </p>
                          <ul style="margin: 0; padding-left: 20px; color: #374151; font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px;">
                            <li style="margin-bottom: 6px;">Equipment Included</li>
                            <li style="margin-bottom: 6px;">Salt System</li>
                            <li style="margin-bottom: 6px;">3D Render to Visualize Your Patio</li>
                            <li style="margin-bottom: 6px;">5 Feet of Pavers Around Pool Area</li>
                            <li style="margin-bottom: 6px;">2 LED Lightings</li>
                            <li style="margin-bottom: 6px;">Installed in 3 Months After Permits Approved</li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Barrel Sauna Section -->
                    <tr>
                      <td style="padding: 15px 30px 25px;">
                        <h3 style="color: #0d9488; font-family: 'Segoe UI', Arial, sans-serif; font-size: 18px; margin: 0 0 15px;">
                          🧖 4-Person Barrel Sauna
                        </h3>
                        <img src="${barrelSaunaImage}" alt="4-Person Barrel Sauna" style="width: 100%; height: 220px; object-fit: cover; border-radius: 12px; display: block;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 15px;">
                          <tr>
                            <td style="padding: 6px 0; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; color: #6b7280;">
                              <strong style="color: #374151;">Capacity:</strong> 4 People
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 6px 0; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; color: #6b7280;">
                              <strong style="color: #374151;">Material:</strong> Premium Cedar Wood
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 6px 0; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; color: #6b7280;">
                              <strong style="color: #374151;">Features:</strong> Electric heater, LED lighting, Tempered glass door
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 6px 0; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; color: #6b7280;">
                              <strong style="color: #374151;">Price:</strong> <span style="color: #059669; font-weight: 600;">$${barrelSaunaPrice.toLocaleString()}</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    ${selectedOptions && selectedOptions.length > 0 ? `
                    <!-- Selected Options -->
                    <tr>
                      <td style="padding: 0 30px 25px;">
                        <div style="background: #f9fafb; border-radius: 12px; padding: 20px; border: 1px solid #e5e7eb;">
                          <h3 style="color: #374151; font-family: 'Segoe UI', Arial, sans-serif; font-size: 16px; margin: 0 0 15px;">
                            📋 Your Selected Options
                          </h3>
                          <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 8px; overflow: hidden;">
                            <tr style="background: #0d9488;">
                              <th style="padding: 12px 16px; text-align: left; font-family: 'Segoe UI', Arial, sans-serif; color: #ffffff; font-size: 13px;">Item</th>
                              <th style="padding: 12px 16px; text-align: right; font-family: 'Segoe UI', Arial, sans-serif; color: #ffffff; font-size: 13px;">Price</th>
                            </tr>
                            ${optionsHtml}
                          </table>
                        </div>
                      </td>
                    </tr>
                    ` : ''}
                    
                    <!-- Total Price -->
                    <tr>
                      <td style="padding: 0 30px 25px;">
                        <div style="background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%); border-radius: 12px; padding: 20px; text-align: center;">
                          <p style="color: rgba(255,255,255,0.9); font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; margin: 0 0 5px; text-transform: uppercase; letter-spacing: 1px;">
                            Exclusive Package Price
                          </p>
                          <p style="color: #ffffff; font-family: 'Segoe UI', Arial, sans-serif; font-size: 36px; font-weight: 700; margin: 0;">
                            $${finalTotal.toLocaleString()}
                          </p>
                          <p style="color: rgba(255,255,255,0.8); font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; margin: 8px 0 0;">
                            *Financing options available
                          </p>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Call to Action -->
                    <tr>
                      <td style="padding: 0 30px 25px;">
                        <div style="background: #fef3c7; border-radius: 12px; padding: 25px; border: 1px solid #fcd34d; text-align: center;">
                          <h3 style="color: #92400e; font-family: 'Segoe UI', Arial, sans-serif; font-size: 18px; margin: 0 0 8px;">
                            🚀 Ready to Get Started?
                          </h3>
                          <p style="color: #a16207; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; margin: 0 0 20px;">
                            Let's make your dream backyard a reality!
                          </p>
                          
                          <a href="https://calendly.com/wonderlandsworlds/30min" style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%); color: #ffffff; font-family: 'Segoe UI', Arial, sans-serif; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; margin-bottom: 12px;">
                            📅 Schedule a Consultation
                          </a>
                          
                          <p style="color: #6b7280; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; margin: 15px 0 0;">
                            Or text/call us: <a href="tel:+12392570637" style="color: #0d9488; font-weight: 600; text-decoration: none;">(239) 257-0637</a>
                          </p>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background: #1f2937; padding: 25px 30px; text-align: center;">
                        <img src="${logoUrl}" alt="Wonderlands World" style="height: 50px; margin-bottom: 15px; opacity: 0.9;">
                        <p style="color: rgba(255,255,255,0.6); font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; margin: 0 0 10px;">
                          Wonderlands World Experience LLC
                        </p>
                        <p style="color: rgba(255,255,255,0.5); font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; margin: 0 0 15px;">
                          This offer is valid for 30 days.
                        </p>
                        <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                          <tr>
                            <td style="padding: 0 8px;">
                              <a href="https://wonderlandsworld.com" style="color: #0d9488; font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; text-decoration: none;">Website</a>
                            </td>
                            <td style="color: rgba(255,255,255,0.3);">|</td>
                            <td style="padding: 0 8px;">
                              <a href="tel:+12392570637" style="color: #0d9488; font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; text-decoration: none;">Call Us</a>
                            </td>
                            <td style="color: rgba(255,255,255,0.3);">|</td>
                            <td style="padding: 0 8px;">
                              <a href="mailto:info@wonderlandsworld.com" style="color: #0d9488; font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; text-decoration: none;">Email</a>
                            </td>
                          </tr>
                        </table>
                        <p style="color: rgba(255,255,255,0.4); font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; margin: 15px 0 0;">
                          © ${new Date().getFullYear()} Wonderlands World Experience LLC. All rights reserved.
                        </p>
                      </td>
                    </tr>
                    
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-quote-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
