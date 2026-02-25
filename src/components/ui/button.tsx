import * as React from "react";
import { Slot as SlotPrimitive } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";

// Color map: define cada color UNA vez con todas sus variantes
const colorClasses = {
  // Color primary (del tema)
  primary: {
    text: "text-primary dark:text-blue-400",
    border: "border-primary dark:border-blue-500",
    bg: "bg-primary text-primary-foreground dark:bg-blue-600",
    bgSolid: "bg-primary text-primary-foreground dark:bg-blue-600", // Para default/secondary/destructive
    hoverSolid: "hover:bg-primary/90 dark:hover:bg-blue-600", // Para default/secondary/destructive
    hoverOutline:
      "hover:bg-primary/5 dark:hover:bg-blue-950 hover:text-primary dark:hover:text-blue-400", // Para outline/tertiary/ghost
  },

  muted: {
    text: "text-muted-foreground",
    border: "border-muted-foreground",
    bg: "bg-muted text-muted-foreground",
    bgSolid: "bg-muted text-foreground",
    hoverSolid: "hover:bg-muted/90",
    hoverOutline: "hover:bg-muted/50 hover:text-muted-foreground",
  },

  // Colores grises
  slate: {
    text: "text-slate-500 dark:text-slate-400",
    border: "border-slate-500 dark:border-slate-400",
    bg: "bg-slate-500 dark:bg-slate-600 text-white",
    bgSolid: "bg-slate-500 dark:bg-slate-600 text-white",
    hoverSolid: "hover:bg-slate-600 dark:hover:bg-slate-700",
    hoverOutline:
      "hover:bg-slate-50 dark:hover:bg-slate-950 hover:text-slate-600 dark:hover:text-slate-400",
  },
  gray: {
    text: "text-gray-500 dark:text-gray-400",
    border: "border-gray-500 dark:border-gray-400",
    bg: "bg-gray-500 dark:bg-gray-600 text-white",
    bgSolid: "bg-gray-500 dark:bg-gray-600 text-white",
    hoverSolid: "hover:bg-gray-600 dark:hover:bg-gray-700",
    hoverOutline:
      "hover:bg-gray-50 dark:hover:bg-gray-950 hover:text-gray-600 dark:hover:text-gray-400",
  },
  zinc: {
    text: "text-zinc-500 dark:text-zinc-400",
    border: "border-zinc-500 dark:border-zinc-400",
    bg: "bg-zinc-500 dark:bg-zinc-600 text-white",
    bgSolid: "bg-zinc-500 dark:bg-zinc-600 text-white",
    hoverSolid: "hover:bg-zinc-600 dark:hover:bg-zinc-700",
    hoverOutline:
      "hover:bg-zinc-50 dark:hover:bg-zinc-950 hover:text-zinc-600 dark:hover:text-zinc-400",
  },
  neutral: {
    text: "text-neutral-500 dark:text-neutral-400",
    border: "border-neutral-500 dark:border-neutral-400",
    bg: "bg-neutral-500 dark:bg-neutral-600 text-white",
    bgSolid: "bg-neutral-500 dark:bg-neutral-600 text-white",
    hoverSolid: "hover:bg-neutral-600 dark:hover:bg-neutral-700",
    hoverOutline:
      "hover:bg-neutral-50 dark:hover:bg-neutral-950 hover:text-neutral-600 dark:hover:text-neutral-400",
  },
  stone: {
    text: "text-stone-500 dark:text-stone-400",
    border: "border-stone-500 dark:border-stone-400",
    bg: "bg-stone-500 dark:bg-stone-600 text-white",
    bgSolid: "bg-stone-500 dark:bg-stone-600 text-white",
    hoverSolid: "hover:bg-stone-600 dark:hover:bg-stone-700",
    hoverOutline:
      "hover:bg-stone-50 dark:hover:bg-stone-950 hover:text-stone-600 dark:hover:text-stone-400",
  },

  // Rojos
  red: {
    text: "text-red-500 dark:text-red-400",
    border: "border-red-500 dark:border-red-400",
    bg: "bg-red-500 dark:bg-red-600 text-white",
    bgSolid: "bg-red-500 dark:bg-red-600 text-white",
    hoverSolid: "hover:bg-red-600 dark:hover:bg-red-700",
    hoverOutline:
      "hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 dark:hover:text-red-400",
  },
  rose: {
    text: "text-rose-500 dark:text-rose-400",
    border: "border-rose-500 dark:border-rose-400",
    bg: "bg-rose-500 dark:bg-rose-600 text-white",
    bgSolid: "bg-rose-500 dark:bg-rose-600 text-white",
    hoverSolid: "hover:bg-rose-600 dark:hover:bg-rose-700",
    hoverOutline:
      "hover:bg-rose-50 dark:hover:bg-rose-950 hover:text-rose-600 dark:hover:text-rose-400",
  },

  // Naranjas
  orange: {
    text: "text-orange-500 dark:text-orange-400",
    border: "border-orange-500 dark:border-orange-400",
    bg: "bg-orange-500 dark:bg-orange-600 text-white",
    bgSolid: "bg-orange-500 dark:bg-orange-600 text-white",
    hoverSolid: "hover:bg-orange-600 dark:hover:bg-orange-700",
    hoverOutline:
      "hover:bg-orange-50 dark:hover:bg-orange-950 hover:text-orange-600 dark:hover:text-orange-400",
  },
  amber: {
    text: "text-amber-500 dark:text-amber-400",
    border: "border-amber-500 dark:border-amber-400",
    bg: "bg-amber-500 dark:bg-amber-600 text-white",
    bgSolid: "bg-amber-500 dark:bg-amber-600 text-white",
    hoverSolid: "hover:bg-amber-600 dark:hover:bg-amber-700",
    hoverOutline:
      "hover:bg-amber-50 dark:hover:bg-amber-950 hover:text-amber-600 dark:hover:text-amber-400",
  },

  // Amarillos
  yellow: {
    text: "text-yellow-500 dark:text-yellow-400",
    border: "border-yellow-500 dark:border-yellow-400",
    bg: "bg-yellow-500 dark:bg-yellow-600 text-white",
    bgSolid: "bg-yellow-500 dark:bg-yellow-600 text-white",
    hoverSolid: "hover:bg-yellow-600 dark:hover:bg-yellow-700",
    hoverOutline:
      "hover:bg-yellow-50 dark:hover:bg-yellow-950 hover:text-yellow-600 dark:hover:text-yellow-400",
  },

  // Verdes
  lime: {
    text: "text-lime-500 dark:text-lime-400",
    border: "border-lime-500 dark:border-lime-400",
    bg: "bg-lime-500 dark:bg-lime-600 text-white",
    bgSolid: "bg-lime-500 dark:bg-lime-600 text-white",
    hoverSolid: "hover:bg-lime-600 dark:hover:bg-lime-700",
    hoverOutline:
      "hover:bg-lime-50 dark:hover:bg-lime-950 hover:text-lime-600 dark:hover:text-lime-400",
  },
  green: {
    text: "text-green-500 dark:text-green-400",
    border: "border-green-500 dark:border-green-400",
    bg: "bg-green-500 dark:bg-green-600 text-white",
    bgSolid: "bg-green-500 dark:bg-green-600 text-white",
    hoverSolid: "hover:bg-green-600 dark:hover:bg-green-700",
    hoverOutline:
      "hover:bg-green-50 dark:hover:bg-green-950 hover:text-green-600 dark:hover:text-green-400",
  },
  emerald: {
    text: "text-emerald-500 dark:text-emerald-400",
    border: "border-emerald-500 dark:border-emerald-400",
    bg: "bg-emerald-500 dark:bg-emerald-600 text-white",
    bgSolid: "bg-emerald-500 dark:bg-emerald-600 text-white",
    hoverSolid: "hover:bg-emerald-600 dark:hover:bg-emerald-700",
    hoverOutline:
      "hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-600 dark:hover:text-emerald-400",
  },
  teal: {
    text: "text-teal-500 dark:text-teal-400",
    border: "border-teal-500 dark:border-teal-400",
    bg: "bg-teal-500 dark:bg-teal-600 text-white",
    bgSolid: "bg-teal-500 dark:bg-teal-600 text-white",
    hoverSolid: "hover:bg-teal-600 dark:hover:bg-teal-700",
    hoverOutline:
      "hover:bg-teal-50 dark:hover:bg-teal-950 hover:text-teal-600 dark:hover:text-teal-400",
  },

  // Azules
  cyan: {
    text: "text-cyan-500 dark:text-cyan-400",
    border: "border-cyan-500 dark:border-cyan-400",
    bg: "bg-cyan-500 dark:bg-cyan-600 text-white",
    bgSolid: "bg-cyan-500 dark:bg-cyan-600 text-white",
    hoverSolid: "hover:bg-cyan-600 dark:hover:bg-cyan-700",
    hoverOutline:
      "hover:bg-cyan-50 dark:hover:bg-cyan-950 hover:text-cyan-600 dark:hover:text-cyan-400",
  },
  sky: {
    text: "text-sky-500 dark:text-sky-400",
    border: "border-sky-500 dark:border-sky-400",
    bg: "bg-sky-500 dark:bg-sky-600 text-white",
    bgSolid: "bg-sky-500 dark:bg-sky-600 text-white",
    hoverSolid: "hover:bg-sky-600 dark:hover:bg-sky-700",
    hoverOutline:
      "hover:bg-sky-50 dark:hover:bg-sky-950 hover:text-sky-600 dark:hover:text-sky-400",
  },
  blue: {
    text: "text-blue-500 dark:text-blue-400",
    border: "border-blue-500 dark:border-blue-400",
    bg: "bg-blue-500 dark:bg-blue-600 text-white",
    bgSolid: "bg-blue-500 dark:bg-blue-600 text-white",
    hoverSolid: "hover:bg-blue-600 dark:hover:bg-blue-700",
    hoverOutline:
      "hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 dark:hover:text-blue-400",
  },
  indigo: {
    text: "text-indigo-500 dark:text-indigo-400",
    border: "border-indigo-500 dark:border-indigo-400",
    bg: "bg-indigo-500 dark:bg-indigo-600 text-white",
    bgSolid: "bg-indigo-500 dark:bg-indigo-600 text-white",
    hoverSolid: "hover:bg-indigo-600 dark:hover:bg-indigo-700",
    hoverOutline:
      "hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 dark:hover:text-indigo-400",
  },
  violet: {
    text: "text-violet-500 dark:text-violet-400",
    border: "border-violet-500 dark:border-violet-400",
    bg: "bg-violet-500 dark:bg-violet-600 text-white",
    bgSolid: "bg-violet-500 dark:bg-violet-600 text-white",
    hoverSolid: "hover:bg-violet-600 dark:hover:bg-violet-700",
    hoverOutline:
      "hover:bg-violet-50 dark:hover:bg-violet-950 hover:text-violet-600 dark:hover:text-violet-400",
  },

  // Morados
  purple: {
    text: "text-purple-500 dark:text-purple-400",
    border: "border-purple-500 dark:border-purple-400",
    bg: "bg-purple-500 dark:bg-purple-600 text-white",
    bgSolid: "bg-purple-500 dark:bg-purple-600 text-white",
    hoverSolid: "hover:bg-purple-600 dark:hover:bg-purple-700",
    hoverOutline:
      "hover:bg-purple-50 dark:hover:bg-purple-950 hover:text-purple-600 dark:hover:text-purple-400",
  },
  fuchsia: {
    text: "text-fuchsia-500 dark:text-fuchsia-400",
    border: "border-fuchsia-500 dark:border-fuchsia-400",
    bg: "bg-fuchsia-500 dark:bg-fuchsia-600 text-white",
    bgSolid: "bg-fuchsia-500 dark:bg-fuchsia-600 text-white",
    hoverSolid: "hover:bg-fuchsia-600 dark:hover:bg-fuchsia-700",
    hoverOutline:
      "hover:bg-fuchsia-50 dark:hover:bg-fuchsia-950 hover:text-fuchsia-600 dark:hover:text-fuchsia-400",
  },
  pink: {
    text: "text-pink-500 dark:text-pink-400",
    border: "border-pink-500 dark:border-pink-400",
    bg: "bg-pink-500 dark:bg-pink-600 text-white",
    bgSolid: "bg-pink-500 dark:bg-pink-600 text-white",
    hoverSolid: "hover:bg-pink-600 dark:hover:bg-pink-700",
    hoverOutline:
      "hover:bg-pink-50 dark:hover:bg-pink-950 hover:text-pink-600 dark:hover:text-pink-400",
  },
} as const;

