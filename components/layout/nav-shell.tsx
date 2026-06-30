import { PageContainer, type PageContainerWidth } from "@/components/layout/page-container";
import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";

type NavShellProps = PropsWithChildren<{
  className?: string;
  /** public = landing/auth nav | app = dashboard nav */
  width?: PageContainerWidth;
}>;

/**
 * Shared nav chrome — fixed h-14, glass backdrop-blur, z-50.
 * Server component (no hooks). LandingNav, AuthNav, DashboardNav all compose this.
 */
export function NavShell({ children, className, width = "public" }: NavShellProps) {
  return (
    <header
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-50 h-14 backdrop-blur-sm",
        className,
      )}
    >
      <PageContainer
        as="div"
        width={width}
        className="pointer-events-auto flex h-full items-center justify-between gap-4 bg-transparent"
      >
        {children}
      </PageContainer>
    </header>
  );
}
