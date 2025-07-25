-- Add Stripe API configuration to api_configurations table
INSERT INTO public.api_configurations (
  service_name,
  service_type,
  status,
  features,
  is_enabled,
  config_data
) VALUES 
(
  'stripe',
  'retail',
  'disconnected',
  ARRAY['Payments', 'Checkout', 'Subscriptions', 'Webhooks'],
  false,
  '{}'::jsonb
)
ON CONFLICT (service_name) DO NOTHING;