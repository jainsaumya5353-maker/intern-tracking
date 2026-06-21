'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRole } from '@/context/RoleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, MonitorPlay, Star, Info, Check, X, Ban } from 'lucide-react';
import { TaskDialog } from '@/components/features/TaskDialog';
import { LearningDialog } from '@/components/features/LearningDialog';

export function InternDashboard() {
  const { user } = useRole();
  const [tasks, setTasks] = useState<any[]>([]);
  const [learnings, setLearnings] = useState<any[]>([]);
  const [managerOfDay, setManagerOfDay] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    
    const { data: managerData } = await supabase
      .from('managers')
      .select('*, users(name, email)')
      .eq('is_manager_of_the_day', true)
      .maybeSingle();
    
    if (managerData) setManagerOfDay(managerData);

    const { data: taskData } = await supabase
      .from('tasks')
      .select('*')
      .eq('intern_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (taskData) setTasks(taskData);

    const { data: learningData } = await supabase
      .from('learnings')
      .select('*')
      .eq('intern_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (learningData) setLearnings(learningData);
    
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateTaskStatus = async (taskId: string, newStatus: string, title: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId);

    if (!error) {
      await supabase.from('activities').insert({
        user_id: user.id,
        activity_type: newStatus === 'completed' ? 'task_completed' : 'task_status_updated',
        description: `${newStatus === 'completed' ? 'Completed' : 'Updated status of'} task: ${title}`
      });
      fetchData();
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      {/* Manager of the Day Banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Star className="w-5 h-5 text-primary fill-primary/20" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">Manager of the Day</p>
            <p className="text-lg font-bold">{managerOfDay?.users?.name || 'Assigned Lead'}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.user_metadata?.full_name?.split(' ')[0] || 'Intern'}!</h1>
        </div>
        <div className="flex space-x-3">
          <LearningDialog onSave={fetchData} />
          <TaskDialog onSave={fetchData} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              {tasks.length > 0 ? tasks.map((task) => (
                <div key={task.id} className="group p-3 border rounded-lg hover:border-primary/50 transition-colors bg-card">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold">{task.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{task.description || 'No description'}</p>
                    </div>
                    <Badge variant={task.status === 'completed' ? 'default' : task.status === 'blocked' ? 'destructive' : 'secondary'} className="text-[10px] uppercase">
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  {task.status !== 'completed' && (
                    <div className="mt-3 flex items-center gap-2 pt-3 border-t border-dashed opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => updateTaskStatus(task.id, 'completed', task.title)}
                        className="text-[10px] font-bold flex items-center gap-1 bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded hover:bg-emerald-500/20"
                      >
                        <Check className="w-3 h-3" /> Mark Done
                      </button>
                      {task.status !== 'blocked' && (
                        <button 
                          onClick={() => updateTaskStatus(task.id, 'blocked', task.title)}
                          className="text-[10px] font-bold flex items-center gap-1 bg-amber-500/10 text-amber-600 px-2 py-1 rounded hover:bg-amber-500/20"
                        >
                          <Ban className="w-3 h-3" /> Blocked
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )) : <p className="text-sm text-muted-foreground py-4 text-center">No tasks yet.</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Daily Learnings</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-3">
              {learnings.length > 0 ? learnings.map((l) => (
                <div key={l.id} className="p-3 bg-secondary/50 rounded-lg border border-border/50 text-sm italic">
                  "{l.learning_text}"
                </div>
              )) : <p className="text-sm text-muted-foreground py-4 text-center">Nothing logged yet.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
