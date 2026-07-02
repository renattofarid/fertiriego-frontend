import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface FinancialSummaryCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  variant: "primary" | "destructive" | "muted" | "orange" | "green";
}

export function FinancialSummaryCard({
  title,
  value,
  description,
  icon: Icon,
  variant,
}: FinancialSummaryCardProps) {
  const variantStyles = {
    primary: "bg-primary/5",
    destructive: "bg-destructive/5",
    muted: "bg-muted-foreground/5",
    orange: "bg-orange-500/5",
    green: "bg-emerald-500/5",
  };

  // const iconBgStyles = {
  //   primary: "bg-primary/10",
  //   destructive: "bg-destructive/10",
  //   muted: "bg-muted-foreground/10",
  //   orange: "bg-orange-500/10",
  //   green: "bg-emerald-500/10",
  // };

  const textStyles = {
    primary: "text-primary",
    destructive: "text-destructive",
    muted: "text-muted-foreground",
    orange: "text-orange-600 dark:text-orange-400",
    green: "text-emerald-600 dark:text-emerald-400",
  };

  return (
    <div
      className={cn(
        "rounded-xl p-5 relative overflow-hidden",
        variantStyles[variant],
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <Icon
          className={cn(
            "size-16 absolute top-3 right-3 opacity-10",
            textStyles[variant],
          )}
        />
        <div>
          <p className="text-sm font-medium text-muted-foreground line-clamp-1">{title}</p>
          <p className={cn("text-xl font-bold line-clamp-1", textStyles[variant])}>
            {value}
          </p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
    </div>
  );
}
