'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRole } from '@/context/RoleContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { User, AlertTriangle, RefreshCw, Mail, Calendar, Key } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, role, refreshRole } = useRole();
  const [resetting, setResetting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const router = useRouter();

  const handleReset = async () => {
    if (!user) return;
    if (confirmText !== 'RESET') {
      alert('Please type RESET to confirm.');
      return;
    }
    
    setResetting(true);
    
    try {
      // 1. Delete user profile record
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      if (error) throw error;

      // 2. Refresh context and redirect
      await refreshRole();
      router.push('/onboarding');
    } catch (err) {
      console.error('Error resetting profile:', err);
      alert('Failed to reset profile. Please try again.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your identity and account settings.</p>
      </header>

      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center space-x-4 pb-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary border border-primary/20 overflow-hidden">
            {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} className="w-full h-full object-cover" />
            ) : (
                user?.email?.[0].toUpperCase()
            )}
          </div>
          <div>
            <CardTitle className="text-2xl">{user?.user_metadata?.full_name || 'Anonymous User'}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="font-bold border-primary/20 text-primary uppercase text-[10px]">
                {role || 'NO ROLE'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="flex items-center space-x-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="truncate">{user?.email}</span>
             </div>
             <div className="flex items-center space-x-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Joined {new Date(user?.created_at || '').toLocaleDateString()}</span>
             </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Reseting will clear your current role and profile. This is permanent.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-destructive/10 space-y-3">
             <p className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
               <Key className="w-3 h-3" /> Type RESET to confirm
             </p>
             <Input 
               placeholder="RESET" 
               className="border-destructive/20 focus-visible:ring-destructive"
               value={confirmText}
               onChange={(e) => setConfirmText(e.target.value)}
             />
             <Button 
                variant="destructive" 
                disabled={resetting || confirmText !== 'RESET'}
                onClick={handleReset}
                className="w-full sm:w-auto flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
                {resetting ? 'Resetting Profile...' : 'Confirm Reset Profile'}
              </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
