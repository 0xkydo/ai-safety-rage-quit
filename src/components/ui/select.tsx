import { cn } from "@/lib/utils";
import { type SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: { value: string; label: string }[];
};

export function Select({ label, options, className, id, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-[10px] text-text-muted uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          "bg-bg-primary border border-border-secondary rounded-sm px-3 py-2 text-xs text-text-primary",
          "focus:outline-none focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/20",
          "transition-colors duration-150 cursor-pointer appearance-none",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
