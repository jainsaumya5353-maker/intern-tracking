'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Users, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OnboardingPage() {
  const [role, setRole] = useState<'intern' | 'manager' | null>(null);
  const [managers, setManagers] = useState<any[]>([]);
  const [selectedManager, setSelectedManager] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchManagers() {
      const { data } = await supabase
        .from('managers')
        .select(`
          id,
          users (
            name,
            email
          )
        `);
      setManagers(data || []);
    }
    fetchManagers();
  }, []);

  const handleComplete = async () => {
    if (!role) return;
    if (role === 'intern' && !selectedManager) {
      alert('Please select your manager');
      return;
    }
    
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // 1. Update/Insert user profile
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email!,
          name: user.user_metadata.full_name || 'User',
          role: role,
        });

      if (userError) {
        console.error('Error updating user:', userError);
        setLoading(false);
        return;
      }

      // 2. If manager, add to managers table
      if (role === 'manager') {
        const { error: managerError } = await supabase
          .from('managers')
          .insert({ user_id: user.id });
        
        if (managerError) console.error('Error creating manager record:', managerError);
      } else {
        // If intern, add to interns table
        const { error: internError } = await supabase
          .from('interns')
          .insert({ 
            user_id: user.id,
            manager_id: selectedManager
          });
          
        if (internError) console.error('Error creating intern record:', internError);
      }

      router.push('/');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 px-4">
      <Card className="w-full max-w-xl border-border shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Set Your Profile</CardTitle>
          <CardDescription>
            {role === 'intern' ? 'Select your manager to start tracking' : 'Are you an intern or a manager?'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setRole('intern')}
              className={`relative flex flex-col items-center p-6 border-2 rounded-xl transition-all ${
                role === 'intern' 
                  ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {role === 'intern' && (
                <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full">
                  <Check className="w-3 h-3" />
                </div>
              )}
              <User className={`w-12 h-12 mb-4 ${role === 'intern' ? 'text-primary' : 'text-muted-foreground'}`} />
              <h3 className="font-bold text-lg">Intern</h3>
              <p className="text-xs text-center text-muted-foreground mt-2 px-4 italic">
                Track daily tasks and log learnings.
              </p>
            </button>

            <button
              onClick={() => setRole('manager')}
              className={`relative flex flex-col items-center p-6 border-2 rounded-xl transition-all ${
                role === 'manager' 
                  ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {role === 'manager' && (
                <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full">
                  <Check className="w-3 h-3" />
                </div>
              )}
              <Users className={`w-12 h-12 mb-4 ${role === 'manager' ? 'text-primary' : 'text-muted-foreground'}`} />
              <h3 className="font-bold text-lg">Manager</h3>
              <p className="text-xs text-center text-muted-foreground mt-2 px-4 italic">
                Manage team and track progress.
              </p>
            </button>
          </div>

          {role === 'intern' && (
             <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
               <label className="text-sm font-semibold">Who is your manager?</label>
               <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                 {managers.length > 0 ? (
                   managers.map((m) => (
                     <label 
                       key={m.id} 
                       className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                         selectedManager === m.id ? 'bg-primary/5 border-primary shadow-sm' : 'hover:bg-secondary/50'
                       }`}
                     >
                       <div className="flex items-center space-x-3 text-sm">
                         <input 
                           type="radio" 
                           name="m-selector" 
                           className="w-4 h-4 text-primary" 
                           checked={selectedManager === m.id}
                           onChange={() => setSelectedManager(m.id)}
                         />
                         <div>
                           <p className="font-medium">{m.users?.name || 'Manager'}</p>
                           <p className="text-[10px] text-muted-foreground">{m.users?.email}</p>
                         </div>
                       </div>
                     </label>
                   ))
                 ) : (
                   <p className="text-xs text-amber-600 bg-amber-50 p-4 rounded-lg border border-amber-200">
                     No managers found in the system yet. Ask your manager to sign up first!
                   </p>
                 )}
               </div>
             </div>
          )}

          <Button 
            disabled={!role || (role === 'intern' && !selectedManager) || loading} 
            onClick={handleComplete}
            className="w-full py-6 font-bold text-lg shadow-md"
          >
            {loading ? 'Setting up system...' : 'Enter InternTrack'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
