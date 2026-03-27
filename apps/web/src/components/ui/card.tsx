import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { BodySmall, Title } from "@/components/ui/typography";

type DivProps = HTMLAttributes<HTMLDivElement>;
type HeadingProps = HTMLAttributes<HTMLHeadingElement>;
type ParagraphProps = HTMLAttributes<HTMLParagraphElement>;

export function Card({ className, ...props }: DivProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-primary bg-surface-level-1 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: DivProps) {
  return <div className={cn("space-y-2 p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HeadingProps) {
  return <Title as="h2" className={className} {...props} />;
}

export function CardDescription({ className, ...props }: ParagraphProps) {
  return <BodySmall as="p" className={className} {...props} />;
}

export function CardContent({ className, ...props }: DivProps) {
  return <div className={cn("px-6 pb-6", className)} {...props} />;
}

export function CardFooter({ className, ...props }: DivProps) {
  return (
    <div
      className={cn("border-t border-primary px-6 py-5 text-sm text-secondary", className)}
      {...props}
    />
  );
}
