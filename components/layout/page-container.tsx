import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";

type PageContainerProps = PropsWithChildren<{
  className?: string;
  as?: "div" | "section" | "main" | "header" | "footer";
}>;

/** Root content width cap — max-w-7xl, responsive horizontal padding */
export function PageContainer({
  children,
  className,
  as: Tag = "div",
}: PageContainerProps) {
  return (
    <Tag
      className={cn("mx-auto w-full max-w-7xl px-2 sm:px-4 xl:px-8", className)}
    >
      {children}
    </Tag>
  );
}
