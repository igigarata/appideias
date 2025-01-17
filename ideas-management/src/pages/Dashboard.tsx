import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { PlusIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { IdeaCard } from '@/components/IdeaCard';
import { NewIdeaForm } from '@/components/NewIdeaForm';
import type { Idea } from '@/types';

export function Dashboard() {
  const [isNewIdeaModalOpen, setIsNewIdeaModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: ideas, isLoading } = useQuery({
    queryKey: ['ideas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ideas')
        .select(`
          *,
          user:users(*),
          comments:comments(*),
          attachments:attachments(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Idea[];
    },
  });

  const createIdeaMutation = useMutation({
    mutationFn: async (newIdea: any) => {
      const { data, error } = await supabase
        .from('ideas')
        .insert([newIdea])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      setIsNewIdeaModalOpen(false);
      toast.success('Idea submitted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to submit idea. Please try again.');
      console.error('Error creating idea:', error);
    },
  });

  const voteMutation = useMutation({
    mutationFn: async ({ ideaId, type }: { ideaId: string; type: 'up' | 'down' }) => {
      const { data, error } = await supabase
        .from('votes')
        .insert([
          {
            idea_id: ideaId,
            type,
          },
        ])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
    },
    onError: (error) => {
      toast.error('Failed to vote. Please try again.');
      console.error('Error voting:', error);
    },
  });

  const handleVote = (ideaId: string, type: 'up' | 'down') => {
    voteMutation.mutate({ ideaId, type });
  };

  const handleComment = (ideaId: string) => {
    // Implement comment functionality
    console.log('Comment on idea:', ideaId);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Ideas Dashboard</h1>
        <Button onClick={() => setIsNewIdeaModalOpen(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          New Idea
        </Button>
      </div>

      <div className="grid gap-6">
        {ideas?.map((idea) => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            onVote={handleVote}
            onComment={handleComment}
          />
        ))}
      </div>

      {isNewIdeaModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Submit New Idea</h2>
            <NewIdeaForm
              onSubmit={createIdeaMutation.mutate}
              isLoading={createIdeaMutation.isPending}
            />
            <Button
              variant="ghost"
              onClick={() => setIsNewIdeaModalOpen(false)}
              className="mt-4"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
