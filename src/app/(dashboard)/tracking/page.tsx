'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowLeft, BookOpen, Clock, CheckCircle, ChevronRight, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function TrackingContent() {
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('id');
  
  const [interns, setInterns] = useState<any[]>([]);
  const [selectedIntern, setSelectedIntern] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInterns() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Find my manager ID
        const { data: managerProfile } = await supabase
          .from('managers')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!managerProfile) {
          setLoading(false);
          return;
        }

        // 2. Fetch my team
        const { data: internList } = await supabase
          .from('interns')
          .select(`
            id,
            users (
              id,
              name,
              email,
              tasks!intern_id (*),
              learnings!intern_id (*)
            )
          `)
          .eq('manager_id', managerProfile.id);

        
        const processed = internList?.map((i: any) => ({
          ...i.users,
          tasks: i.users.tasks || [],
          learnings: i.users.learnings || []
        })) || [];

        setInterns(processed);
        
        if (selectedId && processed) {
          setSelectedIntern(processed.find(i => i.id === selectedId));
        }
      } catch (err) {
        console.error('Tracking fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchInterns();
  }, [selectedId]);

  const filteredInterns = interns.filter(i => 
    i.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse font-medium">Retrieving team records...</div>;

  return (
    <div className="space-y-6">
      {selectedIntern ? (
        <div className="space-y-6">
          <button 
            onClick={() => setSelectedIntern(null)}
            className="flex items-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Team List
          </button>

          <header className="flex items-center justify-between bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center space-x-6">
               <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-black shadow-inner border-4 border-white">
                {selectedIntern.name?.[0]}
              </div>
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedIntern.name}</h2>
                <p className="text-slate-500 font-medium">{selectedIntern.email}</p>
              </div>
            </div>
            <div className="text-right space-y-2">
              <Badge className="bg-emerald-500 hover:bg-emerald-600 px-4 py-1 font-bold tracking-wider">TEAM MEMBER</Badge>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Verified Intern Profile</p>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-sm border-slate-100 rounded-2xl overflow-hidden">
              <CardHeader className="border-b bg-slate-50/50 py-5 px-6">
                <CardTitle className="flex items-center text-lg font-bold text-slate-800">
                  <Clock className="w-5 h-5 mr-3 text-primary" />
                  Full Task History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {selectedIntern.tasks?.length > 0 ? selectedIntern.tasks.sort((a:any, b:any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((task: any) => (
                    <div key={task.id} className="p-5 border border-slate-100 rounded-xl bg-white shadow-sm hover:border-primary/20 transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-slate-900">{task.title}</h4>
                        <Badge variant={task.status === 'completed' ? 'default' : task.status === 'blocked' ? 'destructive' : 'secondary'} className="text-[9px] font-black tracking-widest uppercase py-0.5">
                          {task.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {task.description || 'No description provided.'}
                      </p>
                      <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center">
                           <Clock className="w-3 h-3 mr-1" /> {new Date(task.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] font-bold text-muted-foreground">
                          {new Date(task.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                  )) : <p className="text-muted-foreground text-sm py-12 text-center italic border border-dashed rounded-xl">No tasks logged in this cycle.</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-100 rounded-2xl overflow-hidden">
              <CardHeader className="border-b bg-amber-50/30 py-5 px-6">
                <CardTitle className="flex items-center text-lg font-bold text-amber-900">
                  <BookOpen className="w-5 h-5 mr-3 text-amber-600" />
                  Learning Repository
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                 <div className="space-y-4">
                  {selectedIntern.learnings?.length > 0 ? selectedIntern.learnings.sort((a:any, b:any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((l: any) => (
                    <div key={l.id} className="p-5 border border-amber-100 rounded-xl bg-amber-50/20 shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-amber-200 group-hover:bg-amber-400 transition-colors" />
                      <p className="text-sm font-bold text-amber-900 italic leading-relaxed">"{l.learning_text}"</p>
                      <p className="text-[10px] text-amber-600/60 font-black mt-4 uppercase tracking-tighter text-right">
                        Added {new Date(l.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  )) : <p className="text-muted-foreground text-sm py-12 text-center italic border border-dashed rounded-xl">No learnings recorded yet.</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">Team Navigator</h1>
              <p className="text-slate-500 font-medium mt-1">Review performance logs for all interns reporting to you.</p>
            </div>
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Find an intern..." 
                className="pl-11 pr-6 py-3 border border-slate-200 rounded-xl text-sm w-full md:w-80 shadow-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInterns.map((intern) => (
              <Card 
                key={intern.id} 
                className="hover:border-primary border-slate-100 transition-all cursor-pointer group shadow-sm hover:shadow-xl hover:-translate-y-1 duration-300 rounded-2xl"
                onClick={() => setSelectedIntern(intern)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary font-black text-xl group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-300">
                      {intern.name?.[0]}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg group-hover:text-primary transition-colors">{intern.name}</h3>
                      <p className="text-xs font-bold text-slate-400 truncate max-w-[160px]">{intern.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-50">
                    <div className="text-center group-hover:bg-slate-50 p-2 rounded-xl transition-colors">
                      <p className="text-xl font-black text-slate-900">{intern.tasks?.length || 0}</p>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Tasks</p>
                    </div>
                    <div className="text-center group-hover:bg-slate-50 p-2 rounded-xl transition-colors border-l border-slate-100">
                      <p className="text-xl font-black text-slate-900">{intern.learnings?.length || 0}</p>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Insights</p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-center">
                    <span className="w-full text-center text-xs font-black text-slate-400 uppercase tracking-widest py-3 border border-slate-100 rounded-xl group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                      Analyze Performance
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredInterns.length === 0 && (
              <div className="col-span-full py-32 text-center bg-white border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                   <Users className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-slate-900 font-bold text-lg">No Interns Identified</h3>
                <p className="text-sm text-muted-foreground max-w-[300px] mt-2 font-medium">
                  Use the Search bar above, or ensure your interns have assigned you as their manager.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={<div>Loading Tracking Control...</div>}>
      <TrackingContent />
    </Suspense>
  );
}
