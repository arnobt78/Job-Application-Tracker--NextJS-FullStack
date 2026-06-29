'use client';

/**
 * InviteMemberForm — admin/owner invite a user by email to the team.
 */

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { UserPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { inviteTeamMemberAction } from '@/utils/actions';
import { queryKeys } from '@/lib/query-keys';
import type { TeamType } from '@/utils/types';

type Props = {
  team: TeamType;
};

export function InviteMemberForm({ team }: Props) {
  const [email, setEmail] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const queryClient = useQueryClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setIsPending(true);
    setMessage(null);

    try {
      const result = await inviteTeamMemberAction(email.trim());
      if (result.success) {
        setEmail('');
        setMessage({ type: 'success', text: 'Invitation sent!' });
        await queryClient.invalidateQueries({ queryKey: queryKeys.team.members(team.id) });
        await queryClient.invalidateQueries({ queryKey: queryKeys.team.current() });
      } else {
        setMessage({ type: 'error', text: result.error ?? 'Could not invite member.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="colleague@email.com"
          className="flex-1 rounded-lg border border-border/30 bg-black/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50"
        />
        <Button type="submit" size="sm" disabled={isPending || !email.trim()} className="gap-1.5 shrink-0">
          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
          Invite
        </Button>
      </form>

      {message && (
        <p className={`text-xs ${message.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
