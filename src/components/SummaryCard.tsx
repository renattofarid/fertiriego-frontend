import { cn } from "@/lib/utils";
import type { ButtonColor } from "@/components/ui/button";

const cardColors: Record<ButtonColor, { icon: string }> = {
  primary: { icon: "text-primary dark:text-blue-400" },
  muted:   { icon: "text-muted-foreground" },
  slate:   { icon: "text-slate-500 dark:text-slate-400" },
  gray:    { icon: "text-gray-500 dark:text-gray-400" },
  zinc:    { icon: "text-zinc-500 dark:text-zinc-400" },
  neutral: { icon: "text-neutral-500 dark:text-neutral-400" },
  stone:   { icon: "text-stone-500 dark:text-stone-400" },
  red:     { icon: "text-red-500 dark:text-red-400" },
  rose:    { icon: "text-rose-500 dark:text-rose-400" },
  orange:  { icon: "text-orange-500 dark:text-orange-400" },
  amber:   { icon: "text-amber-500 dark:text-amber-400" },
  yellow:  { icon: "text-yellow-500 dark:text-yellow-400" },
  lime:    { icon: "text-lime-500 dark:text-lime-400" },
  green:   { icon: "text-green-500 dark:text-green-400" },
  emerald: { icon: "text-emerald-500 dark:text-emerald-400" },
  teal:    { icon: "text-teal-500 dark:text-teal-400" },
  cyan:    { icon: "text-cyan-500 dark:text-cyan-400" },
  sky:     { icon: "text-sky-500 dark:text-sky-400" },
  blue:    { icon: "text-blue-500 dark:text-blue-400" },
  indigo:  { icon: "text-indigo-500 dark:text-indigo-400" },
  violet:  { icon: "text-violet-500 dark:text-violet-400" },
  purple:  { icon: "text-purple-500 dark:text-purple-400" },
  fuchsia: { icon: "text-fuchsia-500 dark:text-fuchsia-400" },
  pink:    { icon: "text-pink-500 dark:text-pink-400" },
};

export interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subLabel?: string;
  color?: ButtonColor;
  className?: string;
}

export function SummaryCard({
  icon,
  label,
  value,
  subLabel,
  color = "primary",
  className,
}: SummaryCardProps) {
  const { icon: iconClass } = cardColors[color];

  return (
    <div className={cn("rounded-lg bg-muted/50 px-4 py-3", className)}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide leading-none">
          {label}
        </span>
        <span className={cn("opacity-70", iconClass)}>{icon}</span>
      </div>
      <p className="text-xl font-semibold leading-tight tracking-tight">{value}</p>
      {subLabel && (
        <p className="text-xs text-muted-foreground mt-0.5">{subLabel}</p>
      )}
    </div>
  );
}
