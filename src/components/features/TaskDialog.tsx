'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRole } from '@/context/RoleContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function TaskDialog({ onSave }: { onSave: () => void }) {
  const { user } = useRole();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('in_progress');
  const [desc, setDesc] = useState('');

  const handleSave = async () => {
    if (!title || !user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          intern_id: user.id,
          title,
          status,
          description: desc,
        });

      if (error) throw error;

      // Log activity
      await supabase.from('activities').insert({
        user_id: user.id,
        activity_type: status === 'completed' ? 'task_completed' : 'task_started',
        description: `${status === 'completed' ? 'Completed' : 'Started'} task: ${title}`
      });

      setTitle('');
      setDesc('');
      setOpen(false);
      onSave();
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors">
        <PlusCircle className="w-4 h-4" />
        <span>Log Task</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log a New Task Update</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="title" className="text-sm font-medium">Task Title</label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What are you working on?" />
          </div>
          <div className="grid gap-2">
             <label htmlFor="status" className="text-sm font-medium">Status</label>
             <Select value={status} onValueChange={(val) => setStatus(val || 'in_progress')}>
              <SelectTrigger>
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Textarea id="description" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Brief details about the task..." className="resize-none" />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={() => setOpen(false)} className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-md transition-colors">
            Cancel
          </button>
          <button 
            disabled={loading}
            onClick={handleSave} 
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Task'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