// Generar compound variants automáticamente desde el color map
const colorKeys = Object.keys(colorClasses) as Array<keyof typeof colorClasses>;

export type ButtonColor = keyof typeof colorClasses;

const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Solo estructura, sin colores
        default: "",
        destructive: "",
        outline: "border bg-background",
        secondary: "",
        ghost: "",
        link: "underline-offset-4 hover:underline",
        neutral: "bg-background text-foreground",
        tertiary: "border bg-background",
      },
      color: Object.fromEntries(colorKeys.map((key) => [key, ""])) as Record<
        keyof typeof colorClasses,
        string
      >,
      size: {
        default: "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-8",
        "icon-xs": "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    compoundVariants: [
      // ============================================
      // COLORES POR DEFECTO (sin especificar color)
      // ============================================
      {
        variant: "default",
        color: undefined,
        class: "bg-primary text-primary-foreground hover:bg-primary/90",
      },
      {
        variant: "destructive",
        color: undefined,
        class:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      {
        variant: "outline",
        color: undefined,
        class: "hover:bg-accent ",
      },
      {
        variant: "secondary",
        color: undefined,
        class: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      },
      {
        variant: "ghost",
        color: undefined,
        class: "hover:bg-accent hover:text-accent-foreground",
      },
      {
        variant: "link",
        color: undefined,
        class: "text-primary",
      },
      {
        variant: "tertiary",
        color: undefined,
        class: "bg-tertiary text-tertiary-foreground hover:bg-tertiary/80",
      },

      // ============================================
      // COLORES PERSONALIZADOS
      // ============================================

      // Default (solid) + colores
      ...colorKeys.map((color) => ({
        variant: "default" as const,
        color,
        class: `${colorClasses[color].bgSolid} ${colorClasses[color].hoverSolid}`,
      })),

      // Outline + colores
      ...colorKeys.map((color) => ({
        variant: "outline" as const,
        color,
        class: `${colorClasses[color].text} ${colorClasses[color].hoverOutline}`,
      })),

      // Ghost + colores
      ...colorKeys.map((color) => ({
        variant: "ghost" as const,
        color,
        class: `${colorClasses[color].text} ${colorClasses[color].hoverOutline}`,
      })),

      // Secondary + colores
      ...colorKeys.map((color) => ({
        variant: "secondary" as const,
        color,
        class: `${colorClasses[color].bgSolid} ${colorClasses[color].hoverSolid}`,
      })),

      // Tertiary + colores
      ...colorKeys.map((color) => ({
        variant: "tertiary" as const,
        color,
        class: `${colorClasses[color].text} ${colorClasses[color].border} ${colorClasses[color].hoverOutline}`,
      })),

      // Destructive + colores
      ...colorKeys.map((color) => ({
        variant: "destructive" as const,
        color,
        class: `${colorClasses[color].bgSolid} ${colorClasses[color].hoverSolid}`,
      })),

      // Link + colores
      ...colorKeys.map((color) => ({
        variant: "link" as const,
        color,
        class: `${colorClasses[color].text}`,
      })),
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  tooltip?: React.ReactNode; // ✅ puede ser string o JSX
  delayDuration?: number;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      color,
      asChild = false,
      tooltip,
      delayDuration,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? SlotPrimitive.Slot : "button";

    const button = (
      <Comp
        className={cn(buttonVariants({ variant, size, color, className }))}
        ref={ref}
        {...props}
      />
    );

    return tooltip ? (
      <Tooltip
        delayDuration={delayDuration ?? 300}
        disableHoverableContent={true}
      >
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    ) : (
      button
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
