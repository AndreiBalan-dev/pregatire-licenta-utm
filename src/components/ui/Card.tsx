import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  accent?: string;
  hover?: boolean;
}

export function Card({ accent, hover = false, className, children, style, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)]",
        accent && "border-l-[3px]",
        hover && "module-card cursor-pointer",
        className
      )}
      style={{
        ...(accent ? { borderLeftColor: accent } : {}),
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
