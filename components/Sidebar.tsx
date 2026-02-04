"use client";
import links from "@/utils/links";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";

function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="py-4 px-8 bg-muted h-full">
      {/* 
        Next.js Image component with file from public folder
        - Files in public folder are served from root path (/)
        - width and height are required for Next.js Image optimization
        - These should match the actual SVG dimensions for best results
      */}
      <Image
        src="/logo.svg"
        alt="jobify logo"
        className="mx-auto"
        width={164}
        height={50}
        priority
      />
      <div className="flex flex-col mt-20 gap-y-4">
        {links.map((link) => {
          return (
            <Button
              asChild
              key={link.href}
              variant={pathname === link.href ? "default" : "link"}
            >
              <Link href={link.href} className="flex items-center gap-x-2 ">
                {link.icon} <span className="capitalize">{link.label}</span>
              </Link>
            </Button>
          );
        })}
      </div>
    </aside>
  );
}
export default Sidebar;
