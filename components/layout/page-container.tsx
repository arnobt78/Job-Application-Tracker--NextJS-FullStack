import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";

/** public = landing/auth (max-w-7xl) | app = logged-in dashboard shell (max-w-9xl) */
export type PageContainerWidth = "public" | "app";

const widthClasses: Record<PageContainerWidth, string> = {
  public: "max-w-7xl",
  app: "max-w-9xl",
};

type PageContainerProps = PropsWithChildren<{
  className?: string;
  as?: "div" | "section" | "main" | "header" | "footer";
  width?: PageContainerWidth;
}>;

/** Root content width cap — responsive horizontal padding */
export function PageContainer({
  children,
  className,
  as: Tag = "div",
  width = "public",
}: PageContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-2 sm:px-4 xl:px-8",
        widthClasses[width],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
