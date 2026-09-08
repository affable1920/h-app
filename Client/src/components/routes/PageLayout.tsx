import { cn } from "@/utils/utils";
import type { ReactNode } from "react";

export function PageLayout({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("max-w-7xl mx-auto py-6 pt-12", className)}>
      {children}
    </div>
  );
}
