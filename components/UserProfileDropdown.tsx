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

function getAvatarUrl(
  imageUrl: string | undefined,
  name: string | undefined,
  email: string | undefined,
  avatarError: boolean,
  hasImage: boolean
): string | null {
  if (avatarError || !imageUrl || imageUrl.trim() === '') {
    if (hasImage) return null;
    const seed = name || email || 'user';
    return `https://robohash.org/${encodeURIComponent(seed)}.png?size=80x80`;
  }
  return imageUrl;
}

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
  const avatarUrl = getAvatarUrl(
    user?.imageUrl,
    name,
    email,
    avatarError,
    hasImage
  );

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
          <div className="h-9 w-9 rounded-full border-2 overflow-hidden">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="h-full w-full object-cover"
                onError={() => setAvatarError(true)}
                referrerPolicy="no-referrer"
              />
            ) : (
              <Skeleton className="h-full w-full rounded-none" />
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">{email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/user-profile" className="flex items-center cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Manage account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => signOut({ redirectUrl: '/' })}
          className="cursor-pointer"
        >
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
