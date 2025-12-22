-- Create enum for message channels
CREATE TYPE public.message_channel AS ENUM ('email', 'sms', 'whatsapp', 'voice');

-- Create enum for automation status
CREATE TYPE public.automation_status AS ENUM ('pending', 'in_progress', 'completed', 'paused', 'failed');

-- Create enum for message status
CREATE TYPE public.message_status AS ENUM ('pending', 'sent', 'delivered', 'failed', 'opened', 'clicked');

-- Message Templates table
CREATE TABLE public.message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    channel message_channel NOT NULL,
    subject TEXT, -- for emails
    body TEXT NOT NULL,
    html_content TEXT, -- for emails
    template_type TEXT NOT NULL DEFAULT 'general',
    variables JSONB DEFAULT '[]'::jsonb, -- available variables like {first_name}
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Automation Sequences table
CREATE TABLE public.automation_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    trigger_event TEXT NOT NULL DEFAULT 'new_client', -- new_client, status_change, manual
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Automation Steps table
CREATE TABLE public.automation_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_id UUID REFERENCES public.automation_sequences(id) ON DELETE CASCADE NOT NULL,
    step_order INTEGER NOT NULL DEFAULT 1,
    channels message_channel[] NOT NULL DEFAULT ARRAY['email']::message_channel[],
    template_id UUID REFERENCES public.message_templates(id) ON DELETE SET NULL,
    delay_hours INTEGER DEFAULT 0, -- 0 = immediate
    conditions JSONB DEFAULT '{}'::jsonb, -- filtering conditions
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(sequence_id, step_order)
);

-- Client Automations table - tracks automation per client
CREATE TABLE public.client_automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    sequence_id UUID REFERENCES public.automation_sequences(id) ON DELETE CASCADE NOT NULL,
    current_step INTEGER DEFAULT 1,
    status automation_status DEFAULT 'pending',
    started_at TIMESTAMPTZ DEFAULT now(),
    last_action_at TIMESTAMPTZ,
    next_action_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Communication Logs table - logs all messages
CREATE TABLE public.communication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    client_automation_id UUID REFERENCES public.client_automations(id) ON DELETE SET NULL,
    template_id UUID REFERENCES public.message_templates(id) ON DELETE SET NULL,
    channel message_channel NOT NULL,
    direction TEXT DEFAULT 'outbound', -- outbound or inbound
    recipient TEXT NOT NULL, -- email/phone number
    subject TEXT,
    message_content TEXT NOT NULL,
    status message_status DEFAULT 'pending',
    external_id TEXT, -- Twilio SID or Resend ID
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message_templates
CREATE POLICY "Main admins can manage message templates"
ON public.message_templates FOR ALL
USING (is_main_admin())
WITH CHECK (is_main_admin());

CREATE POLICY "Authenticated users can view active templates"
ON public.message_templates FOR SELECT
USING (is_active = true AND auth.uid() IS NOT NULL);

-- RLS Policies for automation_sequences
CREATE POLICY "Main admins can manage automation sequences"
ON public.automation_sequences FOR ALL
USING (is_main_admin())
WITH CHECK (is_main_admin());

CREATE POLICY "Authenticated users can view active sequences"
ON public.automation_sequences FOR SELECT
USING (is_active = true AND auth.uid() IS NOT NULL);

-- RLS Policies for automation_steps
CREATE POLICY "Main admins can manage automation steps"
ON public.automation_steps FOR ALL
USING (is_main_admin())
WITH CHECK (is_main_admin());

CREATE POLICY "Authenticated users can view active steps"
ON public.automation_steps FOR SELECT
USING (is_active = true AND auth.uid() IS NOT NULL);

-- RLS Policies for client_automations
CREATE POLICY "Main admins can manage all client automations"
ON public.client_automations FOR ALL
USING (is_main_admin())
WITH CHECK (is_main_admin());

CREATE POLICY "Sales reps can view automations for their clients"
ON public.client_automations FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.clients 
    WHERE clients.id = client_automations.client_id 
    AND clients.assigned_sales_rep_id = auth.uid()
));

-- RLS Policies for communication_logs
CREATE POLICY "Main admins can manage all communication logs"
ON public.communication_logs FOR ALL
USING (is_main_admin())
WITH CHECK (is_main_admin());

CREATE POLICY "Sales reps can view logs for their clients"
ON public.communication_logs FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.clients 
    WHERE clients.id = communication_logs.client_id 
    AND clients.assigned_sales_rep_id = auth.uid()
));

CREATE POLICY "System can insert communication logs"
ON public.communication_logs FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update communication logs"
ON public.communication_logs FOR UPDATE
USING (true);

-- Create indexes for performance
CREATE INDEX idx_client_automations_client_id ON public.client_automations(client_id);
CREATE INDEX idx_client_automations_status ON public.client_automations(status);
CREATE INDEX idx_client_automations_next_action ON public.client_automations(next_action_at);
CREATE INDEX idx_communication_logs_client_id ON public.communication_logs(client_id);
CREATE INDEX idx_communication_logs_status ON public.communication_logs(status);
CREATE INDEX idx_automation_steps_sequence_id ON public.automation_steps(sequence_id);

-- Update timestamp triggers
CREATE TRIGGER update_message_templates_updated_at
BEFORE UPDATE ON public.message_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_automation_sequences_updated_at
BEFORE UPDATE ON public.automation_sequences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_automations_updated_at
BEFORE UPDATE ON public.client_automations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();