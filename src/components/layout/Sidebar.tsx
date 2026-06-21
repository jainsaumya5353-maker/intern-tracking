'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LineChart, BookOpen, FileText, User, Users, PieChart, Briefcase, Settings } from 'lucide-react';
import { useRole } from '@/context/RoleContext';
import { supabase } from '@/lib/supabase';

const INTERN_NAV_ITEMS = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Activity Log', href: '/activity', icon: LineChart },
  { name: 'Learnings', href: '/learnings', icon: BookOpen },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Profile', href: '/profile', icon: User },
];

const MANAGER_NAV_ITEMS = [
  { name: 'Team Overview', href: '/', icon: Users },
  { name: 'Intern Tracking', href: '/tracking', icon: Briefcase },
  { name: 'Analytics', href: '/analytics', icon: PieChart },
  { name: 'Team Reports', href: '/reports', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const { role, user } = useRole();
  const pathname = usePathname();
  const navItems = role === 'intern' ? INTERN_NAV_ITEMS : MANAGER_NAV_ITEMS;

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border h-full flex flex-col">
      <div className="p-6 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-white overflow-hidden border border-sidebar-border shadow-sm flex-shrink-0 flex items-center justify-center p-1.5">
           <img src="/logo.png" className="w-full h-full object-contain" alt="Logo" />
        </div>
        <h1 className="text-xl font-bold text-primary tracking-tighter truncate">InternTrack</h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-sidebar-foreground/70'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold uppercase overflow-hidden">
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="avatar" />
              ) : (
                <span>{user?.email?.[0] || 'U'}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.user_metadata?.full_name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{role || 'Selecting role...'}</p>
            </div>
          </div>
        </div>
        <div className="pt-2 flex flex-col gap-2">
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/login';
            }}
            className="w-full py-2 px-3 text-xs font-semibold bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-md transition-colors border border-destructive/20 text-left flex items-center space-x-2"
          >
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
