import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TriggerResult {
  success: boolean;
  clientAutomationId?: string;
  error?: string;
}

export const useTriggerAutomation = () => {
  const [isLoading, setIsLoading] = useState(false);

  const triggerAutomationForClient = async (
    clientId: string,
    triggerEvent: string = 'manual_trigger'
  ): Promise<TriggerResult> => {
    try {
      const { data, error } = await supabase.functions.invoke('process-client-automation', {
        body: { client_id: clientId, trigger_event: triggerEvent }
      });

      if (error) throw error;

      return { 
        success: true, 
        clientAutomationId: data?.client_automation_id 
      };
    } catch (error: any) {
      console.error('Failed to trigger automation:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to trigger automation' 
      };
    }
  };

  const triggerAutomationForMultiple = async (
    clientIds: string[],
    triggerEvent: string = 'manual_trigger'
  ): Promise<{ successful: number; failed: number }> => {
    setIsLoading(true);
    let successful = 0;
    let failed = 0;

    for (const clientId of clientIds) {
      const result = await triggerAutomationForClient(clientId, triggerEvent);
      if (result.success) {
        successful++;
      } else {
        failed++;
      }
    }

    setIsLoading(false);
    return { successful, failed };
  };

  const triggerAutomationForAll = async (
    excludeStatuses: string[] = ['won', 'lost']
  ): Promise<{ successful: number; failed: number }> => {
    setIsLoading(true);

    try {
      // Fetch all clients without active automations
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id, status')
        .not('status', 'in', `(${excludeStatuses.join(',')})`)
        .order('created_at', { ascending: false });

      if (clientsError) throw clientsError;

      // Check which clients already have active automations
      const { data: activeAutomations } = await supabase
        .from('client_automations')
        .select('client_id')
        .in('status', ['pending', 'in_progress']);

      const activeClientIds = new Set(activeAutomations?.map(a => a.client_id) || []);
      
      // Filter out clients with active automations
      const eligibleClients = clients?.filter(c => !activeClientIds.has(c.id)) || [];

      if (eligibleClients.length === 0) {
        toast.info('No eligible clients found for automation');
        setIsLoading(false);
        return { successful: 0, failed: 0 };
      }

      const result = await triggerAutomationForMultiple(
        eligibleClients.map(c => c.id),
        'manual_trigger'
      );

      return result;
    } catch (error: any) {
      console.error('Failed to trigger automations:', error);
      toast.error('Failed to trigger automations');
      setIsLoading(false);
      return { successful: 0, failed: 0 };
    }
  };

  const checkClientHasActiveAutomation = async (clientId: string): Promise<boolean> => {
    const { data } = await supabase
      .from('client_automations')
      .select('id')
      .eq('client_id', clientId)
      .in('status', ['pending', 'in_progress'])
      .limit(1);

    return (data?.length || 0) > 0;
  };

  return {
    isLoading,
    triggerAutomationForClient,
    triggerAutomationForMultiple,
    triggerAutomationForAll,
    checkClientHasActiveAutomation
  };
};
