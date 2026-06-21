'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { BookOpen, CheckCircle, Clock, TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>({
    taskStats: [],
    learningStats: [],
    contribution: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      // 1. Task Status distribution
      const { data: tasks } = await supabase.from('tasks').select('status');
      const counts = tasks?.reduce((acc: any, t: any) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
      }, {});
      
      const pieData = Object.keys(counts || {}).map(key => ({
        name: key.replace('_', ' ').toUpperCase(),
        value: counts[key]
      }));

      // 2. Intern activity (tasks + learnings)
      const { data: interns } = await supabase
        .from('users')
        .select('name, tasks(count), learnings(count)')
        .eq('role', 'intern');
      
      const barData = interns?.map((i: any) => ({
        name: i.name || 'Intern',
        tasks: i.tasks?.[0]?.count || 0,
        learnings: i.learnings?.[0]?.count || 0
      }));

      setData({
        taskStats: pieData,
        internActivity: barData,
      });
      setLoading(false);
    }
    fetchAnalytics();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) return <div className="p-8 text-center">Crunching team data...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team Analytics</h1>
        <p className="text-muted-foreground mt-2">Insights into productivity, learning trends, and team success.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Overall Task Status</CardTitle>
            <CardDescription>Distribution of and task states across the team.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.taskStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}

                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.taskStats.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Activity by Intern</CardTitle>
            <CardDescription>Comparison of tasks completed and learnings logged per person.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.internActivity}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Bar dataKey="tasks" fill="#0088FE" radius={[4, 4, 0, 0]} name="Tasks" />
                <Bar dataKey="learnings" fill="#FFBB28" radius={[4, 4, 0, 0]} name="Learnings" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-primary/5 border rounded-xl flex items-center space-x-4">
             <div className="p-2 bg-primary/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-primary" />
             </div>
             <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Highest Productivity</p>
                <p className="text-sm font-bold truncate">Most active day: Wed</p>
             </div>
          </div>
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center space-x-4">
             <div className="p-2 bg-emerald-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
             </div>
             <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Goal Velocity</p>
                <p className="text-sm font-bold">+12% vs last week</p>
             </div>
          </div>
      </div>
    </div>
  );
}
