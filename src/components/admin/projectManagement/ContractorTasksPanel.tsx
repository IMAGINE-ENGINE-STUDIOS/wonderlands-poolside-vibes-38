import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { HardHat, MapPin, DollarSign, Calendar, Clock, CheckCircle, PlayCircle } from 'lucide-react';

interface ContractorTask {
  id: string;
  task_name: string;
  description: string | null;
  location: string | null;
  start_date: string | null;
  due_date: string | null;
  proposed_price: number | null;
  status: string;
  contractor_id: string;
  contractors: {
    company_name: string;
    contact_name: string;
  } | null;
}

interface ContractorTasksPanelProps {
  projectId: string;
}

const ContractorTasksPanel: React.FC<ContractorTasksPanelProps> = ({ projectId }) => {
  const [tasks, setTasks] = useState<ContractorTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      const { data } = await supabase
        .from('contractor_project_tasks')
        .select('*, contractors(company_name, contact_name)')
        .eq('project_id', projectId)
        .order('start_date', { ascending: true }) as any;
      setTasks(data || []);
      setLoading(false);
    };
    fetchTasks();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`contractor-tasks-${projectId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'contractor_project_tasks',
        filter: `project_id=eq.${projectId}`,
      }, () => { fetchTasks(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [projectId]);

  if (loading || tasks.length === 0) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-3 w-3 text-green-400" />;
      case 'in_progress': return <PlayCircle className="h-3 w-3 text-yellow-400" />;
      default: return <Clock className="h-3 w-3 text-cyan-400/60" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px] font-mono">Completed</Badge>;
      case 'in_progress': return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px] font-mono">In Progress</Badge>;
      default: return <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-[10px] font-mono">Assigned</Badge>;
    }
  };

  const isOverdue = (dueDate: string | null, status: string) => {
    if (!dueDate || status === 'completed') return false;
    return new Date(dueDate) < new Date();
  };

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="holographic-panel rounded-lg border border-cyan-500/20 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HardHat className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-mono text-cyan-300 uppercase tracking-wider font-bold">
            Contractor Progress
          </span>
        </div>
        <span className="text-xs font-mono text-cyan-400/60">
          {completedCount}/{tasks.length} tasks • {progress}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-cyan-900/30 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            progress === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-emerald-500 to-cyan-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Tasks list */}
      <div className="space-y-2">
        {tasks.map(task => (
          <div
            key={task.id}
            className={`rounded border p-2.5 ${
              isOverdue(task.due_date, task.status)
                ? 'border-red-500/30 bg-red-500/5'
                : task.status === 'completed'
                  ? 'border-green-500/20 bg-green-500/5'
                  : 'border-cyan-500/10 bg-cyan-500/5'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  {getStatusIcon(task.status)}
                  <span className={`text-xs font-mono ${task.status === 'completed' ? 'text-cyan-400/40 line-through' : 'text-cyan-300'}`}>
                    {task.task_name}
                  </span>
                  {isOverdue(task.due_date, task.status) && (
                    <Badge variant="destructive" className="text-[9px] h-4 px-1">Overdue</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono text-cyan-400/50">
                  <HardHat className="h-2.5 w-2.5" />
                  {(task.contractors as any)?.company_name || 'Contractor'}
                </div>
                <div className="flex flex-wrap gap-3 text-[10px] font-mono text-cyan-400/40">
                  {task.location && <span className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{task.location}</span>}
                  {task.proposed_price && <span className="flex items-center gap-1"><DollarSign className="h-2.5 w-2.5" />${task.proposed_price.toLocaleString()}</span>}
                  {task.start_date && <span className="flex items-center gap-1"><Calendar className="h-2.5 w-2.5" />Start: {new Date(task.start_date).toLocaleDateString()}</span>}
                  {task.due_date && <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" />Due: {new Date(task.due_date).toLocaleDateString()}</span>}
                </div>
              </div>
              {getStatusBadge(task.status)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContractorTasksPanel;
