import { cn } from "@/utils/utils";
import type { HTMLAttributes, ReactNode } from "react";

export function CardHeader({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLElement>) {
  return (
    <header {...rest} className={cn("shrink-0 flex-1", className)}>
      {children}
    </header>
  );
}

export function CardTitle({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      {...rest}
      className={cn("text-md capitalize text-text-normal", className)}
    >
      {children}
    </h1>
  );
}

export function CardDescription({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn(className)} {...rest}>
      {children}
    </p>
  );
}

export function CardBody({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...rest} className={cn(className)}>
      {children}
    </div>
  );
}

export function CardWrapper({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "bg-layout/20 border border-border/80 rounded-xl p-4 md:p-6 space-y-6 shadow-md shadow-black/40",
        className,
      )}
    >
      {children}
    </article>
  );
}

interface CardFooterProps extends HTMLAttributes<HTMLElement> {
  selfAlign?: "start" | "center" | "end";
}

export function CardFooter({ className, children, ...rest }: CardFooterProps) {
  return (
    <footer {...rest} className={cn(className)}>
      {children}
    </footer>
  );
}

const Card = Object.assign(CardWrapper, {
  Header: CardHeader,
  Body: CardBody,
  Title: CardTitle,
  Description: CardDescription,
  Footer: CardFooter,
});

export default Card;
