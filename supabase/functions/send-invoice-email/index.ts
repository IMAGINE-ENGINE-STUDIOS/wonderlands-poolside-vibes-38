import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvoiceEmailRequest {
  invoiceId: string;
  customerEmail: string;
  customerName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoiceId, customerEmail, customerName }: InvoiceEmailRequest = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      throw new Error('Invoice not found');
    }

    const lineItemsHtml = invoice.line_items.map((item: any) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.description}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${item.rate.toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">$${item.amount.toFixed(2)}</td>
      </tr>
    `).join('');

    const emailResponse = await resend.emails.send({
      from: "Wonderlands Pools & Spas <invoices@resend.dev>",
      to: [customerEmail],
      subject: `Invoice ${invoice.invoice_number} from Wonderlands`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">INVOICE</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 18px;">${invoice.invoice_number}</p>
          </div>
          
          <div style="background: white; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #667eea; margin-top: 0;">Hello ${customerName},</h2>
            <p>Thank you for your business! Please find your invoice details below:</p>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 8px 0;"><strong>Invoice Date:</strong></td>
                  <td style="padding: 8px 0; text-align: right;">${new Date(invoice.invoice_date).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Due Date:</strong></td>
                  <td style="padding: 8px 0; text-align: right;">${new Date(invoice.due_date).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Payment Terms:</strong></td>
                  <td style="padding: 8px 0; text-align: right;">${invoice.payment_terms}</td>
                </tr>
              </table>
            </div>

            <h3 style="color: #667eea; margin-top: 30px;">Invoice Details</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background: #667eea; color: white;">
                  <th style="padding: 12px; text-align: left;">Description</th>
                  <th style="padding: 12px; text-align: center;">Qty</th>
                  <th style="padding: 12px; text-align: right;">Rate</th>
                  <th style="padding: 12px; text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${lineItemsHtml}
              </tbody>
            </table>

            <div style="margin: 30px 0; padding: 20px; background: #f9fafb; border-radius: 8px;">
              <table style="width: 100%; max-width: 300px; margin-left: auto;">
                <tr>
                  <td style="padding: 8px 0;">Subtotal:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600;">$${invoice.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;">Tax (${invoice.tax_rate}%):</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600;">$${invoice.tax_amount.toFixed(2)}</td>
                </tr>
                ${invoice.discount_amount > 0 ? `
                <tr>
                  <td style="padding: 8px 0;">Discount:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600;">-$${invoice.discount_amount.toFixed(2)}</td>
                </tr>
                ` : ''}
                <tr style="border-top: 2px solid #667eea;">
                  <td style="padding: 12px 0; font-size: 18px; font-weight: bold; color: #667eea;">Total:</td>
                  <td style="padding: 12px 0; font-size: 18px; font-weight: bold; text-align: right; color: #667eea;">$${invoice.total_amount.toFixed(2)}</td>
                </tr>
              </table>
            </div>

            ${invoice.notes ? `
            <div style="margin: 20px 0; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
              <strong>Note:</strong> ${invoice.notes}
            </div>
            ` : ''}

            <div style="margin: 30px 0; padding: 20px; background: #eff6ff; border-radius: 8px;">
              <p style="margin: 0; font-size: 14px; color: #1e40af;">
                <strong>Terms & Conditions:</strong><br>
                ${invoice.terms_conditions}
              </p>
            </div>

            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px;">Thank you for your business!</p>
              <p style="color: #6b7280; font-size: 14px;">For questions, contact us at info@wonderlands.com</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Invoice email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-invoice-email function:", error);
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
