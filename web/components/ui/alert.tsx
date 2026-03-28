import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type AlertProps = HTMLAttributes<HTMLDivElement>;

export function Alert({ className, ...props }: AlertProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-primary bg-subtle px-4 py-3 text-sm leading-6 text-primary",
        className,
      )}
      {...props}
    />
  );
}
