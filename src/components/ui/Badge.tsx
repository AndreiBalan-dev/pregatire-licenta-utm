import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export function Badge({ children, color, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide uppercase whitespace-nowrap",
        "border",
        className
      )}
      style={{
        color: color || "var(--color-text-secondary)",
        borderColor: color ? `${color}40` : "var(--color-border)",
        backgroundColor: color ? `${color}15` : "var(--color-bg-tertiary)",
      }}
    >
      {children}
    </span>
  );
}
