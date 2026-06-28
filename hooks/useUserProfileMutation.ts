'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { upsertUserProfileAction } from '@/utils/actions';
import type { UserProfileType } from '@/utils/types';
import { queryKeys } from '@/lib/query-keys';
import { toast } from 'sonner';

type UserProfileInput = Partial<Omit<UserProfileType, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;

/** Upsert user profile — updates AI personalisation data (skills, resume, etc.) */
export function useUserProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserProfileInput) => upsertUserProfileAction(data),
    onSuccess: (result) => {
      if (!result) {
        toast.error('Profile save failed', {
          description: 'Could not update your profile. Please try again.',
          duration: 4000,
        });
        return;
      }
      // Update cache immediately — no broadcast needed (profile is user-scoped, no cross-tab impact)
      queryClient.setQueryData(queryKeys.userProfile(), result);
      toast.success('Profile saved', {
        description: 'Your AI personalisation profile has been updated.',
        duration: 3500,
      });
    },
    onError: () => {
      toast.error('Profile save failed', {
        description: 'Could not update your profile. Please try again.',
        duration: 4000,
      });
    },
  });
}
