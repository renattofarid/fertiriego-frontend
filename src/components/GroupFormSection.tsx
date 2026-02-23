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
    "2xl"?: 1 | 2 | 3 | 4 | 5 | 6;
  };
  className?: string;
  gap?: string;
  headerExtra?: ReactNode;
}

const colsMap = {
  sm: {
    1: "sm:grid-cols-1",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-4",
    5: "sm:grid-cols-5",
    6: "sm:grid-cols-6",
  },
  md: {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    5: "md:grid-cols-5",
    6: "md:grid-cols-6",
  },
  lg: {
    1: "lg:grid-cols-1",
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
    5: "lg:grid-cols-5",
    6: "lg:grid-cols-6",
  },
  xl: {
    1: "xl:grid-cols-1",
    2: "xl:grid-cols-2",
    3: "xl:grid-cols-3",
    4: "xl:grid-cols-4",
    5: "xl:grid-cols-5",
    6: "xl:grid-cols-6",
  },
  "2xl": {
    1: "2xl:grid-cols-1",
    2: "2xl:grid-cols-2",
    3: "2xl:grid-cols-3",
    4: "2xl:grid-cols-4",
    5: "2xl:grid-cols-5",
    6: "2xl:grid-cols-6",
  },
} as const;

export const GroupFormSection = ({
  title,
  icon: Icon,
  iconColor = "text-primary dark:text-primary-foreground",
  bgColor = "bg-muted",
  children,
  cols = { sm: 2, md: 3, lg: 4 },
  className,
  gap = "gap-3",
  headerExtra,
}: FormSectionProps) => {
  const gridClasses = [
    "grid",
    "grid-cols-1",
    cols.sm && colsMap.sm[cols.sm],
    cols.md && colsMap.md[cols.md],
    cols.lg && colsMap.lg[cols.lg],
    cols.xl && colsMap.xl[cols.xl],
    cols["2xl"] && colsMap["2xl"][cols["2xl"]],
    gap,
    "items-start",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={cn(
        `bg-background rounded-md border border-muted shadow-sm overflow-hidden`,
        className,
      )}
    >
      <div className={`${bgColor} px-3 py-1.5 border-b border-muted`}>
        <div className="flex flex-row flex-wrap justify-between sm:items-center gap-3">
          <h3
            className={cn(
              "text-sm md:text-base font-semibold flex items-center",
              iconColor,
            )}
          >
            <Icon className={`size-4 md:size-5 mr-2`} />
            {title}
          </h3>
          {headerExtra}
        </div>
      </div>
      <div className="p-3">
        <div className={cn(gridClasses)}>{children}</div>
      </div>
    </div>
  );
};
