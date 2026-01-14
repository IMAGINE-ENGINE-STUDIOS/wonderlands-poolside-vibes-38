import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Send, 
  CheckCircle2, 
  Loader2,
  Smartphone,
  Zap,
  Shield,
  Clock,
  ArrowRight,
  Waves
} from "lucide-react";

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface DeliveryStatus {
  sms: 'idle' | 'sending' | 'success' | 'error';
  whatsapp: 'idle' | 'sending' | 'success' | 'error';
  email: 'idle' | 'sending' | 'success' | 'error';
}

const TwilioPOC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  
  const [deliveryChannels, setDeliveryChannels] = useState({
    sms: true,
    whatsapp: false,
    email: true
  });
  
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>({
    sms: 'idle',
    whatsapp: 'idle',
    email: 'idle'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Wonderlands World team notification number
  const TEAM_PHONE = "+14077604873";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    setSubmitted(false);
    
    const notificationMessage = `🌴 NEW LEAD from Wonderlands World!\n\n👤 Name: ${formData.name}\n📧 Email: ${formData.email}\n📱 Phone: ${formData.phone || 'Not provided'}\n\n💬 Message:\n${formData.message}\n\n⏰ Received: ${new Date().toLocaleString()}`;
    
    const channels: ('sms' | 'whatsapp' | 'email')[] = [];
    if (deliveryChannels.sms) channels.push('sms');
    if (deliveryChannels.whatsapp) channels.push('whatsapp');
    if (deliveryChannels.email) channels.push('email');
    
    // Send notifications to each selected channel
    const promises = channels.map(async (channel) => {
      setDeliveryStatus(prev => ({ ...prev, [channel]: 'sending' }));
      
      try {
        if (channel === 'email') {
          const { error } = await supabase.functions.invoke('send-notification', {
            body: {
              channels: ['email'],
              recipientType: 'admin',
              recipientName: 'Wonderlands Team',
              recipientEmail: 'Khaliapadilla@gmail.com',
              subject: `🌴 New Lead: ${formData.name}`,
              message: notificationMessage,
              htmlContent: `
                <!DOCTYPE html>
                <html>
                  <head>
                    <style>
                      body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; }
                      .header { background: linear-gradient(135deg, #0ea5e9, #14b8a6); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
                      .header h1 { margin: 0; font-size: 24px; }
                      .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
                      .lead-card { background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                      .field { margin-bottom: 15px; }
                      .field-label { color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
                      .field-value { color: #1f2937; font-size: 16px; font-weight: 500; }
                      .message-box { background: #f0fdfa; border-left: 4px solid #14b8a6; padding: 15px; border-radius: 0 8px 8px 0; }
                      .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
                      .badge { display: inline-block; background: #14b8a6; color: white; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
                    </style>
                  </head>
                  <body>
                    <div class="header">
                      <h1>🌴 New Customer Lead</h1>
                      <p style="margin: 10px 0 0; opacity: 0.9;">Wonderlands World Experience</p>
                    </div>
                    <div class="content">
                      <div class="lead-card">
                        <div class="field">
                          <div class="field-label">Customer Name</div>
                          <div class="field-value">${formData.name}</div>
                        </div>
                        <div class="field">
                          <div class="field-label">Email Address</div>
                          <div class="field-value">${formData.email}</div>
                        </div>
                        <div class="field">
                          <div class="field-label">Phone Number</div>
                          <div class="field-value">${formData.phone || 'Not provided'}</div>
                        </div>
                      </div>
                      <div class="field-label" style="margin-bottom: 8px;">Customer Message</div>
                      <div class="message-box">
                        ${formData.message.replace(/\n/g, '<br>')}
                      </div>
                      <div style="margin-top: 20px; text-align: center;">
                        <span class="badge">⏰ ${new Date().toLocaleString()}</span>
                      </div>
                    </div>
                    <div class="footer">
                      <p>This lead was captured via the Wonderlands World website.</p>
                      <p>Powered by Twilio + Supabase</p>
                    </div>
                  </body>
                </html>
              `
            }
          });
          
          if (error) throw error;
        } else if (channel === 'sms') {
          const { error } = await supabase.functions.invoke('send-sms', {
            body: {
              to: TEAM_PHONE,
              message: notificationMessage,
              recipientType: 'admin',
              recipientName: 'Wonderlands Team'
            }
          });
          
          if (error) throw error;
        } else if (channel === 'whatsapp') {
          const { error } = await supabase.functions.invoke('send-whatsapp', {
            body: {
              to: TEAM_PHONE,
              message: notificationMessage,
              recipientType: 'admin',
              recipientName: 'Wonderlands Team'
            }
          });
          
          if (error) throw error;
        }
        
        setDeliveryStatus(prev => ({ ...prev, [channel]: 'success' }));
        return { channel, success: true };
      } catch (error) {
        console.error(`Failed to send ${channel}:`, error);
        setDeliveryStatus(prev => ({ ...prev, [channel]: 'error' }));
        return { channel, success: false };
      }
    });
    
    const results = await Promise.all(promises);
    const successCount = results.filter(r => r.success).length;
    
    setIsSubmitting(false);
    setSubmitted(true);
    
    if (successCount === channels.length) {
      toast.success("Message delivered successfully to all channels!");
    } else if (successCount > 0) {
      toast.warning(`Message delivered to ${successCount}/${channels.length} channels`);
    } else {
      toast.error("Failed to deliver message");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "", message: "" });
    setDeliveryStatus({ sms: 'idle', whatsapp: 'idle', email: 'idle' });
    setSubmitted(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sending':
        return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <span className="w-4 h-4 text-red-500">✕</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-xl border-b border-border/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal flex items-center justify-center">
              <Waves className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Wonderlands World</h1>
              <p className="text-xs text-muted-foreground">Twilio Integration POC</p>
            </div>
          </div>
          <Badge variant="outline" className="border-primary/50 text-primary">
            <Zap className="w-3 h-3 mr-1" />
            Real-time Messaging
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            Proof of Concept
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Real-Time Customer Messaging
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            This proof of concept demonstrates the ability to capture customer messages and deliver them 
            in real time via <span className="text-primary font-semibold">Twilio SMS</span>, 
            <span className="text-green-500 font-semibold"> WhatsApp</span>, and 
            <span className="text-coral font-semibold"> Email</span>.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Customer Contact Form
              </CardTitle>
              <CardDescription>
                Submit a message and watch it get delivered in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="John Smith"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="focus:border-primary"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="(407) 123-4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="focus:border-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="I'm interested in learning more about your pool services..."
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="focus:border-primary resize-none"
                  />
                </div>

                {/* Delivery Channel Selection */}
                <div className="space-y-3 p-4 bg-muted/50 rounded-lg border border-border/50">
                  <Label className="text-sm font-medium">Delivery Channels</Label>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="sms"
                        checked={deliveryChannels.sms}
                        onCheckedChange={(checked) => 
                          setDeliveryChannels({ ...deliveryChannels, sms: !!checked })
                        }
                      />
                      <Label htmlFor="sms" className="flex items-center gap-1.5 cursor-pointer">
                        <Smartphone className="w-4 h-4 text-primary" />
                        SMS
                        {getStatusIcon(deliveryStatus.sms)}
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="whatsapp"
                        checked={deliveryChannels.whatsapp}
                        onCheckedChange={(checked) => 
                          setDeliveryChannels({ ...deliveryChannels, whatsapp: !!checked })
                        }
                      />
                      <Label htmlFor="whatsapp" className="flex items-center gap-1.5 cursor-pointer">
                        <MessageSquare className="w-4 h-4 text-green-500" />
                        WhatsApp
                        {getStatusIcon(deliveryStatus.whatsapp)}
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="email"
                        checked={deliveryChannels.email}
                        onCheckedChange={(checked) => 
                          setDeliveryChannels({ ...deliveryChannels, email: !!checked })
                        }
                      />
                      <Label htmlFor="email" className="flex items-center gap-1.5 cursor-pointer">
                        <Mail className="w-4 h-4 text-coral" />
                        Email
                        {getStatusIcon(deliveryStatus.email)}
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    type="submit" 
                    className="flex-1 bg-primary hover:bg-primary/90"
                    disabled={isSubmitting || (!deliveryChannels.sms && !deliveryChannels.whatsapp && !deliveryChannels.email)}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                  {submitted && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Reset
                    </Button>
                  )}
                </div>
              </form>

              {submitted && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Message Delivered!</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                    The Wonderlands World team has been notified via the selected channels.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* How It Works */}
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-coral" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Customer Submits Form</h4>
                    <p className="text-sm text-muted-foreground">
                      Customer fills out the contact form with their inquiry
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Secure Transmission</h4>
                    <p className="text-sm text-muted-foreground">
                      Data is securely sent to Supabase Edge Functions
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Twilio Delivery</h4>
                    <p className="text-sm text-muted-foreground">
                      Message is formatted and sent via Twilio's API
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Instant Notification</h4>
                    <p className="text-sm text-muted-foreground">
                      Team receives lead instantly via SMS, WhatsApp, or Email
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-teal" />
                  Key Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm">Instant Lead Visibility</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-coral" />
                    <span className="text-sm">Faster Response Times</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-teal" />
                    <span className="text-sm">Reliable Delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Scalable Solution</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tech Stack */}
            <Card className="glass-card bg-gradient-to-br from-card to-primary/5">
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Twilio SMS</Badge>
                  <Badge variant="secondary">Twilio WhatsApp</Badge>
                  <Badge variant="secondary">Resend Email</Badge>
                  <Badge variant="secondary">Supabase Edge Functions</Badge>
                  <Badge variant="secondary">React</Badge>
                  <Badge variant="secondary">TypeScript</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  This solution can be expanded to include automated replies, 
                  lead qualification, CRM integration, and more.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TwilioPOC;
