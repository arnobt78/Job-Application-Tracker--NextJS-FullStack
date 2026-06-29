'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Users2, AlertCircle, RefreshCw } from 'lucide-react';
import { queryKeys } from '@/lib/query-keys';
import { getTeamAction } from '@/utils/actions';
import { CreateTeamForm } from '@/components/team/create-team-form';
import { InviteMemberForm } from '@/components/team/invite-member-form';
import { TeamMemberList } from '@/components/team/team-member-list';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TeamRole } from '@/utils/types';

type Props = {
  userId: string;
};

export function TeamDashboard({ userId }: Props) {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.team.current(),
    queryFn: () => getTeamAction(),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <GlassCard variant="violet">
            <div className="flex flex-col gap-4 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-border/20 bg-black/10 px-4 py-3">
                  <div className="h-8 w-8 animate-pulse rounded-full bg-muted/20" />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <div className="h-3.5 w-32 animate-pulse rounded bg-muted/20" />
                    <div className="h-3 w-48 animate-pulse rounded bg-muted/20" />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <AlertCircle className="h-8 w-8 text-rose-400" />
        <p className="text-sm text-muted-foreground">Failed to load team data.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => queryClient.invalidateQueries({ queryKey: queryKeys.team.current() })}
          className="gap-2"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  // No team yet — show create form
  if (!data) {
    return (
      <div className="mx-auto max-w-md">
        <GlassCard variant="violet">
          <CreateTeamForm />
        </GlassCard>
      </div>
    );
  }

  const { team, members, role } = data;
  const canManage = role === 'owner' || role === 'admin';

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Members list + invite */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        {canManage && (
          <GlassCard variant="sky">
            <h3 className="mb-3 text-sm font-semibold text-sky-300">Invite Member</h3>
            <InviteMemberForm team={team} />
          </GlassCard>
        )}

        <GlassCard variant="violet">
          <h3 className="mb-3 text-sm font-semibold text-violet-300">
            Members <span className="ml-1 text-muted-foreground/60">({members.length})</span>
          </h3>
          <TeamMemberList
            members={members}
            currentUserId={userId}
            currentRole={role as TeamRole}
            teamId={team.id}
          />
        </GlassCard>
      </div>

      {/* Team info panel */}
      <div className="flex flex-col gap-4">
        <GlassCard variant="emerald">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Users2 className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-emerald-300">Team Info</h3>
            </div>

            <div className="rounded-lg border border-border/20 bg-black/20 px-4 py-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Team name</p>
              <p className="text-sm font-semibold">{team.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-border/20 bg-black/20 px-3 py-2.5 text-center">
                <p className="text-2xl font-bold tabular-nums text-emerald-400">{members.length}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Members</p>
              </div>
              <div className="rounded-lg border border-border/20 bg-black/20 px-3 py-2.5 text-center">
                <p className={cn(
                  'text-sm font-semibold capitalize',
                  role === 'owner' ? 'text-amber-400' : role === 'admin' ? 'text-violet-400' : 'text-muted-foreground'
                )}>
                  {role}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Your role</p>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="neutral">
          <h3 className="mb-2 text-sm font-semibold">How team mode works</h3>
          <ul className="flex flex-col gap-2 text-xs text-muted-foreground">
            <li>• Team members can see each other&apos;s job applications</li>
            <li>• Admins and owners can invite or remove members</li>
            <li>• Owners can delegate admin rights to trusted members</li>
            <li>• Each member&apos;s data stays private unless shared to the team</li>
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}
