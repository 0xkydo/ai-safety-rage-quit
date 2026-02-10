import { cn } from "@/lib/utils";
import { type TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-[10px] text-text-muted uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          "bg-bg-primary border border-border-secondary rounded-sm px-3 py-2 text-xs text-text-primary",
          "placeholder:text-text-muted",
          "focus:outline-none focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/20",
          "transition-colors duration-150 resize-y min-h-[80px]",
          error && "border-red/50",
          className
        )}
        {...props}
      />
      {error && <span className="text-[10px] text-red">{error}</span>}
    </div>
  );
}
