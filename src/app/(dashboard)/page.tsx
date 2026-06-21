'use client';

import { useRole } from '@/context/RoleContext';
import { InternDashboard } from '@/components/features/InternDashboard';
import { ManagerDashboard } from '@/components/features/ManagerDashboard';

export default function DashboardPage() {
  const { role } = useRole();

  return role === 'intern' ? <InternDashboard /> : <ManagerDashboard />;
}

