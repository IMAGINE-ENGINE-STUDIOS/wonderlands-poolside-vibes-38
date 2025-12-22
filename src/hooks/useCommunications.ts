import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Channel = 'email' | 'sms' | 'whatsapp' | 'voice';
type RecipientType = 'client' | 'sales_rep' | 'contractor' | 'admin';

interface SendSMSParams {
  to: string;
  message: string;
  recipientType?: RecipientType;
  recipientName?: string;
}

interface SendWhatsAppParams {
  to: string;
  message: string;
  recipientType?: RecipientType;
  recipientName?: string;
  mediaUrl?: string;
}

interface MakeCallParams {
  to: string;
  message?: string;
  twimlUrl?: string;
  recipientType?: RecipientType;
  recipientName?: string;
}

interface SendNotificationParams {
  channels: Channel[];
  recipientType: RecipientType;
  recipientName: string;
  recipientEmail?: string;
  recipientPhone?: string;
  subject?: string;
  message: string;
  htmlContent?: string;
  mediaUrl?: string;
}

export function useCommunications() {
  const sendSMS = async (params: SendSMSParams) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: params
      });

      if (error) throw error;
      
      toast.success("SMS sent successfully");
      return data;
    } catch (error: any) {
      console.error("Failed to send SMS:", error);
      toast.error(error.message || "Failed to send SMS");
      throw error;
    }
  };

  const sendWhatsApp = async (params: SendWhatsAppParams) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: params
      });

      if (error) throw error;
      
      toast.success("WhatsApp message sent successfully");
      return data;
    } catch (error: any) {
      console.error("Failed to send WhatsApp:", error);
      toast.error(error.message || "Failed to send WhatsApp message");
      throw error;
    }
  };

  const makeVoiceCall = async (params: MakeCallParams) => {
    try {
      const { data, error } = await supabase.functions.invoke('make-voice-call', {
        body: params
      });

      if (error) throw error;
      
      toast.success("Voice call initiated");
      return data;
    } catch (error: any) {
      console.error("Failed to make call:", error);
      toast.error(error.message || "Failed to initiate call");
      throw error;
    }
  };

  const sendNotification = async (params: SendNotificationParams) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: params
      });

      if (error) throw error;

      if (data.errors && Object.keys(data.errors).length > 0) {
        const failedChannels = Object.keys(data.errors).join(', ');
        toast.warning(`Some channels failed: ${failedChannels}`);
      } else {
        toast.success("Notification sent successfully");
      }
      
      return data;
    } catch (error: any) {
      console.error("Failed to send notification:", error);
      toast.error(error.message || "Failed to send notification");
      throw error;
    }
  };

  // Quick send helpers for common use cases
  const notifyClient = async (
    client: { name: string; email?: string; phone?: string },
    message: string,
    channels: Channel[] = ['email'],
    subject?: string
  ) => {
    return sendNotification({
      channels,
      recipientType: 'client',
      recipientName: client.name,
      recipientEmail: client.email,
      recipientPhone: client.phone,
      message,
      subject
    });
  };

  const notifySalesRep = async (
    salesRep: { name: string; email?: string; phone?: string },
    message: string,
    channels: Channel[] = ['email'],
    subject?: string
  ) => {
    return sendNotification({
      channels,
      recipientType: 'sales_rep',
      recipientName: salesRep.name,
      recipientEmail: salesRep.email,
      recipientPhone: salesRep.phone,
      message,
      subject
    });
  };

  const notifyContractor = async (
    contractor: { name: string; email?: string; phone?: string },
    message: string,
    channels: Channel[] = ['email'],
    subject?: string
  ) => {
    return sendNotification({
      channels,
      recipientType: 'contractor',
      recipientName: contractor.name,
      recipientEmail: contractor.email,
      recipientPhone: contractor.phone,
      message,
      subject
    });
  };

  const notifyAdmin = async (
    admin: { name: string; email?: string; phone?: string },
    message: string,
    channels: Channel[] = ['email'],
    subject?: string
  ) => {
    return sendNotification({
      channels,
      recipientType: 'admin',
      recipientName: admin.name,
      recipientEmail: admin.email,
      recipientPhone: admin.phone,
      message,
      subject
    });
  };

  return {
    sendSMS,
    sendWhatsApp,
    makeVoiceCall,
    sendNotification,
    notifyClient,
    notifySalesRep,
    notifyContractor,
    notifyAdmin
  };
}
