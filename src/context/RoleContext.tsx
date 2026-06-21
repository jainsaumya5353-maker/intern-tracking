'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

type Role = 'intern' | 'manager';

interface RoleContextType {
  role: Role | null;
  user: any | null;
  loading: boolean;
  refreshRole: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUserRole = async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !data) {
      if (pathname !== '/onboarding') {
        router.push('/onboarding');
      }
      return null;
    }
    return data.role as Role;
  };

  const refreshRole = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      setUser(session.user);
      const userRole = await fetchUserRole(session.user.id);
      setRole(userRole);
    } else {
      setUser(null);
      setRole(null);
      if (pathname !== '/login' && pathname !== '/auth/callback') {
        router.push('/login');
      }
    }
    if (isInitial) setLoading(false);
  };

  useEffect(() => {
    // Only fetch session on mount
    refreshRole(true);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser(session.user);
          const userRole = await fetchUserRole(session.user.id);
          setRole(userRole);
        } else {
          setUser(null);
          setRole(null);
          if (pathname !== '/login' && pathname !== '/auth/callback' && pathname !== '/onboarding') {
            router.push('/login');
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []); // Run only once on mount

  // Handle protected redirects when pathname changes, but without setting 'loading'
  useEffect(() => {
    const checkProtection = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session && pathname !== '/login' && pathname !== '/auth/callback') {
        router.push('/login');
      }
    };
    checkProtection();
  }, [pathname]);


  return (
    <RoleContext.Provider value={{ role, user, loading, refreshRole }}>
      {loading ? (
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        children
      )}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}

