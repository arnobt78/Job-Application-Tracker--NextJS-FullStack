'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings, LogOut } from 'lucide-react';
import { SafeImage } from '@/components/ui/safe-image';
import { resolveAvatarUrl } from '@/lib/auth/avatar-url';
import {
  scheduleGoodbyeAfterRedirect,
} from '@/lib/notifications/app-toast';

export default function UserProfileDropdown() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [avatarError, setAvatarError] = useState(false);

  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.username ||
    'User';
  const email = user?.primaryEmailAddress?.emailAddress || '';
  const hasImage = user?.hasImage ?? false;
  const avatarUrl = resolveAvatarUrl({
    imageUrl: user?.imageUrl,
    name,
    email,
    hasImage,
    avatarError,
  });

  const handleSignOut = async () => {
    scheduleGoodbyeAfterRedirect(name);
    try {
      await signOut({ redirectUrl: '/' });
    } catch {
      window.location.assign('/');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
          <div className="h-9 w-9 overflow-hidden rounded-full border-2">
            {avatarUrl ? (
              <SafeImage
                src={avatarUrl}
                alt={name}
                width={36}
                height={36}
                className="h-full w-full object-cover"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <Skeleton className="h-full w-full rounded-none" />
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 backdrop-blur-sm">
        <DropdownMenuLabel>
          <p className="font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">{email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/user-profile" className="flex cursor-pointer items-center">
            <Settings className="mr-2 h-4 w-4" />
            Manage account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          Secured by Clerk
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
