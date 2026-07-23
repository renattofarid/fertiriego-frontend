import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface FinancialSummaryCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  variant: "primary" | "destructive" | "muted";
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
  };

  const iconBgStyles = {
    primary: "bg-primary/10",
    destructive: "bg-destructive/10",
    muted: "bg-muted-foreground/10",
  };

  const textStyles = {
    primary: "text-primary",
    destructive: "text-destructive",
    muted: "text-muted-foreground",
  };

  return (
    <div className={cn("rounded-xl p-5", variantStyles[variant])}>
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("p-2 rounded-lg", iconBgStyles[variant])}>
          <Icon className={cn("h-5 w-5", textStyles[variant])} />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn("text-xl font-bold", textStyles[variant])}>
            {value}
          </p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
