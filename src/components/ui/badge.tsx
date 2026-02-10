import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "green" | "amber" | "red" | "muted";
  className?: string;
};

const variantClasses = {
  default: "border-border-secondary text-text-secondary",
  green: "border-neon-green/30 text-neon-green bg-neon-green/5",
  amber: "border-amber/30 text-amber bg-amber/5",
  red: "border-red/30 text-red bg-red/5",
  muted: "border-border-primary text-text-muted bg-bg-tertiary",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[10px] font-medium border rounded uppercase tracking-wider",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
