'use client';

import links from '@/utils/links';
import Link from 'next/link';
import { Button } from './ui/button';
import { usePathname } from 'next/navigation';
import { SafeImage } from '@/components/ui/safe-image';

function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="py-4 px-8 h-full min-h-screen">
      <SafeImage
        src="/logo.svg"
        alt="Jobify logo"
        className="mx-auto"
        width={164}
        height={50}
        priority
      />
      <div className="flex flex-col mt-20 gap-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Button
              asChild
              key={link.href}
              variant={isActive ? 'default' : 'ghost'}
              className="justify-start"
            >
              <Link href={link.href} className="flex items-center gap-x-2">
                {link.icon}
                <span className="capitalize">{link.label}</span>
              </Link>
            </Button>
          );
        })}
      </div>
    </aside>
  );
}

export default Sidebar;
