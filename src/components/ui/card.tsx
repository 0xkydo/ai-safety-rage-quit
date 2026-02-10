import { cn } from "@/lib/utils";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "border border-border-primary bg-bg-secondary rounded-sm p-4",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "border-b border-border-primary pb-3 mb-3 flex items-center justify-between",
        className
      )}
    >
      {children}
    </div>
  );
}
