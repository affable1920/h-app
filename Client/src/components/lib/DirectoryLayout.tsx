import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/utils";

export function Layout({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("min-h-screen mx-auto space-y-10", className)}>
      {children}
    </section>
  );
}

function DirectoryLayoutHeader({
  children,
  className,
}: HTMLAttributes<HTMLElement>) {
  return (
    <header className={cn("flex items-center", className)}>{children}</header>
  );
}

function DirectoryLayoutContent({
  children,
  className,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <section className={cn(className)}>{children}</section>;
}

function DirectoryLayoutFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <footer className={cn(className)}>{children}</footer>;
}

const DirectoryLayout = Object.assign(Layout, {
  Header: DirectoryLayoutHeader,
  Content: DirectoryLayoutContent,
  Footer: DirectoryLayoutFooter,
});

export default DirectoryLayout;
