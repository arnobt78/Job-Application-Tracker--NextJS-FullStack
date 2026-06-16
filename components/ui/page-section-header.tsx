import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageSectionHeaderProps = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  /** Optional count pill rendered beside the title */
  badge?: ReactNode;
  /** Optional slot on the right (e.g. action button) */
  trailing?: ReactNode;
  /** h1 for page-level, h2 for subsections */
  headingLevel?: "h1" | "h2";
  className?: string;
};

/**
 * Reusable dashboard section header — icon + title + subtitle with responsive layout.
 * Server-safe (no hooks). Use headingLevel="h1" for page title, "h2" for subsections.
 */
export function PageSectionHeader({
  icon: Icon,
  title,
  subtitle,
  badge,
  trailing,
  headingLevel = "h2",
  className,
}: PageSectionHeaderProps) {
  const Heading = headingLevel;
  const titleSize =
    headingLevel === "h1"
      ? "text-2xl font-bold sm:text-3xl"
      : "text-lg font-semibold sm:text-xl";

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start">
        <Icon
          className="h-6 w-6 shrink-0 text-primary sm:mt-0.5 sm:h-7 sm:w-7"
          aria-hidden
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Heading className={cn("leading-tight", titleSize)}>
              {title}
            </Heading>
            {badge}
          </div>
          <p className="text-sm leading-snug text-muted-foreground">
            {subtitle}
          </p>
        </div>
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  );
}
