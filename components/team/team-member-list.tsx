'use client';

/**
 * TeamMemberList — renders team members with role badges.
 * Admin/owner see a remove button (cannot remove owner).
 */

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { X, Crown, Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { removeTeamMemberAction } from '@/utils/actions';
import { queryKeys } from '@/lib/query-keys';
import { cn } from '@/lib/utils';
import type { TeamMemberType, TeamRole } from '@/utils/types';

const ROLE_STYLES: Record<TeamRole, string> = {
  owner: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  admin: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  member: 'bg-muted/30 text-muted-foreground border-border/30',
};

const ROLE_ICONS: Record<TeamRole, React.ElementType> = {
  owner: Crown,
  admin: Shield,
  member: User,
};

type Props = {
  members: TeamMemberType[];
  currentUserId: string;
  currentRole: TeamRole;
  teamId: string;
};

export function TeamMemberList({ members, currentUserId, currentRole, teamId }: Props) {
  const [removing, setRemoving] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const canManage = currentRole === 'owner' || currentRole === 'admin';

  async function handleRemove(member: TeamMemberType) {
    if (member.role === 'owner') return;
    setRemoving(member.id);
    try {
      await removeTeamMemberAction(member.id);
      await queryClient.invalidateQueries({ queryKey: queryKeys.team.current() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.team.members(teamId) });
    } finally {
      setRemoving(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {members.map((member) => {
        const RoleIcon = ROLE_ICONS[member.role as TeamRole] ?? User;
        const isMe = member.userId === currentUserId;
        const canRemove = canManage && !isMe && member.role !== 'owner';

        return (
          <div
            key={member.id}
            className="flex items-center gap-3 rounded-lg border border-border/20 bg-black/10 px-4 py-3"
          >
            {/* Avatar placeholder */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {(member.user.name ?? member.user.email)?.[0]?.toUpperCase() ?? '?'}
            </div>

            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">
                {member.user.name ?? member.user.email}
                {isMe && <span className="ml-1 text-[10px] text-muted-foreground">(you)</span>}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">{member.user.email}</p>
            </div>

            {/* Role badge */}
            <span
              className={cn(
                'flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                ROLE_STYLES[member.role as TeamRole] ?? ROLE_STYLES.member
              )}
            >
              <RoleIcon className="h-2.5 w-2.5" />
              {member.role}
            </span>

            {/* Remove button */}
            {canRemove && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-rose-400"
                disabled={removing === member.id}
                onClick={() => handleRemove(member)}
                aria-label={`Remove ${member.user.name ?? member.user.email}`}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
