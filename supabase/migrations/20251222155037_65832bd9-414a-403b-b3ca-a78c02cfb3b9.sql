-- Create function to trigger automation on new client
CREATE OR REPLACE FUNCTION public.trigger_new_client_automation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sequence_exists BOOLEAN;
BEGIN
  -- Check if there's an active automation sequence for new_client trigger
  SELECT EXISTS (
    SELECT 1 FROM public.automation_sequences 
    WHERE trigger_event = 'new_client' AND is_active = true
  ) INTO sequence_exists;
  
  IF sequence_exists THEN
    -- Call the edge function to process automation
    -- This uses pg_net extension if available, otherwise logs for manual processing
    PERFORM net.http_post(
      url := current_setting('app.settings.supabase_url', true) || '/functions/v1/process-client-automation',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object('client_id', NEW.id, 'trigger_event', 'new_client')
    );
    
    RAISE NOTICE 'Automation triggered for new client: %', NEW.id;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't block client creation if automation fails
    RAISE NOTICE 'Automation trigger failed for client %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger on clients table
DROP TRIGGER IF EXISTS on_new_client_automation ON public.clients;
CREATE TRIGGER on_new_client_automation
  AFTER INSERT ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_new_client_automation();