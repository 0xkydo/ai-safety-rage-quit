import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
};

const variantClasses = {
  primary:
    "bg-neon-green/10 text-neon-green border-neon-green/30 hover:bg-neon-green/20 active:bg-neon-green/30",
  secondary:
    "bg-bg-tertiary text-text-secondary border-border-secondary hover:text-text-primary hover:border-text-muted",
  ghost:
    "bg-transparent text-text-secondary border-transparent hover:text-text-primary hover:bg-bg-tertiary",
  danger:
    "bg-red/10 text-red border-red/30 hover:bg-red/20 active:bg-red/30",
};

const sizeClasses = {
  sm: "px-2 py-1 text-[10px]",
  md: "px-3 py-1.5 text-xs",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 border rounded font-medium transition-all duration-150 cursor-pointer",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
