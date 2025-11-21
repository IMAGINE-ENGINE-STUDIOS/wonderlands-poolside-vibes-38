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
      extras 
    }: QuoteEmailRequest = await req.json();

    const optionsHtml = selectedOptions && selectedOptions.length > 0 
      ? `
        <h3 style="color: #0891b2; margin-top: 20px;">Selected Options:</h3>
        <ul style="list-style: none; padding: 0;">
          ${selectedOptions.map(opt => `
            <li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
              <strong>${opt.name}</strong> - $${opt.price.toLocaleString()}
            </li>
          `).join('')}
        </ul>
      `
      : '';

    const emailResponse = await resend.emails.send({
      from: "Pool Quote <onboarding@resend.dev>",
      to: [customerEmail],
      subject: `Your Pool Configuration Quote - ${poolModel}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                line-height: 1.6;
                color: #1f2937;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(to right, #f97316, #14b8a6);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 8px;
                margin-bottom: 30px;
              }
              .content {
                background: #f9fafb;
                padding: 30px;
                border-radius: 8px;
                margin-bottom: 20px;
              }
              .total {
                background: linear-gradient(to right, #f97316, #ec4899, #14b8a6);
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 8px;
                font-size: 24px;
                font-weight: bold;
                margin-top: 20px;
              }
              .footer {
                text-align: center;
                color: #6b7280;
                font-size: 14px;
                margin-top: 30px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0;">Your Pool Configuration Quote</h1>
              <p style="margin: 10px 0 0 0;">Thank you for your interest!</p>
            </div>
            
            <div class="content">
              <h2 style="color: #0891b2; margin-top: 0;">Hello ${customerName}!</h2>
              <p>Thank you for requesting a quote. Here are the details of your pool configuration:</p>
              
              <h3 style="color: #0891b2; margin-top: 20px;">Selected Pool:</h3>
              <p style="font-size: 18px; font-weight: bold;">${poolModel}</p>
              
              ${optionsHtml}
              
              <div class="total">
                Total Investment: $${totalAmount.toLocaleString()}
              </div>
              
              <p style="margin-top: 30px;">
                Our team will review your quote and reach out to you shortly to discuss the next steps 
                and answer any questions you may have.
              </p>
              
              <p>
                If you have any immediate questions, please don't hesitate to contact us.
              </p>
            </div>
            
            <div class="footer">
              <p>This quote is valid for 30 days from the date of issue.</p>
              <p>&copy; ${new Date().getFullYear()} Pool Configurator. All rights reserved.</p>
            </div>
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
