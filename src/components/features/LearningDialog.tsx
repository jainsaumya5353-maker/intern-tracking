'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRole } from '@/context/RoleContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen } from 'lucide-react';

export function LearningDialog({ onSave }: { onSave: () => void }) {
  const { user } = useRole();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');

  const handleSave = async () => {
    if (!text || !user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('learnings')
        .insert({
          intern_id: user.id,
          learning_text: text,
        });

      if (error) throw error;

      // Log activity
      await supabase.from('activities').insert({
        user_id: user.id,
        activity_type: 'learning_added',
        description: `Logged a new learning: ${text.substring(0, 50)}...`
      });

      setText('');
      setOpen(false);
      onSave();
    } catch (error) {
      console.error('Error saving learning:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex items-center space-x-2 bg-secondary text-secondary-foreground border border-border px-4 py-2 rounded-md font-medium hover:bg-secondary/80 transition-colors">
        <BookOpen className="w-4 h-4" />
        <span>Add Learning</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log a Learning</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="learning_text" className="text-sm font-medium">What did you learn?</label>
            <Textarea id="learning_text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Write down key takeaways or new skills acquired..." className="resize-none min-h-[100px]" />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={() => setOpen(false)} className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-md transition-colors border border-border">
            Cancel
          </button>
          <button 
            disabled={loading}
            onClick={handleSave} 
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Learning'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
