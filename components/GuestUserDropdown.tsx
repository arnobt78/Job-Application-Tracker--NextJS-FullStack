'use client';

import { UserButton, useClerk } from '@clerk/nextjs';
import { User } from 'lucide-react';

export default function GuestUserDropdown() {
  const { signOut } = useClerk();

  const handleGuestUserClick = async () => {
    await signOut();
    window.location.href = '/sign-in?guest=true';
  };

  return (
    <UserButton afterSignOutUrl="/">
      <UserButton.MenuItems>
        <UserButton.Action
          label="Guest User"
          labelIcon={<User className="h-4 w-4" />}
          onClick={handleGuestUserClick}
        />
      </UserButton.MenuItems>
    </UserButton>
  );
}
