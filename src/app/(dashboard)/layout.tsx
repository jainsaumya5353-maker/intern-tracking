import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { RoleProvider } from '@/context/RoleContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleProvider>
      <div className="flex h-screen bg-background overflow-hidden relative">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-6xl mx-auto space-y-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </RoleProvider>
  );
}

