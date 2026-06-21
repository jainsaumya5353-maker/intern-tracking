'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, CheckCircle2, Trophy, ArrowRight, PlayCircle, Eye, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function ManagerDashboard() {
  const [stats, setStats] = useState({
    activeInterns: 0,
    tasksCompleted: 0,
    totalLearnings: 0
  });
  const [internsStatus, setInternsStatus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Get the manager's own ID from the managers table
        const { data: managerProfile, error: mError } = await supabase
          .from('managers')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (mError) throw mError;
        if (!managerProfile) {
          setError("Manager profile not found. Please reset and onboard again.");
          setLoading(false);
          return;
        }

        // 2. Fetch interns assigned to THIS manager
        const { data: internList, error: iError } = await supabase
          .from('interns')
          .select(`
            id,
            user_id,
            users (
              id,
              name,
              email,
              tasks!intern_id (title, status, created_at),
              learnings!intern_id (count)
            )

          `)
          .eq('manager_id', managerProfile.id);

        if (iError) throw iError;

        // 3. Process the results
        const processed = internList?.map((item: any) => {
          const u = item.users;
          const tasks = u.tasks || [];
          const inProgress = tasks.find((t: any) => t.status === 'in_progress');
          const lastCompleted = [...tasks].filter((t: any) => t.status === 'completed').sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
          
          return {
            id: u.id,
            name: u.name,
            email: u.email,
            currentTask: inProgress || lastCompleted || null,
            totalLearnings: u.learnings?.[0]?.count || 0
          };
        }) || [];

        // 4. Calculate total stats for THIS manager's team
        const { count: taskCount } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed')
          .in('intern_id', processed.map(i => i.id));

        const { count: learningCount } = await supabase
          .from('learnings')
          .select('*', { count: 'exact', head: true })
          .in('intern_id', processed.map(i => i.id));

        setStats({
          activeInterns: processed.length,
          tasksCompleted: taskCount || 0,
          totalLearnings: learningCount || 0
        });

        setInternsStatus(processed);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Synchronizing team status...</div>;

  if (error) return (
    <div className="p-8 border-2 border-dashed border-destructive/20 rounded-xl bg-destructive/5 text-center">
      <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-4" />
      <h3 className="font-bold text-destructive">Data Sync Failed</h3>
      <p className="text-sm text-destructive/80 mt-1">{error}</p>
      <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Retry Sync</Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Team Intelligence</h1>
        <p className="text-muted-foreground mt-1">Direct visibility into interns reporting to you.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider">Your Team</CardTitle>
            <Users className="w-5 h-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{stats.activeInterns}</div>
            <p className="text-xs opacity-70 mt-1">Assigned interns</p>
          </CardContent>
        </Card>
        
        <Card className="border-none bg-white shadow-sm border border-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500">Team Progress</CardTitle>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900">{stats.tasksCompleted}</div>
            <p className="text-xs text-muted-foreground mt-1">Daily goals achieved</p>
          </CardContent>
        </Card>

        <Card className="border-none bg-white shadow-sm border border-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-500">Knowledge Depth</CardTitle>
            <Trophy className="w-5 h-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900">{stats.totalLearnings}</div>
            <p className="text-xs text-muted-foreground mt-1">Logs recorded</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-6 mb-2">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">Active Daily Feed</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Automated updates from your interns.</p>
          </div>
          <Link href="/tracking">
            <Button variant="outline" size="sm" className="gap-2 text-xs font-bold border-slate-200">
              Go to Full Tracking <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-50">
            {internsStatus.map((intern) => (
              <div key={intern.id} className="group p-6 hover:bg-slate-50/80 transition-all flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border-4 border-white shadow-sm group-hover:border-primary/10 group-hover:bg-primary/5 transition-colors">
                    {intern.name?.[0]}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900">{intern.name}</h4>
                    <div className="flex items-center gap-2">
                      {intern.currentTask ? (
                         <>
                           <div className={`w-2 h-2 rounded-full ${intern.currentTask.status === 'in_progress' ? 'bg-primary animate-pulse' : 'bg-emerald-500'}`} />
                           <p className="text-xs font-semibold text-slate-600">
                             {intern.currentTask.status === 'in_progress' ? 'NOW: ' : 'LATEST: '} 
                             <span className="font-normal opacity-80">{intern.currentTask.title}</span>
                           </p>
                         </>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">Pending activity record...</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                   <div className="hidden md:block text-right">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Impact</p>
                      <p className="text-xs font-bold">{intern.totalLearnings} Learnings</p>
                   </div>
                   <Link href={`/tracking?id=${intern.id}`}>
                      <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-primary transition-all shadow-md active:scale-95">
                        <Eye className="w-3.5 h-3.5" /> View Logs
                      </button>
                   </Link>
                </div>
              </div>
            ))}
            {internsStatus.length === 0 && (
              <div className="py-20 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-slate-900 font-bold">Your team is empty</h3>
                <p className="text-sm text-muted-foreground max-w-[280px] mt-1">
                  Interns must select you as their manager during their onboarding to appear here.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
