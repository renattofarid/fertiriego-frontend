import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        tertiary:
          "border-transparent-foreground bg-tertiary text-tertiary-foreground hover:bg-tertiary/80",
        destructive:
          "border-transparent bg-destructive text-white hover:bg-destructive/80",
        outline: "text-foreground",
        ghost:
          "border-transparent bg-ghost text-ghost-foreground hover:bg-ghost/80",
        orange:
          "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950 dark:text-orange-200 dark:border-orange-800",
        green:
          "bg-green-100 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-200 dark:border-green-800",
        blue: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800",
        red: "bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-200 dark:border-red-800",
        yellow:
          "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-200 dark:border-yellow-800",
        purple:
          "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-800",
        pink: "bg-pink-100 text-pink-700 border-pink-300 dark:bg-pink-950 dark:text-pink-200 dark:border-pink-800",
        indigo:
          "bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-200 dark:border-indigo-800",
        teal: "bg-teal-100 text-teal-700 border-teal-300 dark:bg-teal-950 dark:text-teal-200 dark:border-teal-800",
        cyan: "bg-cyan-100 text-cyan-700 border-cyan-300 dark:bg-cyan-950 dark:text-cyan-200 dark:border-cyan-800",
        gray: "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-950 dark:text-gray-200 dark:border-gray-800",
        amber:
          "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "h-fit py-0.25 px-2 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export type BadgeCustomProps = BadgeProps & {
  tooltip?: React.ReactNode;
  tooltipVariant?: "default" | "secondary" | "tertiary";
};

function getTooltipVariant(variant: BadgeCustomProps["tooltipVariant"]) {
  switch (variant) {
    case "secondary":
      return "!bg-secondary !text-secondary-foreground !fill-secondary";
    case "tertiary":
      return "!bg-tertiary !text-tertiary-foreground !fill-tertiary";
    default:
      return "!bg-primary !text-primary-foreground !fill-primary";
  }
}

function Badge({
  className,
  variant,
  size,
  tooltipVariant,
  tooltip,
  ...props
}: BadgeCustomProps) {
  return tooltip ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(badgeVariants({ variant, size }), className)}
          {...props}
        />
      </TooltipTrigger>
      <TooltipContent className={cn(getTooltipVariant(tooltipVariant))}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  ) : (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
