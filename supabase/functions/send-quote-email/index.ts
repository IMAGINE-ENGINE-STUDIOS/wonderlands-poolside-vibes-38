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

    const defaultPoolImage = "https://images.unsplash.com/photo-1572331165267-854da2b021aa?w=800&h=400&fit=crop";

    const emailResponse = await resend.emails.send({
      from: "Wonderlands World <onboarding@resend.dev>",
      to: [customerEmail],
      subject: `🏊 Your Dream Pool Quote - ${poolModel} | Wonderlands World`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Pool Quote</title>
          </head>
          <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); min-height: 100vh;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
                    
                    <!-- Header with Logo -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #0d9488 0%, #0891b2 50%, #6366f1 100%); padding: 30px; text-align: center;">
                        <img src="https://i.ibb.co/7NqFqHW/wonderlands-logo.png" alt="Wonderlands World" style="height: 60px; margin-bottom: 15px;" onerror="this.style.display='none'">
                        <h1 style="color: #ffffff; font-family: 'Segoe UI', Arial, sans-serif; font-size: 28px; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                          ✨ Your Dream Pool Awaits ✨
                        </h1>
                        <p style="color: rgba(255,255,255,0.9); font-family: 'Segoe UI', Arial, sans-serif; font-size: 16px; margin: 10px 0 0 0;">
                          Wonderlands World - Premium Pool Solutions
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Pool Image Section -->
                    <tr>
                      <td style="padding: 0;">
                        <div style="position: relative;">
                          <img src="${poolImage || defaultPoolImage}" alt="${poolModel}" style="width: 100%; height: 280px; object-fit: cover; display: block;">
                          <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.7)); padding: 30px 20px 20px;">
                            <h2 style="color: #ffffff; font-family: 'Segoe UI', Arial, sans-serif; font-size: 24px; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                              ${poolModel}
                            </h2>
                          </div>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Greeting -->
                    <tr>
                      <td style="padding: 30px 30px 20px;">
                        <h2 style="color: #1f2937; font-family: 'Segoe UI', Arial, sans-serif; font-size: 22px; margin: 0 0 15px;">
                          Hello ${customerName}! 👋
                        </h2>
                        <p style="color: #6b7280; font-family: 'Segoe UI', Arial, sans-serif; font-size: 16px; line-height: 1.6; margin: 0;">
                          Thank you for choosing Wonderlands World! We're thrilled to present your personalized pool configuration. Here's everything you need to know about your dream backyard oasis:
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Quote Details -->
                    <tr>
                      <td style="padding: 0 30px 30px;">
                        <div style="background: linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 100%); border-radius: 16px; padding: 25px; border: 1px solid #99f6e4;">
                          <h3 style="color: #0d9488; font-family: 'Segoe UI', Arial, sans-serif; font-size: 18px; margin: 0 0 20px; display: flex; align-items: center;">
                            📋 Your Configuration Details
                          </h3>
                          
                          <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                            <tr style="background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%);">
                              <th style="padding: 14px 16px; text-align: left; font-family: 'Segoe UI', Arial, sans-serif; color: #ffffff; font-size: 14px;">Item</th>
                              <th style="padding: 14px 16px; text-align: right; font-family: 'Segoe UI', Arial, sans-serif; color: #ffffff; font-size: 14px;">Price</th>
                            </tr>
                            <tr>
                              <td style="padding: 14px 16px; border-bottom: 1px solid #e5e7eb; font-family: 'Segoe UI', Arial, sans-serif; color: #374151; font-weight: 600;">
                                🏊 ${poolModel} (Base)
                              </td>
                              <td style="padding: 14px 16px; border-bottom: 1px solid #e5e7eb; font-family: 'Segoe UI', Arial, sans-serif; color: #059669; font-weight: 600; text-align: right;">
                                Included
                              </td>
                            </tr>
                            ${optionsHtml}
                          </table>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Total Price -->
                    <tr>
                      <td style="padding: 0 30px 30px;">
                        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%); border-radius: 16px; padding: 25px; text-align: center; box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);">
                          <p style="color: rgba(255,255,255,0.9); font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">
                            Your Total Investment
                          </p>
                          <p style="color: #ffffff; font-family: 'Segoe UI', Arial, sans-serif; font-size: 42px; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                            $${totalAmount.toLocaleString()}
                          </p>
                          <p style="color: rgba(255,255,255,0.8); font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; margin: 10px 0 0;">
                            *Financing options available
                          </p>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Call to Action Buttons -->
                    <tr>
                      <td style="padding: 0 30px 30px;">
                        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 16px; padding: 25px; border: 2px solid #f59e0b; text-align: center;">
                          <h3 style="color: #92400e; font-family: 'Segoe UI', Arial, sans-serif; font-size: 20px; margin: 0 0 8px;">
                            🚀 Ready to Get Started?
                          </h3>
                          <p style="color: #a16207; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; margin: 0 0 20px;">
                            Let's make your dream pool a reality!
                          </p>
                          
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding: 0 5px 10px;">
                                <a href="https://calendly.com/wonderlandsworld" style="display: block; background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%); color: #ffffff; font-family: 'Segoe UI', Arial, sans-serif; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 24px; border-radius: 12px; text-align: center; box-shadow: 0 4px 14px 0 rgba(13, 148, 136, 0.4);">
                                  📅 Schedule a Meeting
                                </a>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 0 5px;">
                                <a href="sms:+12392570637" style="display: block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; font-family: 'Segoe UI', Arial, sans-serif; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 24px; border-radius: 12px; text-align: center; box-shadow: 0 4px 14px 0 rgba(99, 102, 241, 0.4);">
                                  💬 Text Us: (239) 257-0637
                                </a>
                              </td>
                            </tr>
                          </table>
                          
                          <p style="color: #78716c; font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; margin: 20px 0 0;">
                            Or call us directly at <a href="tel:+12392570637" style="color: #0d9488; font-weight: 600; text-decoration: none;">(239) 257-0637</a>
                          </p>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Why Choose Us -->
                    <tr>
                      <td style="padding: 0 30px 30px;">
                        <h3 style="color: #1f2937; font-family: 'Segoe UI', Arial, sans-serif; font-size: 18px; margin: 0 0 20px; text-align: center;">
                          ⭐ Why Choose Wonderlands World?
                        </h3>
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td width="33%" style="padding: 10px; text-align: center;">
                              <div style="background: #f0fdfa; border-radius: 12px; padding: 20px;">
                                <p style="font-size: 32px; margin: 0 0 10px;">🏆</p>
                                <p style="color: #0d9488; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; font-weight: 600; margin: 0;">Premium Quality</p>
                              </div>
                            </td>
                            <td width="33%" style="padding: 10px; text-align: center;">
                              <div style="background: #ede9fe; border-radius: 12px; padding: 20px;">
                                <p style="font-size: 32px; margin: 0 0 10px;">⚡</p>
                                <p style="color: #7c3aed; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; font-weight: 600; margin: 0;">Fast Installation</p>
                              </div>
                            </td>
                            <td width="33%" style="padding: 10px; text-align: center;">
                              <div style="background: #fef3c7; border-radius: 12px; padding: 20px;">
                                <p style="font-size: 32px; margin: 0 0 10px;">🛡️</p>
                                <p style="color: #d97706; font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; font-weight: 600; margin: 0;">Lifetime Warranty</p>
                              </div>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #1f2937 0%, #374151 100%); padding: 30px; text-align: center;">
                        <img src="https://i.ibb.co/7NqFqHW/wonderlands-logo.png" alt="Wonderlands World" style="height: 40px; margin-bottom: 15px; opacity: 0.9;" onerror="this.style.display='none'">
                        <p style="color: rgba(255,255,255,0.7); font-family: 'Segoe UI', Arial, sans-serif; font-size: 14px; margin: 0 0 10px;">
                          Wonderlands World - Premium Pool & Outdoor Living Solutions
                        </p>
                        <p style="color: rgba(255,255,255,0.5); font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; margin: 0 0 15px;">
                          This quote is valid for 30 days from the date of issue.
                        </p>
                        <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                          <tr>
                            <td style="padding: 0 10px;">
                              <a href="https://wonderlandsworld.com" style="color: #0d9488; font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; text-decoration: none;">🌐 Website</a>
                            </td>
                            <td style="padding: 0 10px; color: rgba(255,255,255,0.3);">|</td>
                            <td style="padding: 0 10px;">
                              <a href="tel:+12392570637" style="color: #0d9488; font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; text-decoration: none;">📞 Call Us</a>
                            </td>
                            <td style="padding: 0 10px; color: rgba(255,255,255,0.3);">|</td>
                            <td style="padding: 0 10px;">
                              <a href="mailto:info@wonderlandsworld.com" style="color: #0d9488; font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; text-decoration: none;">✉️ Email</a>
                            </td>
                          </tr>
                        </table>
                        <p style="color: rgba(255,255,255,0.4); font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; margin: 20px 0 0;">
                          © ${new Date().getFullYear()} Wonderlands World. All rights reserved.
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
