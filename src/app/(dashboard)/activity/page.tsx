'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRole } from '@/context/RoleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, CheckCircle2, BookOpen, Clock } from 'lucide-react';

export default function ActivityLogPage() {
  const { user } = useRole();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivities() {
      if (!user) return;
      const { data } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });
      
      setActivities(data || []);
      setLoading(false);
    }
    fetchActivities();
  }, [user]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'task_completed': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'task_started': return <Clock className="w-4 h-4 text-primary" />;
      case 'learning_added': return <BookOpen className="w-4 h-4 text-amber-500" />;
      default: return <History className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (loading) return <div className="p-8 text-center">Loading activity log...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
        <p className="text-muted-foreground mt-2">A history of everything you've accomplished and learned.</p>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <History className="w-5 h-5 mr-2 text-primary" />
            Recent Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative space-y-0 translate-y-2">
            {/* Timeline Line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border ml-[2px]" />

            {activities.length > 0 ? activities.map((activity, i) => (
              <div key={activity.id} className="relative pl-10 pb-8 last:pb-2">
                {/* Timeline Dot */}
                <div className="absolute left-0 top-1 p-1 bg-white border-2 border-border rounded-full z-10">
                  {getIcon(activity.activity_type)}
                </div>
                
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">
                      {activity.description}
                    </p>
                    <span className="text-[10px] text-muted-foreground font-medium bg-secondary px-2 py-0.5 rounded">
                      {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <div className="mt-1">
                    <Badge variant="outline" className="text-[9px] uppercase tracking-wider">
                      {activity.activity_type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            )) : (
              <div className="py-20 text-center text-muted-foreground">
                <p>You haven't logged any activities yet.</p>
                <p className="text-xs">Go to your dashboard to start tracking!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
