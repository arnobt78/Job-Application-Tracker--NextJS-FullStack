'use client';

/**
 * CreateTeamForm — create a new team from /team page.
 * On success, invalidates team.current query to reload the team dashboard.
 */

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Users2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createTeamAction } from '@/utils/actions';
import { queryKeys } from '@/lib/query-keys';

export function CreateTeamForm() {
  const [name, setName] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setIsPending(true);
    setError(null);

    try {
      const team = await createTeamAction(name.trim());
      if (!team) throw new Error('Could not create team. Please try again.');
      // Invalidate to trigger refetch of team data
      await queryClient.invalidateQueries({ queryKey: queryKeys.team.current() });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <Users2 className="h-10 w-10 text-muted-foreground/40" />
        <h2 className="text-lg font-semibold">Start a Team</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Create a shared space to track job applications with colleagues or study groups.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Job Seekers 2026"
          maxLength={60}
          className="w-full rounded-lg border border-border/30 bg-black/20 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
        />

        {error && <p className="text-xs text-rose-400">{error}</p>}

        <Button type="submit" disabled={isPending || !name.trim()} className="gap-2">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users2 className="h-4 w-4" />}
          {isPending ? 'Creating…' : 'Create Team'}
        </Button>
      </form>
    </div>
  );
}
