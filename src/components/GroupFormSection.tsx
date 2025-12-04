import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface FormSectionProps {
  title: string;
  icon: LucideIcon;
  iconColor?: string;
  bgColor?: string;
  children: ReactNode;
  cols?: {
    sm?: 1 | 2 | 3 | 4 | 5 | 6;
    md?: 1 | 2 | 3 | 4 | 5 | 6;
    lg?: 1 | 2 | 3 | 4 | 5 | 6;
    xl?: 1 | 2 | 3 | 4 | 5 | 6;
  };
  className?: string;
  gap?: string;
}

export const GroupFormSection = ({
  title,
  icon: Icon,
  iconColor = "text-primary dark:text-primary-foreground",
  bgColor = "bg-muted",
  children,
  cols = { sm: 2, md: 3, lg: 4 },
  className,
  gap = "gap-6",
}: FormSectionProps) => {
  const gridClasses = [
    "grid",
    "grid-cols-1",
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    gap,
    "items-start",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={cn(
        `bg-background rounded-md border border-muted shadow-sm overflow-hidden`,
        className
      )}
    >
      <div className={`${bgColor} px-6 py-2.5 border-b border-muted`}>
        <h3
          className={cn("text-base font-semibold flex items-center", iconColor)}
        >
          <Icon className={`size-5 mr-2`} />
          {title}
        </h3>
      </div>
      <div className="p-6">
        <div className={cn(gridClasses)}>{children}</div>
      </div>
    </div>
  );
};
