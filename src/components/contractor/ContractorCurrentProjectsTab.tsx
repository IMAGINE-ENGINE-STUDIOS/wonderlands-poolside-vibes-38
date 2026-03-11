import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, DollarSign, Calendar, Clock, CheckCircle, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AssignedTask {
  id: string;
  task_name: string;
  description: string | null;
  location: string | null;
  start_date: string | null;
  due_date: string | null;
  proposed_price: number | null;
  status: string;
  notes: string | null;
  created_at: string;
  construction_projects: {
    project_name: string;
    status: string;
  } | null;
}

interface ContractorCurrentProjectsTabProps {
  contractorId: string;
}

const ContractorCurrentProjectsTab: React.FC<ContractorCurrentProjectsTabProps> = ({ contractorId }) => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<AssignedTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [contractorId]);

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contractor_project_tasks')
      .select('*, construction_projects(project_name, status)')
      .eq('contractor_id', contractorId)
      .order('start_date', { ascending: true }) as any;
    if (!error) setTasks(data || []);
    setLoading(false);
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    const task = tasks.find(t => t.id === taskId);
    const { error } = await supabase
      .from('contractor_project_tasks')
      .update({ status } as any)
      .eq('id', taskId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      // If completing, also try to mark the linked phase item as completed
      if (status === 'completed' && task) {
        try {
          // Find the listing to get phase_item_id
          const { data: listing } = await supabase
            .from('procurement_listings')
            .select('phase_item_id')
            .eq('id', (task as any).listing_id)
            .single() as any;
          
          if (listing?.phase_item_id) {
            await supabase
              .from('phase_items')
              .update({ is_completed: true } as any)
              .eq('id', listing.phase_item_id);
          }
        } catch (e) {
          console.error('Could not sync phase item:', e);
        }
      }
      toast({ title: `Task marked as ${status}` });
      fetchTasks();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'assigned':
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">Assigned</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() ;
  };

  if (loading) {
    return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No Assigned Projects</h3>
          <p className="text-sm text-muted-foreground">
            Once your proposals are accepted, assigned tasks will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const activeTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Active Tasks */}
      <div>
        <h3 className="font-semibold text-sm mb-3 text-foreground">Active Tasks ({activeTasks.length})</h3>
        {activeTasks.length === 0 ? (
          <Card><CardContent className="pt-6 text-center text-sm text-muted-foreground">No active tasks.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {activeTasks.map(task => (
              <Card key={task.id} className={isOverdue(task.due_date) && task.status !== 'completed' ? 'border-destructive/50' : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{task.task_name}</h4>
                        {isOverdue(task.due_date) && task.status !== 'completed' && (
                          <Badge variant="destructive" className="text-[10px]">Overdue</Badge>
                        )}
                      </div>
                      {task.construction_projects && (
                        <p className="text-xs text-muted-foreground">
                          Project: {(task.construction_projects as any).project_name}
                        </p>
                      )}
                      {task.description && (
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      )}
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {task.location && (
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{task.location}</span>
                        )}
                        {task.proposed_price && (
                          <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${task.proposed_price.toLocaleString()}</span>
                        )}
                        {task.start_date && (
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Start: {new Date(task.start_date).toLocaleDateString()}</span>
                        )}
                        {task.due_date && (
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Due: {new Date(task.due_date).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(task.status)}
                      <div className="flex gap-1">
                        {task.status === 'assigned' && (
                          <Button size="sm" variant="outline" onClick={() => updateTaskStatus(task.id, 'in_progress')} className="text-xs h-7">
                            Start Work
                          </Button>
                        )}
                        {task.status === 'in_progress' && (
                          <Button size="sm" onClick={() => updateTaskStatus(task.id, 'completed')} className="text-xs h-7">
                            <CheckCircle className="h-3 w-3 mr-1" /> Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm mb-3 text-muted-foreground">Completed ({completedTasks.length})</h3>
          <div className="space-y-2">
            {completedTasks.map(task => (
              <Card key={task.id} className="opacity-75">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm line-through text-muted-foreground">{task.task_name}</h4>
                      <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                        {task.proposed_price && <span>${task.proposed_price.toLocaleString()}</span>}
                        {task.due_date && <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    {getStatusBadge(task.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractorCurrentProjectsTab;
