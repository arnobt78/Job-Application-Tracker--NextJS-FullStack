'use client';

import { useClerk } from '@clerk/nextjs';
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
import { Settings, LogOut } from 'lucide-react';
import { SafeImage } from '@/components/ui/safe-image';
import { resolveAvatarUrl } from '@/lib/auth/avatar-url';
import { useNavUserSession } from '@/hooks/useNavUserSession';
import { scheduleGoodbyeAfterRedirect } from '@/lib/notifications/app-toast';
import { cn } from '@/lib/utils';

/**
 * Navbar profile menu — SSR snapshot + Clerk useUser merge via useNavUserSession.
 * Avatar button always mounted (stable DOM); pulse overlay only on true cold load.
 */
export default function UserProfileDropdown() {
  const { signOut } = useClerk();
  const { effectiveUser, displayName, email, avatarLoading } =
    useNavUserSession();
  const [avatarError, setAvatarError] = useState(false);

  const avatarUrl = effectiveUser
    ? resolveAvatarUrl({
        imageUrl: effectiveUser.imageUrl,
        name: displayName,
        email,
        hasImage: effectiveUser.hasImage,
        avatarError,
      })
    : '';

  const handleSignOut = async () => {
    scheduleGoodbyeAfterRedirect(displayName);
    try {
      await signOut({ redirectUrl: '/' });
    } catch {
      window.location.assign('/');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full p-0"
          disabled={avatarLoading}
          aria-label="Account menu"
        >
          <div className="relative h-9 w-9 overflow-hidden rounded-full border-2">
            {avatarUrl ? (
              <SafeImage
                src={avatarUrl}
                alt={displayName}
                width={36}
                height={36}
                className="h-full w-full object-cover"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <div
                className={cn(
                  'h-full w-full bg-muted/60',
                  avatarLoading && 'animate-pulse'
                )}
                aria-hidden
              />
            )}
            {avatarLoading ? (
              <span
                className="absolute inset-0 rounded-full bg-muted/80 animate-pulse"
                aria-hidden
              />
            ) : null}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 backdrop-blur-sm">
        <DropdownMenuLabel>
          <p className="font-medium">{displayName}</p>
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
