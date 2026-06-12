"use client";

import links from "@/utils/links";
import { usePathname } from "next/navigation";
import { SiteLogo } from "@/components/layout/site-logo";
import { RippleLink } from "@/components/ui/ripple-link";

function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-full min-h-screen px-2 lg:px-4 py-2">
      <SiteLogo className="mx-auto " priority linked={false} />
      <div className="flex flex-col gap-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <RippleLink
              key={link.href}
              href={link.href}
              variant={isActive ? "default" : "ghost"}
              className="justify-start gap-x-2"
            >
              {link.icon}
              <span className="capitalize">{link.label}</span>
            </RippleLink>
          );
        })}
      </div>
    </aside>
  );
}

export default Sidebar;
