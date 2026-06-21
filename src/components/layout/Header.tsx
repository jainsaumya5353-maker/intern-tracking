import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function Header() {
  return (
    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-8">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tasks, learnings..." 
            className="w-full pl-10 bg-secondary border-none"
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
